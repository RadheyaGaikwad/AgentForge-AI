import type { ProjectArtifact } from "@/types/projectArtifact";

export interface FileRegistryEntry {
  absolutePath: string;
  relativePath: string;
  version: number;
  generatedByAgent: string;
  status: "Generated" | "Updated" | "Validated";
  dependencies: string[];
  creationTime: string;
  lastUpdated: string;
  language: string;
  content: string;
  type: ProjectArtifact["type"];
}

export class FileRegistry {
  private readonly entries = new Map<string, FileRegistryEntry>();

  register(artifact: ProjectArtifact): FileRegistryEntry {
    const timestamp = new Date().toISOString();
    const existing = this.entries.get(artifact.relativePath);

    const record: FileRegistryEntry = {
      absolutePath: `workspace://${artifact.relativePath}`,
      relativePath: artifact.relativePath,
      version: existing ? existing.version + 1 : 1,
      generatedByAgent: artifact.generatedBy,
      status: existing ? "Updated" : "Generated",
      dependencies: artifact.dependencies,
      creationTime: existing?.creationTime ?? timestamp,
      lastUpdated: timestamp,
      language: artifact.language,
      content: artifact.content,
      type: artifact.type,
    };

    this.entries.set(artifact.relativePath, record);
    return { ...record };
  }

  getEntries(): FileRegistryEntry[] {
    return Array.from(this.entries.values()).sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  }

  getEntry(relativePath: string): FileRegistryEntry | undefined {
    return this.entries.get(relativePath);
  }

  clear(): void {
    this.entries.clear();
  }
}
