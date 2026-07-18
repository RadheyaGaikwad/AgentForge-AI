import { spawn } from "node:child_process";
import type { ValidationIssue } from "@/types/projectArtifact";

export type BuildValidationStepId = "dependencies" | "prisma-generated" | "database-ready" | "lint" | "build";

export interface BuildValidationStep {
  id: BuildValidationStepId;
  label: string;
  command: string;
  exitCode: number | null;
  output: string;
  success: boolean;
}

export interface BuildValidationResult {
  projectDirectory: string;
  success: boolean;
  exitCode: number | null;
  command: string;
  output: string;
  issues: ValidationIssue[];
  steps: BuildValidationStep[];
}

interface CommandSpec {
  id: BuildValidationStepId;
  label: string;
  executable: "npm" | "npx";
  args: string[];
  command: string;
}

const COMMANDS: CommandSpec[] = [
  { id: "dependencies", label: "Dependencies Installed", executable: "npm", args: ["install"], command: "npm install" },
  { id: "prisma-generated", label: "Prisma Generated", executable: "npx", args: ["prisma", "generate"], command: "npx prisma generate" },
  { id: "database-ready", label: "Database Ready", executable: "npx", args: ["prisma", "db", "push"], command: "npx prisma db push" },
  { id: "lint", label: "Lint Passed", executable: "npm", args: ["run", "lint"], command: "npm run lint" },
  { id: "build", label: "Build Passed", executable: "npm", args: ["run", "build"], command: "npm run build" },
];

const runCommand = async (projectDirectory: string, spec: CommandSpec): Promise<BuildValidationStep> => {
  return await new Promise((resolve) => {
    const executable = process.platform === "win32" ? `${spec.executable}.cmd` : spec.executable;
    const environment = { ...process.env };
    delete environment.DATABASE_URL;
    const child = spawn(executable, spec.args, {
      cwd: projectDirectory,
      // npm.cmd and npx.cmd are batch files on Windows and require a shell.
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      env: environment,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => {
      stderr += error.message;
    });
    child.on("close", (exitCode) => {
      const output = `${stdout}${stderr ? `\n${stderr}` : ""}`.trim();
      resolve({ id: spec.id, label: spec.label, command: spec.command, exitCode, output, success: exitCode === 0 });
    });
  });
};

export class BuildValidator {
  async validate(projectDirectory: string): Promise<BuildValidationResult> {
    const steps: BuildValidationStep[] = [];
    for (const spec of COMMANDS) {
      const step = await runCommand(projectDirectory, spec);
      steps.push(step);
      if (!step.success) break;
    }

    const failedStep = steps.find((step) => !step.success);
    const output = steps.map((step) => `${step.command}\n${step.output || `(exit code ${step.exitCode ?? "unknown"})`}`).join("\n\n");
    const success = steps.length === COMMANDS.length && !failedStep;

    return {
      projectDirectory,
      success,
      exitCode: failedStep?.exitCode ?? steps.at(-1)?.exitCode ?? null,
      command: COMMANDS.map((step) => step.command).join(" && "),
      output,
      steps,
      issues: [{
        severity: success ? "warning" : "error",
        label: success ? "Deployment validation completed" : `${failedStep?.label ?? "Deployment"} failed`,
        details: output || "No command output was captured.",
      }],
    };
  }
}

export async function validateProjectBuild(projectDirectory: string): Promise<BuildValidationResult> {
  return await new BuildValidator().validate(projectDirectory);
}
