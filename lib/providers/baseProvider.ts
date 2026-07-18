import type { AIProvider, AIProviderRequest, AIProviderResponse } from "@/lib/providers/types";

export abstract class BaseProvider implements AIProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly model: string;

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    const content = `No remote model response is configured for ${this.name}. AgentForge will continue with its deterministic artifact pipeline.`;

    return {
      provider: this.name,
      model: this.model,
      content,
      usage: {
        promptTokens: request.prompt.length,
        completionTokens: 0,
        totalTokens: request.prompt.length,
      },
    };
  }

  async *stream(request: AIProviderRequest): AsyncIterable<string> {
    void request;
    const content = `No remote model response is configured for ${this.name}. AgentForge will continue with its deterministic artifact pipeline.`;
    const chunks = content.split(/(\s+)/);

    for (const chunk of chunks) {
      yield chunk;
    }
  }

  async healthCheck(): Promise<boolean> {
    return this.validateKey?.() ?? true;
  }

  async validateKey(): Promise<boolean> {
    return true;
  }
}
