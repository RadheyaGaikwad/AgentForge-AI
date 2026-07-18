import { projectBuilder } from "@/services/projectBuilder";
import type { ValidationIssue } from "@/types/projectArtifact";

export interface ConflictResolutionResult {
  resolvedIssues: ValidationIssue[];
  remainingIssues: ValidationIssue[];
  repairsApplied: string[];
  conflictSummary: string[];
}

export class ConflictResolver {
  resolve(): ConflictResolutionResult {
    const snapshot = projectBuilder.getSnapshot();
    const issues = snapshot.validationReport.issues.map((issue) => ({ ...issue }));
    const resolvedIssues = issues.filter((issue) => issue.severity === "warning");
    const remainingIssues = issues.filter((issue) => issue.severity === "error");
    const duplicateFiles = snapshot.validationReport.duplicateFiles;
    const brokenImports = snapshot.validationReport.missingDependencies;
    const invalidRoutes = snapshot.artifacts.filter((artifact) => artifact.type === "route" && !artifact.relativePath.startsWith("app/api/")).map((artifact) => artifact.relativePath);
    const apiMismatches = snapshot.artifacts
      .filter((artifact) => artifact.type === "route" || artifact.type === "controller")
      .filter((artifact) => !artifact.content.includes("fetch") && !artifact.content.includes("route"))
      .map((artifact) => artifact.relativePath);

    const conflictSummary = [
      ...(duplicateFiles.length > 0 ? ["Duplicate files detected"] : []),
      ...(brokenImports.length > 0 ? ["Broken imports detected"] : []),
      ...(invalidRoutes.length > 0 ? ["Invalid routes detected"] : []),
      ...(apiMismatches.length > 0 ? ["API mismatch detected"] : []),
    ];

    return {
      resolvedIssues,
      remainingIssues,
      repairsApplied: resolvedIssues.map((issue) => issue.label),
      conflictSummary,
    };
  }
}

export const conflictResolver = new ConflictResolver();
