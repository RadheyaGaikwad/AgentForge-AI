import type { CreateProjectInput } from "@/lib/orchestrator/orchestrator";
import { buildDependencyGraph, type PlannedTaskNode } from "@/services/planning/dependencyGraph";
import type { TaskPriority } from "@/types/task";

export interface PlanningContext {
  architectureSummary?: string;
  generatedFiles?: string[];
  requirements?: string[];
  previousOutputs?: string[];
}

export interface ExecutionPlan {
  milestones: string[];
  tasks: PlannedTaskNode[];
  graph: ReturnType<typeof buildDependencyGraph>;
  parallelGroups: string[][];
}

const roleMilestones: Record<string, string> = {
  "Project Manager": "Scope & milestones",
  "System Architect": "Architecture blueprint",
  "Frontend Engineer": "Frontend implementation",
  "Backend Engineer": "Backend services",
  "Database Engineer": "Data model",
  "QA Engineer": "Quality validation",
  "Documentation Engineer": "Documentation & handoff",
  "Security Engineer": "Security review",
};

export class PlanningEngine {
  createPlan(input: CreateProjectInput, _context: PlanningContext = {}): ExecutionPlan {
    void _context;
    const tasks: PlannedTaskNode[] = [
      this.createTask({
        id: "scope-milestones",
        title: "Define scope and delivery milestones",
        description: `Establish the initial delivery scope for ${input.name}.`,
        role: "Project Manager",
        dependsOn: [],
        priority: "High",
        parallelizable: false,
      }),
      this.createTask({
        id: "architecture-blueprint",
        title: "Draft the system architecture blueprint",
        description: `Capture the technical architecture and boundaries for ${input.name}.`,
        role: "System Architect",
        dependsOn: ["scope-milestones"],
        priority: "High",
        parallelizable: false,
      }),
      this.createTask({
        id: "frontend-core",
        title: "Build the frontend experience",
        description: `Build the user-facing frontend for ${input.name} using the architecture-selected stack.`,
        role: "Frontend Engineer",
        dependsOn: ["architecture-blueprint"],
        priority: "High",
        parallelizable: false,
      }),
      this.createTask({
        id: "backend-core",
        title: "Build the backend services",
        description: `Implement the backend services for ${input.name}.`,
        role: "Backend Engineer",
        dependsOn: ["frontend-core"],
        priority: "High",
        parallelizable: false,
      }),
      this.createTask({
        id: "database-model",
        title: "Define the data model and persistence flow",
        description: `Set up the persistence and data contract for ${input.name}.`,
        role: "Database Engineer",
        dependsOn: ["backend-core"],
        priority: "High",
        parallelizable: false,
      }),
      this.createTask({
        id: "qa-validation",
        title: "Validate quality and regression coverage",
        description: `Run validation for the integrated implementation of ${input.name}.`,
        role: "QA Engineer",
        dependsOn: ["database-model"],
        priority: "High",
        parallelizable: false,
      }),
    ];

    tasks.push(this.createTask({ id: "deployment-release", title: "Prepare deployment and handoff", description: `Prepare ${input.name} for delivery.`, role: "DevOps Engineer", dependsOn: ["qa-validation"], priority: "High", parallelizable: false }));

    const graph = buildDependencyGraph(tasks);

    return {
      milestones: [...new Set(tasks.map((task) => roleMilestones[task.role] ?? task.milestone))],
      tasks,
      graph,
      parallelGroups: graph.parallelGroups,
    };
  }

  private createTask(options: {
    id: string;
    title: string;
    description: string;
    role: string;
    dependsOn: string[];
    priority: TaskPriority;
    parallelizable: boolean;
  }): PlannedTaskNode {
    return {
      ...options,
      milestone: roleMilestones[options.role] ?? "Execution milestone",
      status: "Pending",
    };
  }
}

export const planningEngine = new PlanningEngine();
