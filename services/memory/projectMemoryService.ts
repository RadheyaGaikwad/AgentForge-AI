import type { Project } from "@/types/project";
import { BrowserStorageManager } from "@/services/storage/browserStorageManager";
import type { ProjectArtifact } from "@/types/projectArtifact";

export type ProjectMemoryEntryType =
  | "architecture"
  | "technology"
  | "api"
  | "database"
  | "component"
  | "constraint"
  | "approval"
  | "output"
  | "change";

export interface ProjectMemoryEntry {
  id: string;
  type: ProjectMemoryEntryType;
  title: string;
  content: string;
  timestamp: string;
  source?: string;
}

export interface ProjectDependencyGraph {
  [filePath: string]: string[];
}

export interface ProjectMemorySnapshot {
  projectKey: string;
  projectName: string;
  projectPath?: string;
  projectSummary?: string;
  architectureSummary: string;
  techStack: string[];
  databaseSelection: string | null;
  apiIntegrations: string[];
  components: string[];
  generatedFiles: string[];
  approvals: string[];
  constraints: string[];
  memoryEntries: ProjectMemoryEntry[];
  dependencyGraph: ProjectDependencyGraph;
  recentChanges: string[];
  lastUpdatedAt: string;
}

interface ProjectMemoryRecordMap {
  [projectKey: string]: ProjectMemorySnapshot;
}

const STORAGE_KEY = "agentforge.project-memory";

export class ProjectMemoryService {
  private readonly inMemory = new Map<string, ProjectMemorySnapshot>();

  resolveProjectKey(projectName: string, projectId?: string): string {
    const stableKey = `${projectId ?? ""}:${projectName}`.trim().toLowerCase();
    return stableKey.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled-project";
  }

  loadProjectMemory(projectKey: string, fallbackProjectName = "Untitled Project"): ProjectMemorySnapshot {
    const normalizedKey = this.normalizeProjectKey(projectKey);
    const cached = this.inMemory.get(normalizedKey);

    if (cached) {
      return this.clone(cached);
    }

    const persisted = this.readStorage();
    const existing = persisted[normalizedKey];

    if (existing) {
      this.inMemory.set(normalizedKey, this.clone(existing));
      return this.clone(existing);
    }

    const snapshot = this.createEmptySnapshot(normalizedKey, fallbackProjectName);
    this.inMemory.set(normalizedKey, snapshot);
    this.persist();
    return this.clone(snapshot);
  }

  hydrateProjectMemory(project: Project, summary: Partial<ProjectMemorySnapshot> = {}): ProjectMemorySnapshot {
    const projectKey = this.resolveProjectKey(project.name, project.id);
    const current = this.loadProjectMemory(projectKey, project.name);
    const merged: ProjectMemorySnapshot = {
      ...current,
      projectKey,
      projectName: project.name,
      projectPath: summary.projectPath ?? project.projectPath ?? current.projectPath,
      projectSummary: summary.projectSummary ?? project.projectSummary ?? current.projectSummary ?? this.createProjectSummary(project.name, summary, current),
      architectureSummary: summary.architectureSummary ?? current.architectureSummary,
      techStack: summary.techStack?.length ? summary.techStack : current.techStack,
      databaseSelection: summary.databaseSelection ?? current.databaseSelection,
      apiIntegrations: summary.apiIntegrations?.length ? summary.apiIntegrations : current.apiIntegrations,
      components: summary.components?.length ? summary.components : current.components,
      generatedFiles: summary.generatedFiles?.length ? summary.generatedFiles.slice(0, 6) : current.generatedFiles,
      approvals: summary.approvals?.length ? summary.approvals : current.approvals,
      constraints: summary.constraints?.length ? summary.constraints : current.constraints,
      memoryEntries: summary.memoryEntries?.length ? summary.memoryEntries : current.memoryEntries,
      dependencyGraph: summary.dependencyGraph ? { ...summary.dependencyGraph } : { ...current.dependencyGraph },
      recentChanges: summary.recentChanges?.length ? summary.recentChanges : current.recentChanges,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.inMemory.set(projectKey, merged);
    this.persist();
    return this.clone(merged);
  }

  rememberEntry(projectKey: string, entry: Omit<ProjectMemoryEntry, "id" | "timestamp">, projectName = "Untitled Project"): ProjectMemorySnapshot {
    const normalizedKey = this.normalizeProjectKey(projectKey);
    const current = this.loadProjectMemory(normalizedKey, projectName);
    const nextEntry: ProjectMemoryEntry = {
      ...entry,
      content: BrowserStorageManager.summarizeText(entry.content, 600),
      id: `${entry.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };

    const next: ProjectMemorySnapshot = {
      ...current,
      projectName,
      memoryEntries: [...current.memoryEntries, nextEntry].slice(-24),
      lastUpdatedAt: nextEntry.timestamp,
    };

    if (nextEntry.type === "change") {
      next.recentChanges = [nextEntry.content, ...current.recentChanges].slice(0, 10);
    }

    this.inMemory.set(normalizedKey, next);
    this.persist();
    return this.clone(next);
  }

  rememberGeneratedFile(projectKey: string, relativePath: string, projectName = "Untitled Project"): ProjectMemorySnapshot {
    const current = this.loadProjectMemory(projectKey, projectName);
    const next: ProjectMemorySnapshot = {
      ...current,
      projectName,
      projectPath: current.projectPath ?? relativePath,
      generatedFiles: this.appendUnique(current.generatedFiles.slice(0, 6), relativePath).slice(0, 6),
      recentChanges: this.appendUnique(current.recentChanges, `Generated file: ${relativePath}`).slice(0, 10),
      lastUpdatedAt: new Date().toISOString(),
    };

    this.inMemory.set(this.normalizeProjectKey(projectKey), next);
    this.persist();
    return this.clone(next);
  }

  rememberApproval(projectKey: string, approval: string, projectName = "Untitled Project"): ProjectMemorySnapshot {
    const current = this.loadProjectMemory(projectKey, projectName);
    const next: ProjectMemorySnapshot = {
      ...current,
      projectName,
      approvals: this.appendUnique(current.approvals, approval),
      lastUpdatedAt: new Date().toISOString(),
    };

    this.inMemory.set(this.normalizeProjectKey(projectKey), next);
    this.persist();
    return this.clone(next);
  }

  rememberConstraint(projectKey: string, constraint: string, projectName = "Untitled Project"): ProjectMemorySnapshot {
    const current = this.loadProjectMemory(projectKey, projectName);
    const next: ProjectMemorySnapshot = {
      ...current,
      projectName,
      constraints: this.appendUnique(current.constraints, constraint),
      lastUpdatedAt: new Date().toISOString(),
    };

    this.inMemory.set(this.normalizeProjectKey(projectKey), next);
    this.persist();
    return this.clone(next);
  }

  syncKnowledge(projectKey: string, projectName: string, knowledge: Partial<ProjectMemorySnapshot>): ProjectMemorySnapshot {
    const normalizedKey = this.normalizeProjectKey(projectKey);
    const current = this.loadProjectMemory(normalizedKey, projectName);
    const next: ProjectMemorySnapshot = {
      ...current,
      projectName,
      projectPath: knowledge.projectPath ?? current.projectPath,
      projectSummary: knowledge.projectSummary ?? current.projectSummary ?? this.createProjectSummary(projectName, knowledge, current),
      architectureSummary: knowledge.architectureSummary ?? current.architectureSummary,
      techStack: knowledge.techStack?.length ? [...knowledge.techStack] : current.techStack,
      databaseSelection: knowledge.databaseSelection ?? current.databaseSelection,
      apiIntegrations: knowledge.apiIntegrations?.length ? [...knowledge.apiIntegrations] : current.apiIntegrations,
      components: knowledge.components?.length ? [...knowledge.components] : current.components,
      generatedFiles: knowledge.generatedFiles?.length ? [...knowledge.generatedFiles].slice(0, 6) : current.generatedFiles,
      approvals: knowledge.approvals?.length ? [...knowledge.approvals] : current.approvals,
      constraints: knowledge.constraints?.length ? [...knowledge.constraints] : current.constraints,
      memoryEntries: knowledge.memoryEntries?.length ? [...knowledge.memoryEntries] : current.memoryEntries,
      dependencyGraph: knowledge.dependencyGraph ? { ...knowledge.dependencyGraph } : { ...current.dependencyGraph },
      recentChanges: knowledge.recentChanges?.length ? [...knowledge.recentChanges] : current.recentChanges,
      lastUpdatedAt: new Date().toISOString(),
    };

    this.inMemory.set(normalizedKey, next);
    this.persist();
    return this.clone(next);
  }

  buildDependencyGraph(artifacts: ProjectArtifact[]): ProjectDependencyGraph {
    return artifacts.reduce<ProjectDependencyGraph>((graph, artifact) => {
      const dependencies = artifact.dependencies ?? [];
      if (dependencies.length === 0 && artifact.relativePath) {
        graph[artifact.relativePath] = [];
        return graph;
      }

      graph[artifact.relativePath] = dependencies;
      return graph;
    }, {});
  }

  private normalizeProjectKey(projectKey: string): string {
    return projectKey.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled-project";
  }

  private createEmptySnapshot(projectKey: string, projectName: string): ProjectMemorySnapshot {
    return {
      projectKey,
      projectName,
      projectPath: undefined,
      projectSummary: "Project summary pending.",
      architectureSummary: "Architecture has not been defined yet.",
      techStack: [],
      databaseSelection: null,
      apiIntegrations: [],
      components: [],
      generatedFiles: [],
      approvals: [],
      constraints: [],
      memoryEntries: [],
      dependencyGraph: {},
      recentChanges: [],
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  private clone(snapshot: ProjectMemorySnapshot): ProjectMemorySnapshot {
    return {
      ...snapshot,
      techStack: [...snapshot.techStack],
      apiIntegrations: [...snapshot.apiIntegrations],
      components: [...snapshot.components],
      generatedFiles: [...snapshot.generatedFiles].slice(0, 6),
      approvals: [...snapshot.approvals],
      constraints: [...snapshot.constraints],
      memoryEntries: snapshot.memoryEntries.map((entry) => ({ ...entry })),
      dependencyGraph: { ...snapshot.dependencyGraph },
      recentChanges: [...snapshot.recentChanges],
    };
  }

  private appendUnique(items: string[], value: string): string[] {
    return items.includes(value) ? items : [...items, value];
  }

  private readStorage(): ProjectMemoryRecordMap {
    const persisted = BrowserStorageManager.loadMetadata<ProjectMemoryRecordMap>(STORAGE_KEY);
    return persisted && typeof persisted === "object" ? persisted : {};
  }

  private persist(): void {
    if (typeof window === "undefined") {
      return;
    }

    const nextRecord: ProjectMemoryRecordMap = {};
    this.inMemory.forEach((snapshot, projectKey) => {
      nextRecord[projectKey] = this.toPersistedSnapshot(snapshot);
    });

    BrowserStorageManager.saveMetadataDebounced(STORAGE_KEY, nextRecord);
  }

  private toPersistedSnapshot(snapshot: ProjectMemorySnapshot): ProjectMemorySnapshot {
    return {
      ...snapshot,
      projectPath: snapshot.projectPath,
      projectSummary: snapshot.projectSummary ?? this.createProjectSummary(snapshot.projectName, {}, snapshot),
      architectureSummary: snapshot.architectureSummary,
      techStack: [...snapshot.techStack].slice(0, 6),
      apiIntegrations: [...snapshot.apiIntegrations].slice(0, 6),
      components: [...snapshot.components].slice(0, 6),
      generatedFiles: [],
      approvals: [...snapshot.approvals].slice(0, 6),
      constraints: [...snapshot.constraints].slice(0, 6),
      memoryEntries: snapshot.memoryEntries.map((entry) => ({
        ...entry,
        content: BrowserStorageManager.summarizeText(entry.content, 400),
      })).slice(0, 12),
      dependencyGraph: {},
      recentChanges: [...snapshot.recentChanges].slice(0, 6),
      lastUpdatedAt: snapshot.lastUpdatedAt,
    };
  }

  private createProjectSummary(projectName: string, summary: Partial<ProjectMemorySnapshot>, current: ProjectMemorySnapshot): string {
    const componentCount = summary.components?.length ?? current.components.length;
    const approvalCount = summary.approvals?.length ?? current.approvals.length;
    const memoryCount = summary.memoryEntries?.length ?? current.memoryEntries.length;
    const pathHint = current.projectPath ? ` at ${current.projectPath}` : "";

    return `${projectName}${pathHint} • ${componentCount} components • ${memoryCount} memory refs • ${approvalCount} approvals`;
  }
}

export const projectMemoryService = new ProjectMemoryService();
