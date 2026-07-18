import type { SharedContextSnapshot } from "@/services/sharedContext";
import { projectMemoryService } from "@/services/memory/projectMemoryService";
import type { ProjectArtifact } from "@/types/projectArtifact";

export interface SmartContextRequest {
  projectKey: string;
  projectName: string;
  projectDescription?: string;
  agentRole?: string;
  task?: string;
  objective?: string;
  sharedContext?: SharedContextSnapshot;
  conversationMemory?: string[];
}

export interface SmartContextSelection {
  architectureSummary: string;
  relevantArtifacts: ProjectArtifact[];
  selectedFiles: string[];
  relevantMemoryEntries: string[];
  recentChanges: string[];
  dependencySummary: string;
  knowledgeSummary: string;
}

export class SmartContextEngine {
  selectContext(input: SmartContextRequest): SmartContextSelection {
    const sharedContext = input.sharedContext ?? this.createDefaultSharedContext();
    const projectMemory = projectMemoryService.loadProjectMemory(input.projectKey, input.projectName);
    const keywords = this.extractKeywords([
      input.projectName,
      input.projectDescription,
      input.agentRole,
      input.task,
      input.objective,
      ...sharedContext.requirements,
    ]);

    const relevantArtifacts = this.rankArtifacts(sharedContext.artifacts, keywords);
    const selectedFiles = relevantArtifacts.map((artifact) => artifact.relativePath).slice(0, 8);
    const relevantMemoryEntries = this.rankMemoryEntries(projectMemory.memoryEntries, keywords)
      .map((entry) => `${entry.title}: ${entry.content}`)
      .slice(0, 6);
    const recentChanges = projectMemory.recentChanges.slice(0, 4);
    const dependencySummary = this.createDependencySummary(projectMemory.dependencyGraph, relevantArtifacts);
    const knowledgeSummary = [
      projectMemory.architectureSummary,
      `Stack: ${projectMemory.techStack.join(", ") || "Not yet recorded"}`,
      `Database: ${projectMemory.databaseSelection ?? "Not yet selected"}`,
      `APIs: ${projectMemory.apiIntegrations.join(", ") || "None"}`,
      `Constraints: ${projectMemory.constraints.join("; ") || "None"}`,
    ].join(" | ");

    return {
      architectureSummary: projectMemory.architectureSummary || sharedContext.architecture || "Not yet defined.",
      relevantArtifacts,
      selectedFiles,
      relevantMemoryEntries,
      recentChanges,
      dependencySummary,
      knowledgeSummary,
    };
  }

  private rankArtifacts(artifacts: ProjectArtifact[], keywords: string[]): ProjectArtifact[] {
    if (artifacts.length === 0) {
      return [];
    }

    const scored = artifacts
      .map((artifact) => {
        const haystack = `${artifact.relativePath} ${artifact.description} ${artifact.content}`.toLowerCase();
        const score = keywords.reduce((total, keyword) => total + (haystack.includes(keyword.toLowerCase()) ? 2 : 0), 0);
        return { artifact, score };
      })
      .sort((left, right) => right.score - left.score);

    const topMatches = scored.filter((entry) => entry.score > 0).map((entry) => entry.artifact);
    return topMatches.length > 0 ? topMatches.slice(0, 6) : artifacts.slice(0, 4);
  }

  private rankMemoryEntries(entries: { title: string; content: string }[], keywords: string[]): { title: string; content: string }[] {
    if (entries.length === 0) {
      return [];
    }

    const scored = entries
      .map((entry) => {
        const haystack = `${entry.title} ${entry.content}`.toLowerCase();
        const score = keywords.reduce((total, keyword) => total + (haystack.includes(keyword.toLowerCase()) ? 2 : 0), 0);
        return { entry, score };
      })
      .sort((left, right) => right.score - left.score);

    const topMatches = scored.filter((entry) => entry.score > 0).map((entry) => entry.entry);
    return topMatches.length > 0 ? topMatches.slice(0, 4) : entries.slice(-4);
  }

  private createDependencySummary(dependencyGraph: Record<string, string[]>, relevantArtifacts: ProjectArtifact[]): string {
    const graphLines = Object.entries(dependencyGraph)
      .filter(([path]) => relevantArtifacts.some((artifact) => artifact.relativePath === path))
      .map(([path, dependencies]) => `${path}: ${dependencies.length > 0 ? dependencies.join(", ") : "No direct dependencies"}`);

    return graphLines.length > 0 ? graphLines.join(" | ") : "Dependency graph is still being collected.";
  }

  private extractKeywords(values: Array<string | undefined>): string[] {
    return values
      .filter((value): value is string => Boolean(value && value.trim()))
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/g))
      .filter((part) => part.length > 2)
      .filter((part, index, list) => list.indexOf(part) === index)
      .slice(0, 12);
  }

  private createDefaultSharedContext(): SharedContextSnapshot {
    return {
      projectInfo: {},
      architecture: "Not yet defined.",
      requirements: [],
      generatedFiles: [],
      currentProgress: 0,
      completedTasks: [],
      agentOutputs: {},
      artifacts: [],
      validationReport: {
        imports: [],
        packageJson: [],
        missingDependencies: [],
        folderReferences: [],
        duplicateFiles: [],
        emptyFiles: [],
        issues: [],
      },
    };
  }
}

export const smartContextEngine = new SmartContextEngine();
