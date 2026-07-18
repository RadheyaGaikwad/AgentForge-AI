import type { SharedContextSnapshot } from "@/services/sharedContext";
import type { SmartContextSelection } from "@/services/context/smartContextEngine";

export interface ContextBuildInput {
  projectName: string;
  projectDescription?: string;
  agentRole?: string;
  task?: string;
  objective?: string;
  sharedContext?: SharedContextSnapshot;
  memory?: string[];
  completedTasks?: string[];
  smartContext?: SmartContextSelection;
}

export class ContextBuilder {
  build(input: ContextBuildInput): string {
    const sharedContext = input.sharedContext ?? {
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

    const smartContext = input.smartContext;
    const artifactSummary = sharedContext.artifacts.length > 0
      ? sharedContext.artifacts.slice(0, 5).map((artifact) => `${artifact.type}:${artifact.relativePath}`).join(" | ")
      : "No project artifacts have been generated yet.";
    const validationSummary = sharedContext.validationReport.issues.length > 0
      ? sharedContext.validationReport.issues.map((issue) => `${issue.severity.toUpperCase()}: ${issue.label}`).join(" | ")
      : "Validation: Ready for assembly.";
    const selectedFilesSummary = smartContext?.selectedFiles.length
      ? smartContext.selectedFiles.join(" | ")
      : sharedContext.generatedFiles.join(", ") || "None yet.";
    const memorySummary = smartContext?.relevantMemoryEntries.length
      ? smartContext.relevantMemoryEntries.join(" | ")
      : input.memory?.join(" | ") || "No history available yet.";
    const recentChangesSummary = smartContext?.recentChanges.length
      ? smartContext.recentChanges.join(" | ")
      : "No recent changes recorded yet.";
    const dependencySummary = smartContext?.dependencySummary || "Dependency graph is still being collected.";
    const knowledgeSummary = smartContext?.knowledgeSummary || "Project memory has not been synchronized yet.";

    const sections = [
      `Project: ${input.projectName}`,
      input.projectDescription ? `Description: ${input.projectDescription}` : "Description: Not provided.",
      `Agent Role: ${input.agentRole ?? "Unknown"}`,
      `Current Task: ${input.task ?? "No current task available."}`,
      `Objective: ${input.objective ?? "Deliver the next milestone successfully."}`,
      `Architecture: ${smartContext?.architectureSummary || sharedContext.architecture || "Not yet defined."}`,
      `Relevant Files: ${selectedFilesSummary}`,
      `Project Artifacts: ${artifactSummary}`,
      `Validation Summary: ${validationSummary}`,
      `Recent Changes: ${recentChangesSummary}`,
      `Dependency Summary: ${dependencySummary}`,
      `Knowledge Summary: ${knowledgeSummary}`,
      `Progress: ${sharedContext.currentProgress}%`,
      `Completed Tasks: ${sharedContext.completedTasks.join("; ") || "None yet."}`,
      `Memory: ${memorySummary}`,
    ];

    return sections.join("\n");
  }
}

export const contextBuilder = new ContextBuilder();
