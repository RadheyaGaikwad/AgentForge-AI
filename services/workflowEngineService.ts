export type WorkflowNodeStatus = "Pending" | "Running" | "Waiting" | "Completed" | "Blocked";

export interface WorkflowNode {
  id: string;
  title: string;
  role: string;
  description: string;
  dependsOn: string[];
  parallel?: boolean;
}

export interface WorkflowExecutionNode extends WorkflowNode {
  status: WorkflowNodeStatus;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
}

export const defaultWorkflowNodes: WorkflowNode[] = [
  {
    id: "project-manager",
    title: "Project Manager",
    role: "Project Manager",
    description: "Defines scope, priorities, and delivery boundaries.",
    dependsOn: [],
  },
  {
    id: "system-architect",
    title: "System Architect",
    role: "System Architect",
    description: "Designs the architecture and technical blueprint.",
    dependsOn: ["project-manager"],
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    role: "Frontend Engineer",
    description: "Builds the product experience and interface layer.",
    dependsOn: ["system-architect"],
    parallel: true,
  },
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    role: "Backend Engineer",
    description: "Builds the service layer and integrations.",
    dependsOn: ["system-architect"],
    parallel: true,
  },
  {
    id: "database-engineer",
    title: "Database Engineer",
    role: "Database Engineer",
    description: "Defines the storage model and persistence strategy.",
    dependsOn: ["system-architect"],
    parallel: true,
  },
  {
    id: "qa-engineer",
    title: "QA Engineer",
    role: "QA Engineer",
    description: "Validates quality once the core build is complete.",
    dependsOn: ["frontend-engineer", "backend-engineer", "database-engineer"],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    role: "DevOps Engineer",
    description: "Prepares delivery and handoff readiness.",
    dependsOn: ["qa-engineer"],
  },
];

export class WorkflowEngineService {
  private nodes: WorkflowExecutionNode[];

  constructor(nodes: WorkflowNode[] = defaultWorkflowNodes) {
    this.nodes = nodes.map((node) => ({
      ...node,
      status: "Pending",
      progress: 0,
      startedAt: null,
      completedAt: null,
    }));
  }

  getNodes(): WorkflowExecutionNode[] {
    return this.nodes.map((node) => ({ ...node }));
  }

  reset(): void {
    this.nodes = this.nodes.map((node) => ({
      ...node,
      status: "Pending",
      progress: 0,
      startedAt: null,
      completedAt: null,
    }));
  }

  hydrate(nodes: WorkflowNode[]): WorkflowExecutionNode[] {
    this.nodes = nodes.map((node) => ({
      ...node,
      status: "Pending",
      progress: 0,
      startedAt: null,
      completedAt: null,
    }));

    return this.getNodes();
  }

  advance(): WorkflowExecutionNode[] {
    const runningNodes = this.nodes.filter((node) => node.status === "Running");

    if (runningNodes.length > 0) {
      this.completeRunningNodes();
    }

    this.startEligibleNodes();
    return this.getNodes();
  }

  private startEligibleNodes(): void {
    const completedIds = new Set(this.nodes.filter((node) => node.status === "Completed").map((node) => node.id));

    this.nodes.forEach((node, index) => {
      if (node.status === "Completed" || node.status === "Running") {
        return;
      }

      const hasUnmetDependencies = node.dependsOn.some((dependency) => !completedIds.has(dependency));

      if (hasUnmetDependencies) {
        this.nodes[index] = {
          ...this.nodes[index],
          status: "Waiting",
          progress: 10,
        };
        return;
      }

      if (node.status === "Pending" || node.status === "Waiting") {
        this.nodes[index] = {
          ...this.nodes[index],
          status: "Running",
          progress: 35,
          startedAt: node.startedAt ?? this.createTimestamp(),
        };
      }
    });
  }

  private completeRunningNodes(): void {
    const runningNodes = this.nodes.filter((node) => node.status === "Running");

    if (runningNodes.length === 0) {
      return;
    }

    const nextNode = runningNodes[0];
    const index = this.nodes.findIndex((entry) => entry.id === nextNode.id);

    if (index >= 0) {
      this.nodes[index] = {
        ...this.nodes[index],
        status: "Completed",
        progress: 100,
        completedAt: this.createTimestamp(),
      };
    }
  }

  private createTimestamp(): string {
    return new Date().toISOString();
  }
}
