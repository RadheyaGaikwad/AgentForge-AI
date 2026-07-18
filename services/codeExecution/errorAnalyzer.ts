import path from "node:path";
import type { ValidationIssue } from "@/types/projectArtifact";

export interface ErrorAnalysisResult {
  issues: ValidationIssue[];
  missingDependencies: string[];
  targetFiles: string[];
  summary: string;
}

const extractTargetFile = (outputLine: string): string | null => {
  const match = outputLine.match(/([A-Za-z]:\\[^:\s]+|\.?\.\/[^:\s]+|\.?\.?\/[^:\s]+|[^\s]+\.(?:ts|tsx|js|jsx|mjs|cjs))(?::\d+)?/u);
  if (!match?.[1]) {
    return null;
  }

  return match[1].replace(/\\/gu, "/");
};

const normalizeIssue = (severity: ValidationIssue["severity"], label: string, details: string): ValidationIssue => ({
  severity,
  label,
  details,
});

export class ErrorAnalyzer {
  analyze(output: string, projectDirectory = process.cwd()): ErrorAnalysisResult {
    const lines = output.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
    const issues: ValidationIssue[] = [];
    const missingDependencies = new Set<string>();
    const targetFiles = new Set<string>();

    for (const line of lines) {
      if (line.toLowerCase().includes("module not found") || line.toLowerCase().includes("can't resolve")) {
        const dependencyMatch = line.match(/can't resolve\s+['"]([^'"]+)['"]/iu) ?? line.match(/module not found\s+['"]([^'"]+)['"]/iu);
        if (dependencyMatch?.[1]) {
          missingDependencies.add(dependencyMatch[1]);
          issues.push(normalizeIssue("error", "Missing dependency", line));
        }
      }

      if (line.toLowerCase().includes("type error") || line.toLowerCase().includes("ts")) {
        const candidateFile = extractTargetFile(line);
        if (candidateFile) {
          targetFiles.add(path.resolve(projectDirectory, candidateFile));
        }

        issues.push(normalizeIssue("error", "TypeScript error", line));
      }

      if (line.toLowerCase().includes("syntaxerror") || line.toLowerCase().includes("unexpected token") || line.toLowerCase().includes("parse error")) {
        const candidateFile = extractTargetFile(line);
        if (candidateFile) {
          targetFiles.add(path.resolve(projectDirectory, candidateFile));
        }

        issues.push(normalizeIssue("error", "Syntax error", line));
      }

      if (line.toLowerCase().includes("import") && line.toLowerCase().includes("not found")) {
        const candidateFile = extractTargetFile(line);
        if (candidateFile) {
          targetFiles.add(path.resolve(projectDirectory, candidateFile));
        }

        issues.push(normalizeIssue("error", "Missing import", line));
      }
    }

    return {
      issues: [...issues],
      missingDependencies: [...missingDependencies],
      targetFiles: [...targetFiles],
      summary: issues.length > 0 ? `${issues.length} validation issue(s) were detected during the build pass.` : "No validation issues were detected.",
    };
  }
}

export function analyzeBuildErrors(output: string, projectDirectory = process.cwd()): ErrorAnalysisResult {
  const analyzer = new ErrorAnalyzer();
  return analyzer.analyze(output, projectDirectory);
}
