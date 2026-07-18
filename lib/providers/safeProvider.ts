import { ProviderError } from "@/lib/providers/providerError";
import type { AIProvider, AIProviderRequest, AIProviderResponse } from "@/lib/providers/types";

export class SafeProvider implements AIProvider {
  readonly id: string;
  readonly name: string;
  readonly model: string;

  constructor(private readonly delegate: AIProvider, private readonly fallback: AIProvider) {
    this.id = delegate.id;
    this.name = delegate.name;
    this.model = delegate.model;
  }

  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    try {
      return await this.delegate.generate(request);
    } catch (error) {
      return this.handleFailure(error, request);
    }
  }

  async *stream(request: AIProviderRequest): AsyncIterable<string> {
    try {
      if (typeof this.delegate.stream === "function") {
        yield* this.delegate.stream(request);
        return;
      }

      const response = await this.generate(request);
      const chunks = response.content.split(/(\s+)/);
      for (const chunk of chunks) {
        yield chunk;
      }
    } catch (error) {
      const response = await this.handleFailure(error, request);
      const chunks = response.content.split(/(\s+)/);
      for (const chunk of chunks) {
        yield chunk;
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await this.delegate.healthCheck?.() ?? true;
    } catch {
      return false;
    }
  }

  async validateKey(): Promise<boolean> {
    try {
      return await this.delegate.validateKey?.() ?? false;
    } catch {
      return false;
    }
  }

  private async handleFailure(error: unknown, request: AIProviderRequest): Promise<AIProviderResponse> {
    if (error instanceof ProviderError) {
      return this.fallback.generate({
        ...request,
        prompt: `${request.prompt}\n${error.message}`,
      });
    }

    if (error instanceof Error) {
      return this.fallback.generate({
        ...request,
        prompt: `${request.prompt}\n${error.message}`,
      });
    }

    return this.fallback.generate({
      ...request,
      prompt: `${request.prompt}\nProvider error occurred. Falling back to MockProvider.`,
    });
  }
}
