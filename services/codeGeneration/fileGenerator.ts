import type { ProjectArtifact } from "@/types/projectArtifact";

export interface ProjectFilePayload {
  relativePath: string;
  content: string;
  language: string;
}

export class FileGenerator {
  toFilePayloads(artifacts: ProjectArtifact[]): ProjectFilePayload[] {
    return artifacts
      .map((artifact) => ({
        relativePath: artifact.relativePath ?? artifact.path ?? artifact.name,
        content: artifact.content ?? "",
        language: artifact.language ?? "text",
      }))
      .filter((payload): payload is ProjectFilePayload => Boolean(payload.relativePath));
  }
}

export const fileGenerator = new FileGenerator();
