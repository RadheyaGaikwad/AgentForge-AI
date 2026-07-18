import path from "node:path";
import fs from "node:fs/promises";

export interface ImportResolutionResult {
  requestedTarget: string;
  resolvedPath: string | null;
  exists: boolean;
}

const SUPPORTED_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"];

export class ImportResolver {
  async resolve(importPath: string, fromFile: string, projectRoot: string): Promise<ImportResolutionResult> {
    const normalizedImportPath = importPath.trim();
    const fromDirectory = path.dirname(fromFile);

    let candidate = normalizedImportPath;
    if (normalizedImportPath.startsWith("@/")) {
      candidate = path.join(projectRoot, normalizedImportPath.replace(/^@\//u, ""));
    } else if (!path.isAbsolute(normalizedImportPath)) {
      candidate = path.resolve(fromDirectory, normalizedImportPath);
    }

    for (const extension of SUPPORTED_EXTENSIONS) {
      const possiblePath = extension.length > 0 ? `${candidate}${extension}` : candidate;

      try {
        await fs.access(possiblePath);
        return {
          requestedTarget: normalizedImportPath,
          resolvedPath: possiblePath,
          exists: true,
        };
      } catch {
        // Try the next candidate.
      }
    }

    const indexPath = path.join(candidate, "index.ts");
    try {
      await fs.access(indexPath);
      return {
        requestedTarget: normalizedImportPath,
        resolvedPath: indexPath,
        exists: true,
      };
    } catch {
      return {
        requestedTarget: normalizedImportPath,
        resolvedPath: null,
        exists: false,
      };
    }
  }
}

export async function resolveProjectImport(importPath: string, fromFile: string, projectRoot: string): Promise<ImportResolutionResult> {
  const resolver = new ImportResolver();
  return await resolver.resolve(importPath, fromFile, projectRoot);
}
