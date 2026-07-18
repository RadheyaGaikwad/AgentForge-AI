import fs from "node:fs/promises";
import path from "node:path";
import { FileEditor } from "@/services/projectEditor/fileEditor";
import { ProjectScanner } from "@/services/projectEditor/projectScanner";
import { RollbackService } from "@/services/projectEditor/rollbackService";
import { BuildValidator } from "@/services/codeExecution/buildValidator";
import { ErrorAnalyzer } from "@/services/codeExecution/errorAnalyzer";
import { executionLogService } from "@/services/executionLogService";

export interface RepairLoopOptions {
  maxAttempts?: number;
  projectDirectory: string;
}

export interface RepairLoopResult {
  status: "success" | "failed";
  attempts: number;
  repairedFiles: string[];
  errors: string[];
}

const ensurePackageDependency = async (projectDirectory: string, dependencyName: string): Promise<boolean> => {
  const packageJsonPath = path.join(projectDirectory, "package.json");

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    const dependencies = packageJson.dependencies ?? {};
    if (dependencies[dependencyName]) {
      return false;
    }

    const devDependencies = packageJson.devDependencies ?? {};
    packageJson.dependencies = {
      ...dependencies,
      [dependencyName]: "latest",
    };
    packageJson.devDependencies = { ...devDependencies };

    await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
};

export class RepairLoop {
  async repair(options: RepairLoopOptions): Promise<RepairLoopResult> {
    const maxAttempts = options.maxAttempts ?? 3;
    const validator = new BuildValidator();
    const analyzer = new ErrorAnalyzer();
    const editor = new FileEditor();
    const rollback = new RollbackService();
    const scanner = new ProjectScanner();
    const repairedFiles: string[] = [];
    const errors: string[] = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      executionLogService.add({
        level: "info",
        actor: "Repair Loop",
        message: `Starting validation attempt ${attempt}/${maxAttempts} for ${options.projectDirectory}.`,
        metadata: { attempt, projectDirectory: options.projectDirectory },
      });

      const validation = await validator.validate(options.projectDirectory);
      if (validation.success) {
        return {
          status: "success",
          attempts: attempt,
          repairedFiles,
          errors: [],
        };
      }

      const analysis = analyzer.analyze(validation.output, options.projectDirectory);
      const scan = await scanner.scan(options.projectDirectory, { includeHidden: false, includeRootFiles: true });

      for (const issue of analysis.issues) {
        errors.push(issue.details);
      }

      for (const targetFile of analysis.targetFiles) {
        const relativePath = path.relative(options.projectDirectory, targetFile).split(path.sep).join("/");
        const source = await fs.readFile(targetFile, "utf8").catch(() => "");
        await rollback.capture(options.projectDirectory, relativePath, source, "repair-loop");

        const fileEntry = scan.files.find((entry) => entry.absolutePath === targetFile);
        if (fileEntry?.kind === "config" && validation.output.includes("package.json")) {
          const dependencyName = analysis.missingDependencies[0];
          if (dependencyName) {
            const changed = await ensurePackageDependency(options.projectDirectory, dependencyName);
            if (changed) {
              repairedFiles.push(relativePath);
            }
          }
          continue;
        }

        if (source.length === 0) {
          continue;
        }

        const fileUpdate = await editor.upsert(targetFile, source);
        if (fileUpdate.applied) {
          repairedFiles.push(relativePath);
        }
      }
    }

    return {
      status: "failed",
      attempts: maxAttempts,
      repairedFiles,
      errors,
    };
  }
}

export async function runRepairLoop(options: RepairLoopOptions): Promise<RepairLoopResult> {
  const loop = new RepairLoop();
  return await loop.repair(options);
}
