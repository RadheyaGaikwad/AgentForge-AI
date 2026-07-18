import { FileRegistry, type FileRegistryEntry } from "@/services/fileRegistry";
import { buildPreviewManifest } from "@/services/previewManifest";
import { sharedContextService } from "@/services/sharedContextService";
import type { PreviewManifest, ProjectArtifact, ProjectManifest, ProjectSummary, ValidationReport } from "@/types/projectArtifact";

export interface ProjectBuilderSnapshot {
  manifest: ProjectManifest | null;
  artifacts: ProjectArtifact[];
  files: FileRegistryEntry[];
  validationReport: ValidationReport;
  projectSummary: ProjectSummary;
  previewManifest: PreviewManifest;
}

export class ProjectBuilder {
  private manifest: ProjectManifest | null = null;
  private readonly artifacts: ProjectArtifact[] = [];
  private readonly fileRegistry = new FileRegistry();
  private previewManifest: PreviewManifest = {
    previewUrl: "http://localhost:3000",
    pages: [],
    generatedAt: new Date().toISOString(),
    status: "pending",
  };

  reset(): void {
    this.manifest = null;
    this.artifacts.length = 0;
    this.fileRegistry.clear();
    this.previewManifest = {
      previewUrl: "http://localhost:3000",
      pages: [],
      generatedAt: new Date().toISOString(),
      status: "pending",
    };
    sharedContextService.clear();
  }

  ingestManifest(manifest: ProjectManifest): void {
    this.manifest = { ...manifest };
    this.registerFolders(manifest.folderStructure);
    sharedContextService.setProjectInfo({
      manifest,
      framework: manifest.framework,
      packageManager: manifest.packageManager,
    });
  }

  setPreviewManifest(previewManifest: PreviewManifest): void {
    this.previewManifest = {
      ...previewManifest,
      status: previewManifest.status ?? "ready",
      generatedAt: previewManifest.generatedAt ?? new Date().toISOString(),
    };
  }

  ingestArtifact(artifact: ProjectArtifact): void {
    const normalizedArtifact: ProjectArtifact = {
      ...artifact,
      dependencies: artifact.dependencies ?? [],
      content: artifact.content ?? "",
      generatedBy: artifact.generatedBy ?? "AI Agent",
    };

    const existingIndex = this.artifacts.findIndex((entry) => entry.relativePath === normalizedArtifact.relativePath);
    if (existingIndex >= 0) {
      this.artifacts[existingIndex] = normalizedArtifact;
    } else {
      this.artifacts.push(normalizedArtifact);
    }

    this.fileRegistry.register(normalizedArtifact);
    this.registerFolders([normalizedArtifact.relativePath]);
    sharedContextService.addGeneratedFile(normalizedArtifact.relativePath);
    sharedContextService.setArtifacts(this.artifacts.map((entry) => ({ ...entry })));
    sharedContextService.setValidationReport(this.validateProject());
    sharedContextService.updateProgress(Math.min(100, sharedContextService.getSnapshot().currentProgress + 4));
  }

  getSnapshot(): ProjectBuilderSnapshot {
    const files = this.fileRegistry.getEntries();
    const validationReport = this.validateProject();
    const projectSummary = this.buildProjectSummary();
    const previewManifest = this.previewManifest.status === "ready"
      ? { ...this.previewManifest }
      : this.buildPreviewManifest();

    return {
      manifest: this.manifest,
      artifacts: this.artifacts.map((artifact) => ({ ...artifact })),
      files,
      validationReport,
      projectSummary,
      previewManifest,
    };
  }

  validateProject(): ValidationReport {
    const importMatches = this.artifacts.flatMap((artifact) => {
      const matches = artifact.content.match(/from\s+["']([^"']+)["']/g) ?? [];
      return matches.map((match) => match.replace(/from\s+["']/, "").replace(/["']$/, ""));
    });

    const packageDependencies = new Set(this.manifest?.dependencies ?? []);
    const missingDependencies = importMatches.filter((dependency) => !dependency.startsWith("@/") && !packageDependencies.has(dependency));
    const duplicateFiles = this.artifacts
      .map((artifact) => artifact.relativePath)
      .filter((relativePath, index, all) => all.indexOf(relativePath) !== index);
    const emptyFiles = this.artifacts.filter((artifact) => !artifact.content.trim()).map((artifact) => artifact.relativePath);
    const folderReferences = this.artifacts.flatMap((artifact) => {
      const references = artifact.content.match(/\.\.\/[A-Za-z0-9_./-]+/g) ?? [];
      return references.map((reference) => `${artifact.relativePath}: ${reference}`);
    });

    const issues = [
      ...missingDependencies.map((dependency) => ({
        severity: "warning" as const,
        label: "Missing dependency",
        details: `The generated project references ${dependency} but it is not declared in the manifest dependency list.`,
      })),
      ...emptyFiles.map((file) => ({
        severity: "warning" as const,
        label: "Empty file",
        details: `The artifact ${file} is empty and should be filled before assembly.`,
      })),
      ...duplicateFiles.map((file) => ({
        severity: "error" as const,
        label: "Duplicate file",
        details: `More than one artifact targets ${file}. The builder will keep the latest version only.`,
      })),
    ];

    return {
      imports: Array.from(new Set(importMatches)),
      packageJson: [...new Set(this.manifest?.dependencies ?? [])],
      missingDependencies: Array.from(new Set(missingDependencies)),
      folderReferences: Array.from(new Set(folderReferences)),
      duplicateFiles: Array.from(new Set(duplicateFiles)),
      emptyFiles: Array.from(new Set(emptyFiles)),
      issues,
    };
  }

  buildProjectSummary(): ProjectSummary {
    const filesGenerated = this.fileRegistry.getEntries().length;
    const foldersGenerated = Array.from(new Set(this.fileRegistry.getEntries().map((entry) => entry.relativePath.split("/").slice(0, -1).join("/")).filter(Boolean))).length;
    const components = this.artifacts.filter((artifact) => artifact.type === "component" || artifact.type === "page" || artifact.type === "layout").length;
    const routes = this.artifacts.filter((artifact) => artifact.type === "route" || artifact.type === "controller").length;
    const databaseTables = this.artifacts.filter((artifact) => artifact.type === "database-schema" || artifact.type === "migration" || artifact.type === "seed").length;
    const estimatedLOC = this.artifacts.reduce((total, artifact) => total + artifact.content.split(/\r?\n/).length, 0);

    return {
      filesGenerated,
      foldersGenerated,
      components,
      routes,
      databaseTables,
      estimatedLOC,
      framework: this.manifest?.framework ?? "Unknown",
      packageManager: this.manifest?.packageManager ?? "Unknown",
      readme: this.manifest?.readme ?? "README.md",
    };
  }

  private buildPreviewManifest(): PreviewManifest {
    const previewUrl = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "http://localhost:3000";
    return {
      ...buildPreviewManifest({ previewUrl, artifacts: this.artifacts }),
      status: "pending",
    };
  }

  private registerFolders(relativePaths: string[]): void {
    relativePaths.forEach((relativePath) => {
      const segments = relativePath.split("/").slice(0, -1);
      if (segments.length === 0) {
        return;
      }

      for (let index = 1; index <= segments.length; index += 1) {
        const folderPath = segments.slice(0, index).join("/");
        if (folderPath) {
          sharedContextService.addGeneratedFile(folderPath);
        }
      }
    });
  }
}

export const projectBuilder = new ProjectBuilder();
