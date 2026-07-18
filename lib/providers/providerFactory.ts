import { ProviderRegistry } from "@/lib/providers/providerRegistry";
import { SafeProvider } from "@/lib/providers/safeProvider";
import type { AIProvider } from "@/lib/providers/types";
import { configurationService } from "@/services/configurationService";

export class ProviderFactory {
  private readonly registry: ProviderRegistry;

  constructor(registry?: ProviderRegistry) {
    this.registry = registry ?? new ProviderRegistry();
  }

  createProvider(key: string): AIProvider {
    const provider = this.registry.getProvider(this.normalizeKey(key));
    const fallback = this.registry.getProvider("mock");
    return new SafeProvider(provider, fallback);
  }

  createConfiguredProvider(): AIProvider {
    const settings = configurationService.getSettings();
    return this.createProvider(settings.provider);
  }

  listProviders(): AIProvider[] {
    return this.registry.listProviders();
  }

  private normalizeKey(key: string): string {
    const normalized = key.toLowerCase().trim();

    if (normalized === "mock") {
      return "mock";
    }

    if (normalized === "openrouter") {
      return "openrouter";
    }

    if (normalized === "openai") {
      return "openai";
    }

    if (normalized === "claude" || normalized === "anthropic") {
      return "anthropic";
    }

    if (normalized === "gemini") {
      return "gemini";
    }

    if (normalized === "deepseek") {
      return "deepseek";
    }

    return normalized;
  }
}

export const providerFactory = new ProviderFactory();
