import { Orchestrator, type CreateProjectInput } from "@/lib/orchestrator/orchestrator";
import type { Agent } from "@/types/agent";
import type { Project } from "@/types/project";
import type { Task } from "@/types/task";
import type { WorkflowStage } from "@/lib/orchestrator/workflow";

export class OrchestratorService {
  private orchestrator: Orchestrator;

  constructor(orchestrator?: Orchestrator) {
    this.orchestrator = orchestrator ?? new Orchestrator();
  }

  createProject(input: CreateProjectInput): Project {
    return this.orchestrator.createProject(input);
  }

  getAgents(): Agent[] {
    return this.orchestrator.getAgents();
  }

  getTasks(): Task[] {
    return this.orchestrator.getTasks();
  }

  getWorkflow(): WorkflowStage[] {
    return this.orchestrator.getWorkflow();
  }

  getProject(): Project | null {
    return this.orchestrator.getProject();
  }

  resetProject(): void {
    this.orchestrator.resetProject();
  }
}
