import type { CreateProjectInput } from "@/lib/orchestrator/orchestrator";
import type { Agent } from "@/types/agent";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { TimelineEvent } from "@/types/timeline";
import type { WorkflowExecutionNode } from "@/services/workflowEngineService";

export interface OrchestrationSnapshot {
  project: Project;
  agents: Agent[];
  tasks: Task[];
  workflowNodes: WorkflowExecutionNode[];
  timelineEvents: TimelineEvent[];
  activeAgentId: string | null;
  activityLog: string[];
}

export type OrchestrationProgressListener = (message: string) => void;

export type ExecutionStatus = "Idle" | "Running" | "Paused" | "Cancelled" | "Completed";

export type ExecutionEventType =
  | "ExecutionStarted"
  | "ExecutionPaused"
  | "ExecutionResumed"
  | "ExecutionCancelled"
  | "ExecutionCompleted"
  | "AgentStarted"
  | "AgentCompleted"
  | "TaskStarted"
  | "TaskCompleted"
  | "ProgressUpdated"
  | "StatusChanged";

export interface ExecutionEvent {
  type: ExecutionEventType;
  timestamp: string;
  payload?: Record<string, unknown>;
}

export interface ExecutionStateSnapshot {
  status: ExecutionStatus;
  progress: number;
  estimatedCompletion: string;
  currentAgentId: string | null;
  activeAgentName: string | null;
  executionCount: number;
}

export interface IOrchestrationEngine {
  initialize(input: CreateProjectInput): Promise<OrchestrationSnapshot>;
  step(onProgress?: OrchestrationProgressListener): Promise<OrchestrationSnapshot>;
  rerunFrontendAgent?(uiChangeRequest: string): Promise<OrchestrationSnapshot>;
  pause(): void;
  resume(): void;
  cancel(): void;
  restart(): void;
  retry(): void;
  getState(): ExecutionStateSnapshot;
  subscribe(listener: (event: ExecutionEvent) => void): () => void;
}
