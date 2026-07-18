export type ExecutionLogLevel = "info" | "warning" | "error" | "success";

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  level: ExecutionLogLevel;
  actor: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class ExecutionLogService {
  private readonly logs: ExecutionLogEntry[] = [];

  add(entry: Omit<ExecutionLogEntry, "id" | "timestamp">): ExecutionLogEntry {
    const created: ExecutionLogEntry = {
      ...entry,
      id: this.createId(),
      timestamp: new Date().toISOString(),
    };

    this.logs.unshift(created);
    return { ...created };
  }

  getLogs(): ExecutionLogEntry[] {
    return this.logs.map((entry) => ({ ...entry, metadata: entry.metadata ? { ...entry.metadata } : undefined }));
  }

  clear(): void {
    this.logs.length = 0;
  }

  private createId(): string {
    return `log-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export const executionLogService = new ExecutionLogService();
