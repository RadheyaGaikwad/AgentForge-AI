import type { CreateProjectInput } from "@/lib/orchestrator/orchestrator";
import type { AIProvider } from "@/lib/providers/types";
import { MockOrchestratorEngine } from "@/services/engines/mockOrchestratorEngine";
import type {
  ExecutionEvent,
  ExecutionStateSnapshot,
  IOrchestrationEngine,
  OrchestrationProgressListener,
  OrchestrationSnapshot,
} from "@/services/orchestrationEngine";
import type { ExecutionEventBus } from "@/services/executionEventBus";

/**
 * Provider-backed execution entry point.
 *
 * The established engine already owns the workflow, orchestration, context
 * handoffs, review, code generation, and fallback-provider behavior. This
 * adapter gives that production path an accurate name without changing its
 * public contract or disrupting existing callers of MockOrchestratorEngine.
 */
export class AIOrchestratorEngine implements IOrchestrationEngine {
  private readonly delegate: MockOrchestratorEngine;

  constructor(provider?: AIProvider, eventBus?: ExecutionEventBus) {
    this.delegate = new MockOrchestratorEngine(provider, eventBus);
  }

  initialize(input: CreateProjectInput): Promise<OrchestrationSnapshot> {
    return this.delegate.initialize(input);
  }

  step(onProgress?: OrchestrationProgressListener): Promise<OrchestrationSnapshot> {
    return this.delegate.step(onProgress);
  }

  rerunFrontendAgent(uiChangeRequest: string): Promise<OrchestrationSnapshot> {
    return this.delegate.rerunFrontendAgent(uiChangeRequest);
  }

  pause(): void {
    this.delegate.pause();
  }

  resume(): void {
    this.delegate.resume();
  }

  cancel(): void {
    this.delegate.cancel();
  }

  restart(): void {
    this.delegate.restart();
  }

  retry(): void {
    this.delegate.retry();
  }

  getState(): ExecutionStateSnapshot {
    return this.delegate.getState();
  }

  subscribe(listener: (event: ExecutionEvent) => void): () => void {
    return this.delegate.subscribe(listener);
  }
}
