import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";
import { detectPreviewUrl } from "@/services/previewDetector";
import { buildPreviewManifest } from "@/services/previewManifest";
import { startPreviewServer } from "@/services/devServerManager";
import { BuildValidator, type BuildValidationResult } from "@/services/codeExecution/buildValidator";
import type { ProjectArtifact, PreviewManifest } from "@/types/projectArtifact";

export interface PreviewServiceResult {
  previewUrl: string;
  previewManifest: PreviewManifest;
  installedDependencies: boolean;
  serverStarted: boolean;
  previewStatus: "ready" | "failed" | "pending";
  validation?: BuildValidationResult;
  errorMessage?: string;
  logs: string[];
  installLogs: string[];
  runtimeLogs: string[];
}

const writeLogFile = async (projectDirectory: string, filename: string, output: string): Promise<void> => {
  await fs.writeFile(path.join(projectDirectory, filename), output.trim(), "utf8");
};

const failedResult = (errorMessage: string, validation?: BuildValidationResult): PreviewServiceResult => ({
  previewUrl: "",
  previewManifest: { previewUrl: "", pages: [], generatedAt: new Date().toISOString(), status: "failed" },
  installedDependencies: validation?.steps.some((step) => step.id === "dependencies" && step.success) ?? false,
  serverStarted: false,
  previewStatus: "failed",
  validation,
  errorMessage,
  logs: validation ? [validation.output] : [errorMessage],
  installLogs: validation?.steps.map((step) => `${step.command}\n${step.output}`).filter(Boolean) ?? [errorMessage],
  runtimeLogs: [],
});

export async function prepareProjectPreview(projectDirectory: string, artifacts: ProjectArtifact[] = []): Promise<PreviewServiceResult> {
  const packageJsonPath = path.join(projectDirectory, "package.json");
  try {
    await fs.access(packageJsonPath);
  } catch {
    return failedResult(`Deployment validation failed because ${packageJsonPath} does not exist.`);
  }

  const validation = await new BuildValidator().validate(projectDirectory);
  await writeLogFile(projectDirectory, ".agentforge-deployment.log", validation.output);
  for (const step of validation.steps) {
    executionLogService.add({
      level: step.success ? "success" : "error",
      actor: "Deployment Agent",
      message: `${step.label}: ${step.success ? "completed" : "failed"}.`,
      metadata: { projectDirectory, command: step.command, exitCode: step.exitCode, output: step.output },
    });
  }

  if (!validation.success) {
    const failedStep = validation.steps.find((step) => !step.success);
    return failedResult(`${failedStep?.label ?? "Deployment validation"} failed.`, validation);
  }

  const serverResult = await startPreviewServer({ cwd: projectDirectory, port: 3000, timeoutMs: 90000 });
  if (!serverResult.started || !serverResult.url) {
    return failedResult(serverResult.errorMessage ?? "Preview failed to start.", validation);
  }

  await writeLogFile(projectDirectory, ".agentforge-preview.log", serverResult.runtimeLogs.join("\n"));
  const previewManifest = buildPreviewManifest({ previewUrl: serverResult.url, artifacts });
  executionLogService.add({
    level: "success",
    actor: "Deployment Agent",
    message: `Preview Ready at ${serverResult.url}.`,
    metadata: { projectDirectory, previewUrl: serverResult.url, pid: serverResult.pid },
  });

  return {
    previewUrl: serverResult.url,
    previewManifest: { ...previewManifest, status: "ready" },
    installedDependencies: true,
    serverStarted: true,
    previewStatus: "ready",
    validation,
    logs: [validation.output, ...serverResult.runtimeLogs].filter(Boolean),
    installLogs: validation.steps.map((step) => `${step.command}\n${step.output}`).filter(Boolean),
    runtimeLogs: serverResult.runtimeLogs,
  };
}

export async function resolvePreviewUrl(projectDirectory = path.join(process.cwd(), "GeneratedProjects")): Promise<string> {
  const detection = await detectPreviewUrl();
  if (detection.source === "configured" || detection.source === "detected") return detection.url;
  return (await startPreviewServer({ cwd: projectDirectory, port: 3000, timeoutMs: 90000 })).url ?? "";
}
