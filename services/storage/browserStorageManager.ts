const STORAGE_VERSION = 2;
const MAX_STRING_LENGTH = 220;
const MAX_ARRAY_ITEMS = 8;
const SAFE_RUNTIME_TEXT_LIMIT = 1600;

interface BrowserStorageEnvelope<T> {
  version: number;
  updatedAt: string;
  data: T;
}

export class BrowserStorageManager {
  private static readonly writeTimers = new Map<string, number>();

  static summarizeText(value: string, maxLength = SAFE_RUNTIME_TEXT_LIMIT): string {
    if (!value) {
      return "";
    }

    return value.length > maxLength ? `${value.slice(0, maxLength).trimEnd()}...` : value;
  }

  static summarizePayload(value: unknown, maxLength = SAFE_RUNTIME_TEXT_LIMIT): string {
    if (typeof value === "string") {
      return this.summarizeText(value, maxLength);
    }

    if (Array.isArray(value)) {
      return value.slice(0, MAX_ARRAY_ITEMS).map((entry) => this.summarizePayload(entry, Math.max(80, Math.floor(maxLength / 2)))).join(" | ");
    }

    if (value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>)
        .slice(0, MAX_ARRAY_ITEMS)
        .map(([key, entry]) => `${key}: ${this.summarizePayload(entry, Math.max(80, Math.floor(maxLength / 2)))}`)
        .join(" | ");
    }

    return String(value ?? "");
  }

  static loadMetadata<T>(key: string): T | null {
    if (typeof window === "undefined") {
      return null;
    }

    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as BrowserStorageEnvelope<T> | T;

      if (this.isVersionedEnvelope<T>(parsed)) {
        return this.normalizePayload<T>(parsed.data);
      }

      return this.normalizePayload<T>(parsed);
    } catch (error) {
      const warning = error instanceof Error ? error.message : "Unknown storage parse error";
      console.warn(`[BrowserStorageManager] failed to read ${key}: ${warning}`);
      window.localStorage.removeItem(key);
      return null;
    }
  }

  static saveMetadata<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const envelope: BrowserStorageEnvelope<T> = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      data: this.normalizePayload(value),
    };

    try {
      const serialized = JSON.stringify(envelope);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      const warning = error instanceof Error ? error.message : "Unknown storage write error";
      console.warn(`[BrowserStorageManager] quota exceeded while writing ${key}: ${warning}`);
      this.recoverFromQuota(key);
      return false;
    }
  }

  static saveMetadataDebounced<T>(key: string, value: T, debounceMs = 150): void {
    if (typeof window === "undefined") {
      return;
    }

    const existingTimer = this.writeTimers.get(key);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const nextTimer = window.setTimeout(() => {
      this.saveMetadata(key, value);
      this.writeTimers.delete(key);
    }, debounceMs);

    this.writeTimers.set(key, nextTimer);
  }

  static clearMetadata(key?: string): void {
    if (typeof window === "undefined") {
      return;
    }

    if (key) {
      window.localStorage.removeItem(key);
      return;
    }

    Object.keys(window.localStorage)
      .filter((entry) => entry.startsWith("agentforge."))
      .forEach((entry) => window.localStorage.removeItem(entry));
  }

  private static isVersionedEnvelope<T>(value: unknown): value is BrowserStorageEnvelope<T> {
    if (!value || typeof value !== "object") {
      return false;
    }

    return "version" in value && "data" in value && "updatedAt" in value;
  }

  private static normalizePayload<T>(value: T): T {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === "string") {
      return this.truncateText(value) as T;
    }

    if (Array.isArray(value)) {
      return value.slice(0, MAX_ARRAY_ITEMS).map((entry) => this.normalizePayload(entry)) as T;
    }

    if (typeof value === "object") {
      return Object.entries(value).reduce<Record<string, unknown>>((all, [key, item]) => {
        if (item === null || item === undefined) {
          return all;
        }

        if (typeof item === "string") {
          all[key] = this.truncateText(item);
          return all;
        }

        if (Array.isArray(item)) {
          all[key] = item.slice(0, MAX_ARRAY_ITEMS).map((entry) => this.normalizePayload(entry));
          return all;
        }

        if (typeof item === "object") {
          all[key] = this.normalizePayload(item);
          return all;
        }

        all[key] = item;
        return all;
      }, {}) as T;
    }

    return value;
  }

  private static truncateText(value: string): string {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH).trimEnd()}...` : value;
  }

  private static recoverFromQuota(key: string): void {
    const knownBrowserKeys = ["agentforge.project-memory", "agentforge.provider-settings"];

    if (knownBrowserKeys.includes(key)) {
      window.localStorage.removeItem(key);
    }

    Object.keys(window.localStorage)
      .filter((entry) => entry.startsWith("agentforge."))
      .forEach((entry) => {
        if (entry !== "agentforge.provider-settings") {
          window.localStorage.removeItem(entry);
        }
      });
  }
}
