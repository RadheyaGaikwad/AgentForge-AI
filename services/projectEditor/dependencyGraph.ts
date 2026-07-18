import path from "node:path";
import type { CodeIndex } from "@/services/projectEditor/codeIndexer";
import type { ProjectScanResult } from "@/services/projectEditor/projectScanner";
import { resolveProjectImport } from "@/services/projectEditor/importResolver";

export interface DependencyGraphNode {
  relativePath: string;
  imports: string[];
  dependents: string[];
}

export interface DependencyGraphEdge {
  from: string;
  to: string;
  importPath: string;
}

export interface DependencyGraph {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
  adjacency: Map<string, string[]>;
}

export class DependencyGraphBuilder {
  async build(scanResult: ProjectScanResult, index: CodeIndex): Promise<DependencyGraph> {
    const adjacency = new Map<string, string[]>();
    const nodes = index.entries.map((entry) => ({
      relativePath: entry.relativePath,
      imports: entry.imports,
      dependents: [] as string[],
    }));

    const edges: DependencyGraphEdge[] = [];

    for (const entry of index.entries) {
      const localImports: string[] = [];

      for (const importPath of entry.imports) {
        const resolution = await resolveProjectImport(importPath, entry.absolutePath, scanResult.rootDirectory);
        if (!resolution.exists || !resolution.resolvedPath) {
          continue;
        }

        const relativeResolvedPath = path.relative(scanResult.rootDirectory, resolution.resolvedPath).split(path.sep).join("/");
        if (relativeResolvedPath.startsWith("..")) {
          continue;
        }

        localImports.push(relativeResolvedPath);
        edges.push({
          from: entry.relativePath,
          to: relativeResolvedPath,
          importPath,
        });
      }

      adjacency.set(entry.relativePath, localImports);
    }

    for (const edge of edges) {
      const parent = nodes.find((node) => node.relativePath === edge.to);
      if (!parent) {
        continue;
      }

      parent.dependents.push(edge.from);
    }

    return {
      nodes,
      edges,
      adjacency,
    };
  }
}

export async function buildDependencyGraph(scanResult: ProjectScanResult, index: CodeIndex): Promise<DependencyGraph> {
  const builder = new DependencyGraphBuilder();
  return await builder.build(scanResult, index);
}
