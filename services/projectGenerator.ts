import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";
import { generateProjectFiles } from "@/services/fileGenerator";
import { buildProjectTemplates } from "@/services/templateManager";
import type { DetectedArchitecture } from "@/services/architectureAnalyzer";

const slugifyProjectName = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "generated-project";

const resetGeneratedProjectDatabase = async (outputDirectory: string): Promise<void> => {
  const prismaDirectory = path.join(outputDirectory, "prisma");
  const databaseFiles = ["dev.db", "dev.db-journal", "dev.db-wal", "dev.db-shm"];

  try {
    const entries = await fs.readdir(prismaDirectory);
    const matchingEntries = entries.filter((entry) => databaseFiles.includes(entry) || entry.endsWith(".db"));

    if (matchingEntries.length === 0) {
      return;
    }

    await Promise.all(matchingEntries.map((entry) => fs.rm(path.join(prismaDirectory, entry), { recursive: true, force: true })));

    executionLogService.add({
      level: "info",
      actor: "Project Generator",
      message: `Reset generated SQLite database files for ${outputDirectory}.`,
      metadata: { outputDirectory, removedFiles: matchingEntries },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }

    executionLogService.add({
      level: "warning",
      actor: "Project Generator",
      message: `Could not reset generated SQLite database files for ${outputDirectory}.`,
      metadata: { outputDirectory, error: error instanceof Error ? error.message : String(error) },
    });
  }
};

const resetGeneratedProjectArtifacts = async (outputDirectory: string): Promise<void> => {
  try {
    await fs.rm(outputDirectory, { recursive: true, force: true });
    await fs.mkdir(outputDirectory, { recursive: true });

    executionLogService.add({
      level: "info",
      actor: "Project Generator",
      message: `Reset generated app artifacts for ${outputDirectory}.`,
      metadata: { outputDirectory },
    });
  } catch (error) {
    executionLogService.add({
      level: "warning",
      actor: "Project Generator",
      message: `Could not reset generated app artifacts for ${outputDirectory}.`,
      metadata: { outputDirectory, error: error instanceof Error ? error.message : String(error) },
    });
  }
};

export interface ProjectGeneratorOptions {
  projectName: string;
  outputDirectory?: string;
  extraFiles?: Array<{ relativePath: string; content: string }>;
  architecture?: DetectedArchitecture;
}

export interface ProjectGeneratorResult {
  outputDirectory: string;
  generatedFiles: string[];
  skippedFiles: string[];
  generatedAt: string;
}

export async function generateProject(options: ProjectGeneratorOptions): Promise<ProjectGeneratorResult> {
  const projectName = options.projectName || "agentforge-generated-app";
  const outputDirectory = options.outputDirectory ?? path.join(process.cwd(), "GeneratedProjects", slugifyProjectName(projectName));
  const templates = buildProjectTemplates(projectName, options.architecture);
  const files = [...templates, ...(options.extraFiles ?? [])];

  executionLogService.add({
    level: "info",
    actor: "Project Generator",
    message: `Generating project files for ${projectName} into ${outputDirectory}.`,
    metadata: { projectName, outputDirectory, fileCount: files.length },
  });

  await resetGeneratedProjectDatabase(outputDirectory);
  await resetGeneratedProjectArtifacts(outputDirectory);
  const { generatedFiles, skippedFiles } = await generateProjectFiles(outputDirectory, files);

  // Prisma's SQLite schema engine expects the configured database file to
  // exist on some Windows hosts before it can apply the initial schema.
  await fs.writeFile(path.join(outputDirectory, "prisma", "dev.db"), "", { flag: "a" });

  executionLogService.add({
    level: "success",
    actor: "Project Generator",
    message: `Project generation completed for ${projectName}.`,
    metadata: { outputDirectory, generatedFiles, skippedFiles },
  });

  return {
    outputDirectory,
    generatedFiles,
    skippedFiles,
    generatedAt: new Date().toISOString(),
  };
}
