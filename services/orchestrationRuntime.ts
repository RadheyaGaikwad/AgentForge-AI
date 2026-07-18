import type { CreateProjectInput } from "@/lib/orchestrator/orchestrator";
import { MockOrchestratorEngine } from "@/services/engines/mockOrchestratorEngine";
import type {
  IOrchestrationEngine,
  OrchestrationSnapshot,
  OrchestrationProgressListener,
  ExecutionStateSnapshot,
  ExecutionEvent,
} from "@/services/orchestrationEngine";

export { type OrchestrationSnapshot, type OrchestrationProgressListener } from "@/services/orchestrationEngine";

export class OrchestrationRuntime {
  private readonly engine: IOrchestrationEngine;

  constructor(engine?: IOrchestrationEngine) {
    this.engine = engine ?? new MockOrchestratorEngine();
  }

  async initialize(input: CreateProjectInput): Promise<OrchestrationSnapshot> {
    return this.engine.initialize(input);
  }

  async step(onProgress?: OrchestrationProgressListener): Promise<OrchestrationSnapshot> {
    return this.engine.step(onProgress);
  }

  async rerunFrontendAgent(uiChangeRequest: string): Promise<OrchestrationSnapshot> {
    if (typeof this.engine.rerunFrontendAgent === "function") {
      return this.engine.rerunFrontendAgent(uiChangeRequest);
    }

    return this.engine.step();
  }

  pause(): void {
    this.engine.pause();
  }

  resume(): void {
    this.engine.resume();
  }

  cancel(): void {
    this.engine.cancel();
  }

  restart(): void {
    this.engine.restart();
  }

  retry(): void {
    this.engine.retry();
  }

  getState(): ExecutionStateSnapshot {
    return this.engine.getState();
  }

  subscribe(listener: (event: ExecutionEvent) => void): () => void {
    return this.engine.subscribe(listener);
  }
}
