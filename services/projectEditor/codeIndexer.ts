import fs from "node:fs/promises";
import path from "node:path";
import type { ProjectScanResult } from "@/services/projectEditor/projectScanner";

export interface CodeIndexEntry {
  relativePath: string;
  absolutePath: string;
  language: string;
  imports: string[];
  exports: string[];
  content: string;
}

export interface CodeIndex {
  entries: CodeIndexEntry[];
  byRelativePath: Map<string, CodeIndexEntry>;
}

const LANGUAGE_BY_EXTENSION = new Map<string, string>([
  [".ts", "typescript"],
  [".tsx", "tsx"],
  [".js", "javascript"],
  [".jsx", "jsx"],
  [".md", "markdown"],
  [".json", "json"],
  [".css", "css"],
  [".scss", "scss"],
  [".html", "html"],
]);

const extractImports = (content: string): string[] => {
  const matches = Array.from(content.matchAll(/import\s+(?:[^\n]*?\s+from\s+)?["']([^"']+)["']/gu));
  const dynamicMatches = Array.from(content.matchAll(/import\([\s\S]*?["']([^"']+)["']\)/gu));
  return [...matches.map((match) => match[1]), ...dynamicMatches.map((match) => match[1])];
};

const extractExports = (content: string): string[] => {
  const exportMatches = Array.from(content.matchAll(/export\s+(?:default\s+)?(?:const|class|function|interface|type|enum|async\s+function)\s+([A-Za-z0-9_]+)/gu));
  const namedMatches = Array.from(content.matchAll(/export\s*\{([^}]+)\}/gu));
  const exportedNames = exportMatches.map((match) => match[1]);
  const namedExports = namedMatches.flatMap((match) => match[1].split(",").map((token) => token.replace(/\s|\{|\}/gu, ""))).filter(Boolean);
  return [...new Set([...exportedNames, ...namedExports])];
};

export class CodeIndexer {
  async index(scanResult: ProjectScanResult): Promise<CodeIndex> {
    const entries = await Promise.all(
      scanResult.files
        .filter((entry) => entry.kind === "code" || entry.kind === "config")
        .map(async (entry) => {
          const content = await fs.readFile(entry.absolutePath, "utf8");
          const extension = path.extname(entry.absolutePath).toLowerCase();

          return {
            relativePath: entry.relativePath,
            absolutePath: entry.absolutePath,
            language: LANGUAGE_BY_EXTENSION.get(extension) ?? "text",
            imports: extractImports(content),
            exports: extractExports(content),
            content,
          } satisfies CodeIndexEntry;
        }),
    );

    const byRelativePath = new Map(entries.map((entry) => [entry.relativePath, entry]));

    return {
      entries,
      byRelativePath,
    };
  }
}

export async function buildCodeIndex(scanResult: ProjectScanResult): Promise<CodeIndex> {
  const indexer = new CodeIndexer();
  return await indexer.index(scanResult);
}
