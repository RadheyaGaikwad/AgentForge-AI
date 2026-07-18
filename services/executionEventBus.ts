import type { ExecutionEvent } from "@/services/orchestrationEngine";

export class ExecutionEventBus {
  private readonly listeners = new Set<(event: ExecutionEvent) => void>();

  subscribe(listener: (event: ExecutionEvent) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  publish(event: ExecutionEvent): void {
    const safeEvent = {
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
    };

    this.listeners.forEach((listener) => listener(safeEvent));
  }
}
