export interface ExecutionAnalyticsSnapshot {
  totalRuns: number;
  totalRetries: number;
  totalFallbacks: number;
  totalTimeouts: number;
  totalErrors: number;
  totalTokens: number;
  lastProvider: string;
  lastModel: string;
  averageLatencyMs: number;
}

export class ExecutionAnalyticsService {
  private totalRuns = 0;
  private totalRetries = 0;
  private totalFallbacks = 0;
  private totalTimeouts = 0;
  private totalErrors = 0;
  private totalTokens = 0;
  private totalLatencyMs = 0;
  private lastProvider = "Mock";
  private lastModel = "Mock Agent";

  recordRun(): void {
    this.totalRuns += 1;
  }

  recordRetry(): void {
    this.totalRetries += 1;
  }

  recordFallback(): void {
    this.totalFallbacks += 1;
  }

  recordTimeout(): void {
    this.totalTimeouts += 1;
  }

  recordError(): void {
    this.totalErrors += 1;
  }

  recordTokens(tokens: number): void {
    this.totalTokens += Math.max(0, tokens);
  }

  recordLatency(latencyMs: number): void {
    this.totalLatencyMs += Math.max(0, latencyMs);
  }

  recordProvider(provider: string, model: string): void {
    this.lastProvider = provider;
    this.lastModel = model;
  }

  getSnapshot(): ExecutionAnalyticsSnapshot {
    return {
      totalRuns: this.totalRuns,
      totalRetries: this.totalRetries,
      totalFallbacks: this.totalFallbacks,
      totalTimeouts: this.totalTimeouts,
      totalErrors: this.totalErrors,
      totalTokens: this.totalTokens,
      lastProvider: this.lastProvider,
      lastModel: this.lastModel,
      averageLatencyMs: this.totalRuns > 0 ? Math.round(this.totalLatencyMs / this.totalRuns) : 0,
    };
  }

  reset(): void {
    this.totalRuns = 0;
    this.totalRetries = 0;
    this.totalFallbacks = 0;
    this.totalTimeouts = 0;
    this.totalErrors = 0;
    this.totalTokens = 0;
    this.totalLatencyMs = 0;
    this.lastProvider = "Mock";
    this.lastModel = "Mock Agent";
  }
}

export const executionAnalytics = new ExecutionAnalyticsService();
