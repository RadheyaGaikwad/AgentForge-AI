import { BaseProvider } from "@/lib/providers/baseProvider";
import { ProviderError } from "@/lib/providers/providerError";
import { ProviderRouter } from "@/lib/providers/providerRouter";
import { configurationService } from "@/services/configurationService";
import { executionAnalytics } from "@/services/executionAnalytics";
import type { AIProviderRequest, AIProviderResponse } from "@/lib/providers/types";

interface OpenRouterChatCompletionPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenRouterChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string };
    delta?: { content?: string };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export class OpenRouterProvider extends BaseProvider {
  readonly id = "openrouter";
  readonly name = "OpenRouter";
  readonly model = "openrouter/auto";

  private readonly router = new ProviderRouter();

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    const settings = configurationService.getSettings();
    const apiKey = settings.apiKey?.trim();
    const modelCandidates = this.resolveModelCandidates(request, settings.model);

    if (!settings.streaming) {
      throw new ProviderError("Streaming is disabled in configuration.", "invalid-configuration");
    }

    if (!apiKey) {
      throw new ProviderError("Missing API key for OpenRouter. Falling back to MockProvider.", "missing-api-key");
    }

    const firstCandidate = modelCandidates[0];
    if (!firstCandidate || firstCandidate === "Mock Agent") {
      throw new ProviderError("Invalid OpenRouter configuration. Falling back to MockProvider.", "invalid-configuration");
    }

    let lastError: unknown;

    for (const model of modelCandidates) {
      const payload: OpenRouterChatCompletionPayload = {
        model,
        messages: this.buildMessages(request),
        temperature: request.temperature ?? settings.temperature,
        max_tokens: request.maxTokens ?? settings.maxTokens,
        stream: false,
      };

      try {
        const response = await this.requestWithRetry<OpenRouterChatCompletionResponse>(() => this.executeRequest(payload, false, apiKey, settings.baseUrl));
        const content = this.extractContent(response);

        if (!content) {
          throw new ProviderError("OpenRouter returned an empty response.", "provider-error");
        }

        executionAnalytics.recordProvider(this.name, model);
        executionAnalytics.recordTokens(response.usage?.total_tokens ?? content.length);

        return {
          provider: this.name,
          model,
          content,
          usage: {
            promptTokens: response.usage?.prompt_tokens,
            completionTokens: response.usage?.completion_tokens,
            totalTokens: response.usage?.total_tokens,
          },
        };
      } catch (error) {
        lastError = error;
        executionAnalytics.recordError();

        if (error instanceof ProviderError && error.reason === "timeout") {
          executionAnalytics.recordTimeout();
        }

        if (model !== modelCandidates[modelCandidates.length - 1]) {
          executionAnalytics.recordFallback();
        }
      }
    }

    throw lastError instanceof Error ? lastError : new ProviderError("OpenRouter request failed.", "provider-error");
  }

  async *stream(request: AIProviderRequest): AsyncIterable<string> {
    const settings = configurationService.getSettings();
    const apiKey = settings.apiKey?.trim();
    const modelCandidates = this.resolveModelCandidates(request, settings.model);

    if (!settings.streaming) {
      throw new ProviderError("Streaming is disabled in configuration.", "invalid-configuration");
    }

    if (!apiKey) {
      throw new ProviderError("Missing API key for OpenRouter. Falling back to MockProvider.", "missing-api-key");
    }

    const firstCandidate = modelCandidates[0];
    if (!firstCandidate || firstCandidate === "Mock Agent") {
      throw new ProviderError("Invalid OpenRouter configuration. Falling back to MockProvider.", "invalid-configuration");
    }

    let lastError: unknown;

    for (const model of modelCandidates) {
      const payload: OpenRouterChatCompletionPayload = {
        model,
        messages: this.buildMessages(request),
        temperature: request.temperature ?? settings.temperature,
        max_tokens: request.maxTokens ?? settings.maxTokens,
        stream: true,
      };

      try {
        const response = await this.requestWithRetry<Response>(() => this.executeStreamingRequest(payload, apiKey, settings.baseUrl));

        if (!response.body) {
          throw new ProviderError("OpenRouter stream response did not include a body.", "provider-error");
        }

        executionAnalytics.recordProvider(this.name, model);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine.startsWith("data:")) {
                continue;
              }

              const payloadLine = trimmedLine.slice(5).trim();
              if (!payloadLine || payloadLine === "[DONE]") {
                continue;
              }

              const parsedChunk = JSON.parse(payloadLine) as OpenRouterChatCompletionResponse;
              const chunkContent = this.extractContent(parsedChunk);

              if (chunkContent) {
                yield chunkContent;
              }
            }
          }

          if (buffer.trim()) {
            const payloadLine = buffer.trim().replace(/^data:\s*/, "");
            if (payloadLine && payloadLine !== "[DONE]") {
              const parsedChunk = JSON.parse(payloadLine) as OpenRouterChatCompletionResponse;
              const chunkContent = this.extractContent(parsedChunk);
              if (chunkContent) {
                yield chunkContent;
              }
            }
          }

          return;
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        lastError = error;
        executionAnalytics.recordError();

        if (error instanceof ProviderError && error.reason === "timeout") {
          executionAnalytics.recordTimeout();
        }

        if (model !== modelCandidates[modelCandidates.length - 1]) {
          executionAnalytics.recordFallback();
        }
      }
    }

    throw lastError instanceof Error ? lastError : new ProviderError("OpenRouter stream failed.", "provider-error");
  }

  async healthCheck(): Promise<boolean> {
    const settings = configurationService.getSettings();
    const apiKey = settings.apiKey?.trim();

    if (!apiKey || !settings.baseUrl) {
      return false;
    }

    try {
      const response = await this.executeRequest(
        { model: this.resolveModelCandidates({ prompt: "health-check", taskType: "health", agentType: "system" }, settings.model)[0], messages: [{ role: "user", content: "health-check" }], stream: false },
        false,
        apiKey,
        settings.baseUrl,
      );

      return response.choices?.length ? true : false;
    } catch {
      return false;
    }
  }

  async validateKey(): Promise<boolean> {
    const settings = configurationService.getSettings();
    const apiKey = settings.apiKey?.trim();

    if (!apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${settings.baseUrl || DEFAULT_BASE_URL}/models`, {
        method: "GET",
        headers: this.buildHeaders(apiKey),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private resolveModelCandidates(request: AIProviderRequest, configuredModel?: string): string[] {
    const selectedModel = configuredModel && configuredModel !== "Mock Agent" && configuredModel !== "openrouter/auto"
      ? configuredModel
      : this.router.route({
        taskType: request.taskType,
        agentType: request.agentType,
        context: request.context,
      });

    const orderedFallbacks = this.router.getFallbackModels().filter((model) => model !== selectedModel);
    return [...new Set([selectedModel, ...orderedFallbacks])];
  }

  private buildMessages(request: AIProviderRequest): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    if (request.context) {
      messages.push({ role: "system", content: request.context });
    }

    messages.push({ role: "user", content: request.prompt });
    return messages;
  }

  private async requestWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= DEFAULT_MAX_RETRIES; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt >= DEFAULT_MAX_RETRIES) {
          throw error;
        }

        executionAnalytics.recordRetry();
        await new Promise((resolve) => globalThis.setTimeout(resolve, 150 * (attempt + 1)));
      }
    }

    throw lastError instanceof Error ? lastError : new ProviderError("OpenRouter request failed.", "provider-error");
  }

  private async executeRequest(
    payload: OpenRouterChatCompletionPayload,
    stream: boolean,
    apiKey: string,
    baseUrl: string,
  ): Promise<OpenRouterChatCompletionResponse> {
    const response = await this.fetchWithTimeout(`${baseUrl || DEFAULT_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: this.buildHeaders(apiKey),
      body: JSON.stringify({
        ...payload,
        stream,
      }),
    });

    if (!response.ok) {
      const reason = response.status === 401 || response.status === 403
        ? "missing-api-key"
        : response.status === 408 || response.status === 504
          ? "timeout"
          : "provider-error";

      throw new ProviderError(`OpenRouter request failed with status ${response.status}.`, reason);
    }

    return response.json() as Promise<OpenRouterChatCompletionResponse>;
  }

  private async executeStreamingRequest(
    payload: OpenRouterChatCompletionPayload,
    apiKey: string,
    baseUrl: string,
  ): Promise<Response> {
    const response = await this.fetchWithTimeout(`${baseUrl || DEFAULT_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: this.buildHeaders(apiKey),
      body: JSON.stringify({
        ...payload,
        stream: true,
      }),
    });

    if (!response.ok) {
      const reason = response.status === 401 || response.status === 403
        ? "missing-api-key"
        : response.status === 408 || response.status === 504
          ? "timeout"
          : "provider-error";

      throw new ProviderError(`OpenRouter stream failed with status ${response.status}.`, reason);
    }

    return response;
  }

  private async fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ProviderError("OpenRouter request timed out.", "timeout");
      }

      throw error;
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }

  private buildHeaders(apiKey: string): HeadersInit {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://agentforge-ai.local",
      "X-Title": "AgentForge AI",
    };
  }

  private extractContent(payload: OpenRouterChatCompletionResponse): string {
    const messageContent = payload.choices?.[0]?.message?.content;
    if (typeof messageContent === "string" && messageContent.trim().length > 0) {
      return messageContent.trim();
    }

    const deltaContent = payload.choices?.[0]?.delta?.content;
    if (typeof deltaContent === "string" && deltaContent.trim().length > 0) {
      return deltaContent.trim();
    }

    return "";
  }
}
