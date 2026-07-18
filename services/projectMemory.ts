export interface IMemoryStore<T> {
  remember(key: string, value: T): void;
  recall(key: string): T | null;
  update(key: string, value: T): void;
  clear(key?: string): void;
}

export class ProjectMemory implements IMemoryStore<Record<string, unknown>> {
  private readonly store = new Map<string, Record<string, unknown>>();

  remember(key: string, value: Record<string, unknown>): void {
    if (!this.store.has(key)) {
      this.store.set(key, value);
    }
  }

  recall(key: string): Record<string, unknown> | null {
    return this.store.get(key) ?? null;
  }

  update(key: string, value: Record<string, unknown>): void {
    this.store.set(key, value);
  }

  clear(key?: string): void {
    if (key) {
      this.store.delete(key);
      return;
    }

    this.store.clear();
  }
}

export class AgentMemory implements IMemoryStore<string> {
  private readonly store = new Map<string, string>();

  remember(key: string, value: string): void {
    if (!this.store.has(key)) {
      this.store.set(key, value);
    }
  }

  recall(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  update(key: string, value: string): void {
    this.store.set(key, value);
  }

  clear(key?: string): void {
    if (key) {
      this.store.delete(key);
      return;
    }

    this.store.clear();
  }
}

export const projectMemory = new ProjectMemory();
export const agentMemory = new AgentMemory();
