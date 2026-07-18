import { sharedContextService } from "@/services/sharedContextService";
import { projectMemoryService } from "@/services/memory/projectMemoryService";
import type { ProjectArtifact } from "@/types/projectArtifact";

export interface ProjectLearningInput {
  projectKey: string;
  projectName: string;
  agentRole?: string;
  phase?: string;
  content?: string;
  type?: string;
  approved?: boolean;
}

export class ProjectLearningService {
  learnFromExecution(input: ProjectLearningInput): void {
    const sharedContext = sharedContextService.getSnapshot();
    const projectName = input.projectName || sharedContext.projectInfo.name?.toString() || "Untitled Project";
    const projectKey = input.projectKey || projectMemoryService.resolveProjectKey(projectName);
    const artifacts = sharedContext.artifacts ?? [];
    const dependencyGraph = projectMemoryService.buildDependencyGraph(artifacts);

    const memory = projectMemoryService.syncKnowledge(projectKey, projectName, {
      architectureSummary: sharedContext.architecture || "Architecture summary pending.",
      techStack: Array.isArray(sharedContext.projectInfo.techStack)
        ? sharedContext.projectInfo.techStack.filter((item): item is string => typeof item === "string")
        : [],
      databaseSelection: this.pickDatabaseSelection(sharedContext),
      apiIntegrations: this.pickApiIntegrations(sharedContext),
      components: this.pickComponents(artifacts),
      generatedFiles: sharedContext.generatedFiles,
      approvals: input.approved ? ["Approved by user"] : [],
      constraints: sharedContext.requirements,
      memoryEntries: [
        {
          id: `${input.agentRole ?? "agent"}-${Date.now()}`,
          type: this.resolveMemoryType(input.type),
          title: `${input.agentRole ?? "Agent"} ${input.phase ?? "completed"}`,
          content: input.content ?? "Execution completed.",
          timestamp: new Date().toISOString(),
          source: input.phase ?? "runtime",
        },
      ],
      dependencyGraph,
      recentChanges: [
        `${input.agentRole ?? "Agent"} ${input.phase ?? "completed"} work: ${input.content ?? "update recorded"}`,
        ...sharedContext.completedTasks,
      ].slice(0, 10),
    });

    if (memory.constraints.length > 0) {
      memory.constraints.forEach((constraint) => {
        projectMemoryService.rememberConstraint(projectKey, constraint, projectName);
      });
    }
  }

  private resolveMemoryType(type?: string): "architecture" | "technology" | "api" | "database" | "component" | "constraint" | "approval" | "output" | "change" {
    if (type === "code") {
      return "component";
    }

    if (type === "json") {
      return "technology";
    }

    if (type === "tasks") {
      return "change";
    }

    return "output";
  }

  private pickDatabaseSelection(sharedContext: ReturnType<typeof sharedContextService.getSnapshot>): string | null {
    const projectInfo = sharedContext.projectInfo as Record<string, unknown>;
    const databaseSelection = projectInfo.databaseSelection ?? projectInfo.database ?? null;
    return typeof databaseSelection === "string" ? databaseSelection : null;
  }

  private pickApiIntegrations(sharedContext: ReturnType<typeof sharedContextService.getSnapshot>): string[] {
    const projectInfo = sharedContext.projectInfo as Record<string, unknown>;
    const apis = projectInfo.apiIntegrations ?? projectInfo.apis;

    if (!Array.isArray(apis)) {
      return [];
    }

    return apis.filter((item): item is string => typeof item === "string");
  }

  private pickComponents(artifacts: ProjectArtifact[]): string[] {
    return artifacts
      .filter((artifact) => ["component", "page", "layout", "route", "service", "controller"].includes(artifact.type))
      .map((artifact) => artifact.relativePath)
      .slice(0, 12);
  }
}

export const projectLearningService = new ProjectLearningService();
