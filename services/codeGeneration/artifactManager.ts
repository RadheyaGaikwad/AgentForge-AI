import type { ProjectArtifact } from "@/types/projectArtifact";

const DEFAULT_ARTIFACT_TYPE = "configuration" as const;

const normalizePath = (value: string): string => value.replace(/\\/g, "/").replace(/^\//, "").trim();

const buildFolder = (relativePath: string): string => {
  const normalized = normalizePath(relativePath);
  const segments = normalized.split("/").filter(Boolean);
  segments.pop();
  return segments.join("/");
};

const buildFilename = (relativePath: string): string => {
  const normalized = normalizePath(relativePath);
  return normalized.split("/").filter(Boolean).pop() ?? "artifact";
};

const normalizeArtifact = (artifact: ProjectArtifact): ProjectArtifact => {
  const relativePath = normalizePath(artifact.relativePath || artifact.path || artifact.name || "artifact.txt");

  return {
    ...artifact,
    path: relativePath,
    relativePath,
    filename: artifact.filename ?? buildFilename(relativePath),
    folder: artifact.folder ?? buildFolder(relativePath),
    type: artifact.type ?? DEFAULT_ARTIFACT_TYPE,
    language: artifact.language?.trim() || "text",
    content: artifact.content ?? "",
    dependencies: Array.from(new Set((artifact.dependencies ?? []).filter(Boolean))),
    generatedBy: artifact.generatedBy?.trim() || "AI Agent",
    description: artifact.description?.trim() || `Generated ${relativePath}`,
  };
};

export class ArtifactManager {
  private readonly artifacts = new Map<string, ProjectArtifact>();

  addArtifact(artifact: ProjectArtifact): ProjectArtifact {
    const normalized = normalizeArtifact(artifact);
    this.artifacts.set(normalized.relativePath, normalized);
    return { ...normalized };
  }

  addArtifacts(artifacts: ProjectArtifact[]): ProjectArtifact[] {
    return artifacts.map((artifact) => this.addArtifact(artifact));
  }

  list(): ProjectArtifact[] {
    return Array.from(this.artifacts.values()).map((artifact) => ({ ...artifact }));
  }

  clear(): void {
    this.artifacts.clear();
  }

  getByRelativePath(relativePath: string): ProjectArtifact | undefined {
    return this.artifacts.get(normalizePath(relativePath));
  }

  buildFolderTree(): string[] {
    return Array.from(
      new Set(
        this.list()
          .map((artifact) => artifact.folder)
          .filter((folder): folder is string => Boolean(folder && folder.trim())),
      ),
    );
  }
}

export const artifactManager = new ArtifactManager();
