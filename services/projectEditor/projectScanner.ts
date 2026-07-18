import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";

export type ProjectFileKind = "code" | "config" | "data" | "asset" | "unknown";

export interface ProjectFileEntry {
  relativePath: string;
  absolutePath: string;
  size: number;
  mtimeMs: number;
  kind: ProjectFileKind;
}

export interface ProjectScanOptions {
  includeHidden?: boolean;
  includeRootFiles?: boolean;
}

export interface ProjectScanResult {
  rootDirectory: string;
  scannedAt: string;
  files: ProjectFileEntry[];
}

const DEFAULT_IGNORE_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "out",
  ".history",
  "diffs",
  "snapshots",
]);

const determineKind = (relativePath: string): ProjectFileKind => {
  const normalizedPath = relativePath.toLowerCase();

  if (/(\.(ts|tsx|js|jsx|mjs|cjs))$/u.test(normalizedPath)) {
    return "code";
  }

  if (/(package\.json|tsconfig\.json|next\.config\.ts|eslint\.config\.mjs|postcss\.config\.mjs|\.env|\.env\.example|\.gitignore)$/u.test(normalizedPath)) {
    return "config";
  }

  if (/(\.(json|yaml|yml|xml|toml|sql|lock))$/u.test(normalizedPath)) {
    return "data";
  }

  if (/(\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|mp4|mp3|pdf))$/u.test(normalizedPath)) {
    return "asset";
  }

  return "unknown";
};

export class ProjectScanner {
  async scan(rootDirectory: string, options: ProjectScanOptions = {}): Promise<ProjectScanResult> {
    const normalizedRoot = path.resolve(rootDirectory);
    const files: ProjectFileEntry[] = [];

    await this.walk(normalizedRoot, normalizedRoot, files, options);

    executionLogService.add({
      level: "info",
      actor: "Project Scanner",
      message: `Scanned ${files.length} files under ${normalizedRoot}.`,
      metadata: { rootDirectory: normalizedRoot, fileCount: files.length },
    });

    return {
      rootDirectory: normalizedRoot,
      scannedAt: new Date().toISOString(),
      files,
    };
  }

  private async walk(
    currentDirectory: string,
    rootDirectory: string,
    files: ProjectFileEntry[],
    options: ProjectScanOptions,
  ): Promise<void> {
    const directoryEntries = await fs.readdir(currentDirectory, { withFileTypes: true });

    for (const entry of directoryEntries) {
      const entryPath = path.join(currentDirectory, entry.name);
      const relativePath = path.relative(rootDirectory, entryPath).split(path.sep).join("/");

      if (entry.isDirectory()) {
        if (DEFAULT_IGNORE_DIRS.has(entry.name)) {
          continue;
        }

        if (!options.includeHidden && entry.name.startsWith(".")) {
          continue;
        }

        await this.walk(entryPath, rootDirectory, files, options);
        continue;
      }

      if (!options.includeHidden && entry.name.startsWith(".")) {
        continue;
      }

      if (!options.includeRootFiles && relativePath === entry.name) {
        continue;
      }

      const stat = await fs.stat(entryPath);
      files.push({
        relativePath,
        absolutePath: entryPath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        kind: determineKind(relativePath),
      });
    }
  }
}

export async function scanProjectDirectory(rootDirectory: string, options: ProjectScanOptions = {}): Promise<ProjectScanResult> {
  const scanner = new ProjectScanner();
  return await scanner.scan(rootDirectory, options);
}
