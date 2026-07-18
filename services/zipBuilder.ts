import type { ProjectBuilderSnapshot } from "@/services/projectBuilder";

export class ZipBuilder {
  build(snapshot: ProjectBuilderSnapshot): Blob {
    const payload = snapshot.files
      .map((file) => `# ${file.relativePath}\n${file.content}\n---\n`)
      .join("\n");

    return new Blob([payload], { type: "application/octet-stream" });
  }
}

export const zipBuilder = new ZipBuilder();
