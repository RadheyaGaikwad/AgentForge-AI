import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";
import { appendGeneratedLog, writeGeneratedFile } from "@/services/codeWriter";
import { createDirectoryTree } from "@/services/folderGenerator";

export interface ProjectFileSpec {
  relativePath: string;
  content: string;
}

export interface ProjectFileGenerationResult {
  generatedFiles: string[];
  skippedFiles: string[];
}

export async function generateProjectFiles(baseDir: string, files: ProjectFileSpec[]): Promise<ProjectFileGenerationResult> {
  const generatedFiles: string[] = [];
  const skippedFiles: string[] = [];

  executionLogService.add({
    level: "info",
    actor: "File Generator",
    message: `Creating directory tree for ${files.length} generated files in ${baseDir}.`,
    metadata: { baseDir, fileCount: files.length },
  });

  await createDirectoryTree(baseDir, files.map((file) => file.relativePath));
  await Promise.all([
    fs.mkdir(path.join(baseDir, ".history"), { recursive: true }),
    fs.mkdir(path.join(baseDir, "diffs"), { recursive: true }),
    fs.mkdir(path.join(baseDir, "snapshots"), { recursive: true }),
  ]);

  for (const file of files) {
    const targetPath = path.join(baseDir, file.relativePath);
    const result = await writeGeneratedFile(targetPath, file.content);

    if (result.status === "written") {
      generatedFiles.push(file.relativePath);
      executionLogService.add({
        level: "info",
        actor: "File Writer",
        message: `Wrote generated file ${file.relativePath}.`,
        metadata: { targetPath },
      });
    } else {
      skippedFiles.push(file.relativePath);
      executionLogService.add({
        level: "warning",
        actor: "File Writer",
        message: `Skipped generated file ${file.relativePath} because the target already exists and is not managed by the generator.`,
        metadata: { targetPath },
      });
    }
  }

  await appendGeneratedLog(path.join(baseDir, ".agentforge-generated.log"), generatedFiles);

  executionLogService.add({
    level: "success",
    actor: "File Generator",
    message: `Generated ${generatedFiles.length} files and skipped ${skippedFiles.length} files.`,
    metadata: { baseDir, generatedFiles, skippedFiles },
  });

  return {
    generatedFiles,
    skippedFiles,
  };
}
