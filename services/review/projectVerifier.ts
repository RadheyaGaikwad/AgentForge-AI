import { qualityChecker } from "@/services/review/qualityChecker";
import { conflictResolver } from "@/services/review/conflictResolver";
import { projectBuilder } from "@/services/projectBuilder";
import { sharedContextService } from "@/services/sharedContextService";
import { executionLogService } from "@/services/executionLogService";
import type { Project } from "@/types/project";
import type { ValidationIssue } from "@/types/projectArtifact";

export interface ProjectVerificationResult {
  verified: boolean;
  projectDirectory: string;
  issues: ValidationIssue[];
  confidenceScore: number;
}

export class ProjectVerifier {
  async verify(project: Project): Promise<ProjectVerificationResult> {
    const projectDirectory = project.name.toLowerCase().replace(/[^a-z0-9]+/gu, "-") || "generated-project";
    const snapshot = projectBuilder.getSnapshot();
    const conflicts = conflictResolver.resolve();
    const issues = [
      ...snapshot.validationReport.issues.map((issue) => ({ ...issue })),
      ...conflicts.remainingIssues,
    ];

    const quality = await qualityChecker.verify(project, issues);
    const confidenceScore = quality.confidenceScore;
    const verified = quality.compileVerified && !quality.issues.some((issue) => issue.severity === "error");

    executionLogService.add({
      level: verified ? "success" : "warning",
      actor: "Project Verifier",
      message: `Verification completed for ${project.name}. Confidence score: ${confidenceScore}.`,
      metadata: { projectDirectory, confidenceScore, issueCount: quality.issues.length, conflicts: conflicts.conflictSummary },
    });

    sharedContextService.setValidationReport({
      ...snapshot.validationReport,
      issues: quality.issues,
    });
    sharedContextService.updateProgress(verified ? 100 : Math.max(sharedContextService.getSnapshot().currentProgress, 70));

    return {
      verified,
      projectDirectory,
      issues: quality.issues,
      confidenceScore,
    };
  }
}

export const projectVerifier = new ProjectVerifier();
