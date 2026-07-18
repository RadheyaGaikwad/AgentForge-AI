import type { Agent, AgentStatus } from "@/types/agent";
import type { Project, ProjectStatus } from "@/types/project";
import type { Task, TaskPriority } from "@/types/task";
import { engineeringWorkflow, type WorkflowStage } from "@/lib/orchestrator/workflow";

export interface CreateProjectInput {
  name: string;
  description: string;
  projectType: string;
  techStack: string[];
}

interface WorkflowState {
  currentStageIndex: number;
  completedStages: string[];
}

export class Orchestrator {
  private project: Project | null = null;
  private agents: Agent[] = [];
  private tasks: Task[] = [];
  private workflow: WorkflowStage[];
  private workflowState: WorkflowState = {
    currentStageIndex: 0,
    completedStages: [],
  };

  constructor(workflow: WorkflowStage[] = engineeringWorkflow) {
    this.workflow = workflow.map((stage) => ({ ...stage, roles: [...stage.roles] }));
  }

  createProject(input: CreateProjectInput): Project {
    const timestamp = this.createTimestamp();

    this.project = {
      id: this.createId(),
      name: input.name,
      description: input.description,
      projectType: input.projectType,
      techStack: [...input.techStack],
      status: "Planning",
      progress: 0,
      createdAt: timestamp,
    };

    this.agents = this.buildDefaultAgents(timestamp);
    this.tasks = this.generateMockTasks(timestamp);
    this.workflowState = {
      currentStageIndex: 0,
      completedStages: [],
    };

    this.syncProjectState();

    return this.getProject() as Project;
  }

  registerAgent(agent: Omit<Agent, "id" | "createdAt" | "updatedAt">): Agent {
    const timestamp = this.createTimestamp();
    const registeredAgent: Agent = {
      ...agent,
      id: this.createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.agents = [...this.agents, registeredAgent];
    return registeredAgent;
  }

  loadWorkflow(workflow: WorkflowStage[]): WorkflowStage[] {
    this.workflow = workflow.map((stage) => ({ ...stage, roles: [...stage.roles] }));
    this.workflowState = {
      currentStageIndex: 0,
      completedStages: [],
    };

    return this.getWorkflow();
  }

  getAgents(): Agent[] {
    return this.agents.map((agent) => ({ ...agent }));
  }

  getTasks(): Task[] {
    return this.tasks.map((task) => ({ ...task }));
  }

  getWorkflow(): WorkflowStage[] {
    return this.workflow.map((stage) => ({ ...stage, roles: [...stage.roles] }));
  }

  getProject(): Project | null {
    if (!this.project) {
      return null;
    }

    return {
      ...this.project,
      techStack: [...this.project.techStack],
    };
  }

  updateProject(updates: Partial<Project>): Project | null {
    if (!this.project) {
      return null;
    }

    this.project = { ...this.project, ...updates, techStack: updates.techStack ? [...updates.techStack] : this.project.techStack };
    return this.getProject();
  }

  getWorkflowState(): {
    currentStage: WorkflowStage | null;
    currentStageIndex: number;
    totalStages: number;
    completedStages: string[];
  } {
    return {
      currentStage: this.workflow[this.workflowState.currentStageIndex] ?? null,
      currentStageIndex: this.workflowState.currentStageIndex,
      totalStages: this.workflow.length,
      completedStages: [...this.workflowState.completedStages],
    };
  }

  resetProject(): void {
    this.project = null;
    this.agents = [];
    this.tasks = [];
    this.workflowState = {
      currentStageIndex: 0,
      completedStages: [],
    };
  }

  private buildDefaultAgents(timestamp: string): Agent[] {
    const definitions = [
      {
        name: "Project Manager Agent",
        role: "Project Manager",
        description: "Coordinates scope, milestones, and stakeholders.",
        avatar: "PM",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "Architecture Agent",
        role: "System Architect",
        description: "Designs scalable foundations for the product.",
        avatar: "AR",
        status: "Planning" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "Frontend Engineer Agent",
        role: "Frontend Engineer",
        description: "Shapes the product experience and interface systems.",
        avatar: "FE",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "Backend Engineer Agent",
        role: "Backend Engineer",
        description: "Builds the service layer and integrations.",
        avatar: "BE",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "Database Engineer Agent",
        role: "Database Engineer",
        description: "Designs the data model and persistence strategy.",
        avatar: "DB",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "QA Engineer Agent",
        role: "QA Engineer",
        description: "Protects quality through validation and review.",
        avatar: "QA",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "DevOps Engineer Agent",
        role: "DevOps Engineer",
        description: "Automates delivery readiness and deployment workflows.",
        avatar: "DV",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "Documentation Agent",
        role: "Documentation Engineer",
        description: "Produces clear technical documentation and implementation guidance.",
        avatar: "DO",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
      {
        name: "Deployment Agent",
        role: "Deployment Engineer",
        description: "Coordinates packaging, release checks, and final delivery.",
        avatar: "DP",
        status: "Idle" as AgentStatus,
        currentTask: null,
        progress: 0,
      },
    ];

    return definitions.map((definition) => ({
      ...definition,
      id: this.createId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
  }

  private generateMockTasks(timestamp: string): Task[] {
    if (!this.project) {
      return [];
    }

    return this.workflow.flatMap((stage, index) =>
      stage.roles.map((role, roleIndex) => {
        const assignedAgent = this.agents.find((agent) => agent.role === role);

        return {
          id: this.createId(),
          title: `${stage.name} — ${role}`,
          description: `Prepare and coordinate ${role.toLowerCase()} work for ${this.project?.name ?? "the project"}.`,
          assignedAgent: assignedAgent?.id ?? null,
          priority: this.getPriorityForStage(index, roleIndex),
          status: assignedAgent ? "Assigned" : "Pending",
          progress: 0,
          createdAt: timestamp,
          completedAt: null,
        } satisfies Task;
      }),
    );
  }

  private syncProjectState(): void {
    if (!this.project) {
      return;
    }

    const completedTasks = this.tasks.filter((task) => task.status === "Completed").length;
    const totalTasks = Math.max(this.tasks.length, 1);
    const progress = Math.round((completedTasks / totalTasks) * 100);

    this.project.progress = progress;
    this.project.status = this.getProjectStatus(progress);
  }

  private getProjectStatus(progress: number): ProjectStatus {
    if (progress >= 100) {
      return "Completed";
    }

    if (progress > 0) {
      return "In Progress";
    }

    return "Planning";
  }

  private getPriorityForStage(stageIndex: number, roleIndex: number): TaskPriority {
    if (stageIndex === 0) {
      return "High";
    }

    if (stageIndex === 1) {
      return "High";
    }

    if (stageIndex === 2 && roleIndex === 0) {
      return "Critical";
    }

    if (stageIndex === 3) {
      return "Medium";
    }

    return "Low";
  }

  private createId(): string {
    return `item-${Math.random().toString(36).slice(2, 10)}`;
  }

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}
