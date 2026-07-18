import { AnthropicClaudeProvider } from "@/lib/providers/anthropicProvider";
import { DeepSeekProvider } from "@/lib/providers/deepseekProvider";
import { GeminiProvider } from "@/lib/providers/geminiProvider";
import { MockProvider } from "@/lib/providers/mockProvider";
import { OpenAIProvider } from "@/lib/providers/openaiProvider";
import { OpenRouterProvider } from "@/lib/providers/openRouterProvider";
import type { AIProvider } from "@/lib/providers/types";

export class ProviderRegistry {
  private readonly providers: Record<string, AIProvider>;

  constructor() {
    this.providers = {
      mock: new MockProvider(),
      openai: new OpenAIProvider(),
      anthropic: new AnthropicClaudeProvider(),
      gemini: new GeminiProvider(),
      deepseek: new DeepSeekProvider(),
      openrouter: new OpenRouterProvider(),
    };
  }

  getProvider(key: string): AIProvider {
    return this.providers[key.toLowerCase()] ?? this.providers.mock;
  }

  listProviders(): AIProvider[] {
    return Object.values(this.providers);
  }
}
