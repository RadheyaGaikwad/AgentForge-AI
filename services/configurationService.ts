import { BrowserStorageManager } from "@/services/storage/browserStorageManager";

export interface ProviderSettings {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  apiKey: string;
  baseUrl: string;
}

interface EnvironmentOverrides {
  provider?: string;
  model?: string;
  temperature?: string;
  maxTokens?: string;
  streaming?: string;
  apiKey?: string;
  baseUrl?: string;
}

const STORAGE_KEY = "agentforge.provider-settings";

const defaultSettings: ProviderSettings = {
  provider: "Mock",
  model: "Mock Agent",
  temperature: 0.7,
  maxTokens: 2048,
  streaming: true,
  apiKey: "",
  baseUrl: "https://openrouter.ai/api/v1",
};

export class ConfigurationService {
  private settings: ProviderSettings;

  constructor() {
    this.settings = this.resolveSettings();
  }

  getSettings(): ProviderSettings {
    return { ...this.settings };
  }

  updateSettings(nextSettings: Partial<ProviderSettings>): ProviderSettings {
    this.settings = {
      ...this.settings,
      ...nextSettings,
    };

    this.persist();
    return this.getSettings();
  }

  resetSettings(): ProviderSettings {
    this.settings = { ...defaultSettings, ...this.getEnvironmentOverrides() };
    this.persist();
    return this.getSettings();
  }

  private resolveSettings(): ProviderSettings {
    const environmentOverrides = this.getEnvironmentOverrides();
    const storageValue = this.readStorage();

    if (storageValue) {
      return {
        ...defaultSettings,
        ...environmentOverrides,
        ...storageValue,
      };
    }

    return {
      ...defaultSettings,
      ...environmentOverrides,
    };
  }

  private readStorage(): Partial<ProviderSettings> | null {
    return BrowserStorageManager.loadMetadata<Partial<ProviderSettings>>(STORAGE_KEY);
  }

  private persist(): void {
    if (typeof window === "undefined") {
      return;
    }

    BrowserStorageManager.saveMetadataDebounced(STORAGE_KEY, this.settings);
  }

  private getEnvironmentOverrides(): Partial<ProviderSettings> {
    const env = this.getEnvObject();

    return {
      provider: env.provider ?? defaultSettings.provider,
      model: env.model ?? defaultSettings.model,
      temperature: this.toNumber(env.temperature, defaultSettings.temperature),
      maxTokens: this.toNumber(env.maxTokens, defaultSettings.maxTokens),
      streaming: this.toBoolean(env.streaming, defaultSettings.streaming),
      apiKey: env.apiKey ?? defaultSettings.apiKey,
      baseUrl: env.baseUrl ?? defaultSettings.baseUrl,
    };
  }

  private getEnvObject(): EnvironmentOverrides {
    return {
      provider: process.env.NEXT_PUBLIC_AI_PROVIDER ?? process.env.AI_PROVIDER,
      model: process.env.NEXT_PUBLIC_AI_MODEL ?? process.env.AI_MODEL,
      temperature: process.env.NEXT_PUBLIC_AI_TEMPERATURE ?? process.env.AI_TEMPERATURE,
      maxTokens: process.env.NEXT_PUBLIC_AI_MAX_TOKENS ?? process.env.AI_MAX_TOKENS,
      streaming: process.env.NEXT_PUBLIC_AI_STREAMING ?? process.env.AI_STREAMING,
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ?? process.env.OPENROUTER_API_KEY ?? process.env.NEXT_PUBLIC_AI_API_KEY ?? process.env.AI_API_KEY,
      baseUrl: process.env.NEXT_PUBLIC_OPENROUTER_BASE_URL ?? process.env.OPENROUTER_BASE_URL,
    };
  }

  private toNumber(value: string | undefined, fallback: number): number {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : fallback;
  }

  private toBoolean(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined) {
      return fallback;
    }

    return value === "true";
  }

}

export const configurationService = new ConfigurationService();
