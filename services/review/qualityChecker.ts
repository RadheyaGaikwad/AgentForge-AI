import { projectBuilder } from "@/services/projectBuilder";
import { sharedContextService } from "@/services/sharedContextService";
import { executionLogService } from "@/services/executionLogService";
import type { Project } from "@/types/project";
import type { ValidationIssue } from "@/types/projectArtifact";

export interface QualityVerificationResult {
  installPassed: boolean;
  lintPassed: boolean;
  buildPassed: boolean;
  compileVerified: boolean;
  issues: ValidationIssue[];
  confidenceScore: number;
}

const toIssue = (severity: ValidationIssue["severity"], label: string, details: string): ValidationIssue => ({ severity, label, details });

export class QualityChecker {
  async verify(project: Project, issues: ValidationIssue[] = []): Promise<QualityVerificationResult> {
    const snapshot = projectBuilder.getSnapshot();
    const sharedContext = sharedContextService.getSnapshot();
    const nextIssues = [...issues];

    const installPassed = snapshot.files.length > 0 && snapshot.manifest !== null;
    const lintPassed = snapshot.validationReport.issues.every((issue) => issue.severity !== "error");
    const buildPassed = snapshot.validationReport.issues.every((issue) => issue.severity !== "error") && snapshot.previewManifest.status !== "failed";

    if (!installPassed) {
      nextIssues.push(toIssue("error", "Generated project missing", `The generated project output for ${project.name} is incomplete.`));
    }

    if (snapshot.validationReport.missingDependencies.length > 0) {
      nextIssues.push(toIssue("error", "Dependency mismatch", `Missing project dependencies: ${snapshot.validationReport.missingDependencies.join(", ")}.`));
    }

    if (snapshot.validationReport.duplicateFiles.length > 0) {
      nextIssues.push(toIssue("error", "Duplicate file conflict", `Duplicate artifacts detected: ${snapshot.validationReport.duplicateFiles.join(", ")}.`));
    }

    const compileVerified = installPassed && lintPassed && buildPassed && !nextIssues.some((issue) => issue.severity === "error");
    const confidenceScore = Math.max(58, Math.min(98, Math.round(82 + (compileVerified ? 10 : 0) - Math.max(0, nextIssues.length) * 3 + Math.max(0, sharedContext.generatedFiles.length - 1))));

    executionLogService.add({
      level: compileVerified ? "success" : "warning",
      actor: "Quality Checker",
      message: `Quality verification for ${project.name} completed with ${nextIssues.length} issue(s) remaining.`,
      metadata: {
        installPassed,
        lintPassed,
        buildPassed,
        compileVerified,
        confidenceScore,
        issueCount: nextIssues.length,
      },
    });

    return {
      installPassed,
      lintPassed,
      buildPassed,
      compileVerified,
      issues: nextIssues,
      confidenceScore,
    };
  }
}

export const qualityChecker = new QualityChecker();
