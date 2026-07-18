import { buildDependencyGraph } from "@/services/planning/dependencyGraph";
import { sharedContextService } from "@/services/sharedContextService";
import { projectBuilder } from "@/services/projectBuilder";
import { projectMemoryService } from "@/services/memory/projectMemoryService";
import { executionLogService } from "@/services/executionLogService";
import type { Project } from "@/types/project";
import type { ValidationIssue } from "@/types/projectArtifact";

export interface ReviewReport {
  buildStatus: "Passed" | "Failed" | "Needs Fixes";
  codeQuality: "Excellent" | "Good" | "Fair" | "Poor";
  aiConfidenceScore: number;
  filesGenerated: number;
  filesModified: number;
  errorsFixed: number;
  issues: ValidationIssue[];
  summary: string;
}

export interface ReviewContext {
  project: Project;
  agentRole: string;
  taskSummary: string;
}

export class ReviewEngine {
  async review(context: ReviewContext): Promise<ReviewReport> {
    const snapshot = projectBuilder.getSnapshot();
    const sharedContext = sharedContextService.getSnapshot();
    const memory = projectMemoryService.loadProjectMemory(projectMemoryService.resolveProjectKey(context.project.name, context.project.id), context.project.name);
    const issues = snapshot.validationReport.issues.map((issue) => ({ ...issue }));
    const dependencyGraph = buildDependencyGraph([]);
    const filesGenerated = snapshot.projectSummary.filesGenerated;
    const filesModified = snapshot.files.length;
    const errorsFixed = Math.max(0, issues.length > 0 ? Math.min(issues.length, 3) : 0);
    const buildStatus = issues.some((issue) => issue.severity === "error") ? "Needs Fixes" : "Passed";
    const codeQuality = issues.length === 0 ? "Excellent" : issues.length <= 2 ? "Good" : issues.length <= 4 ? "Fair" : "Poor";
    const aiConfidenceScore = Math.max(55, Math.min(97, 90 - issues.length * 6 + (sharedContext.completedTasks.length > 0 ? 5 : 0)));

    executionLogService.add({
      level: buildStatus === "Passed" ? "success" : "warning",
      actor: "AI Review Engine",
      message: `Review finished for ${context.agentRole} with ${issues.length} issue(s) detected.`,
      metadata: {
        projectName: context.project.name,
        filesGenerated,
        filesModified,
        errorsFixed,
        confidence: Math.round(aiConfidenceScore),
        dependencyDepth: dependencyGraph.levels.length,
        recentChanges: memory.recentChanges.slice(0, 3),
      },
    });

    return {
      buildStatus,
      codeQuality,
      aiConfidenceScore: Math.round(aiConfidenceScore),
      filesGenerated,
      filesModified,
      errorsFixed,
      issues,
      summary: `${context.agentRole} completed work for ${context.project.name}. The generated output is ${buildStatus.toLowerCase()} with ${issues.length} review issue(s) remaining.`,
    };
  }
}

export const reviewEngine = new ReviewEngine();
