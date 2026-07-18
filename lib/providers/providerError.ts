export type ProviderFailureReason = "missing-api-key" | "timeout" | "provider-error" | "invalid-configuration";

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly reason: ProviderFailureReason,
    public readonly fallbackToMock = true,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export interface ProviderRuntimeState {
  error?: string;
  fallbackUsed: boolean;
  providerName: string;
  reason?: ProviderFailureReason;
}
