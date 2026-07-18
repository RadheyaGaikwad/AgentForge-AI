import type { ProjectArtifact, ValidationReport } from "@/types/projectArtifact";

export interface SharedContextSnapshot {
  projectInfo: Record<string, unknown>;
  architecture: string;
  requirements: string[];
  generatedFiles: string[];
  currentProgress: number;
  completedTasks: string[];
  agentOutputs: Record<string, string>;
  artifacts: ProjectArtifact[];
  validationReport: ValidationReport;
}

export interface ISharedContext {
  setProjectInfo(info: Record<string, unknown>): void;
  setArchitecture(architecture: string): void;
  addRequirement(requirement: string): void;
  addGeneratedFile(file: string): void;
  setArtifacts(artifacts: ProjectArtifact[]): void;
  setValidationReport(report: ValidationReport): void;
  updateProgress(progress: number): void;
  markTaskCompleted(taskId: string): void;
  recordAgentOutput(agentId: string, output: string): void;
  getSnapshot(): SharedContextSnapshot;
  clear(): void;
}

export class SharedContext implements ISharedContext {
  private projectInfo: Record<string, unknown> = {};
  private architecture = "";
  private requirements: string[] = [];
  private generatedFiles: string[] = [];
  private currentProgress = 0;
  private completedTasks: string[] = [];
  private agentOutputs: Record<string, string> = {};
  private artifacts: ProjectArtifact[] = [];
  private validationReport: ValidationReport = {
    imports: [],
    packageJson: [],
    missingDependencies: [],
    folderReferences: [],
    duplicateFiles: [],
    emptyFiles: [],
    issues: [],
  };

  setProjectInfo(info: Record<string, unknown>): void {
    this.projectInfo = { ...this.projectInfo, ...info };
  }

  setArchitecture(architecture: string): void {
    this.architecture = architecture;
  }

  addRequirement(requirement: string): void {
    if (!this.requirements.includes(requirement)) {
      this.requirements = [...this.requirements, requirement];
    }
  }

  addGeneratedFile(file: string): void {
    if (!this.generatedFiles.includes(file)) {
      this.generatedFiles = [...this.generatedFiles, file];
    }
  }

  setArtifacts(artifacts: ProjectArtifact[]): void {
    this.artifacts = artifacts.map((artifact) => ({ ...artifact }));
  }

  setValidationReport(report: ValidationReport): void {
    this.validationReport = { ...report, issues: report.issues.map((issue) => ({ ...issue })) };
  }

  updateProgress(progress: number): void {
    this.currentProgress = Math.max(0, Math.min(100, progress));
  }

  markTaskCompleted(taskId: string): void {
    if (!this.completedTasks.includes(taskId)) {
      this.completedTasks = [...this.completedTasks, taskId];
    }
  }

  recordAgentOutput(agentId: string, output: string): void {
    this.agentOutputs = {
      ...this.agentOutputs,
      [agentId]: output,
    };
  }

  getSnapshot(): SharedContextSnapshot {
    return {
      projectInfo: { ...this.projectInfo },
      architecture: this.architecture,
      requirements: [...this.requirements],
      generatedFiles: [...this.generatedFiles],
      currentProgress: this.currentProgress,
      completedTasks: [...this.completedTasks],
      agentOutputs: { ...this.agentOutputs },
      artifacts: this.artifacts.map((artifact) => ({ ...artifact })),
      validationReport: {
        imports: [...this.validationReport.imports],
        packageJson: [...this.validationReport.packageJson],
        missingDependencies: [...this.validationReport.missingDependencies],
        folderReferences: [...this.validationReport.folderReferences],
        duplicateFiles: [...this.validationReport.duplicateFiles],
        emptyFiles: [...this.validationReport.emptyFiles],
        issues: this.validationReport.issues.map((issue) => ({ ...issue })),
      },
    };
  }

  clear(): void {
    this.projectInfo = {};
    this.architecture = "";
    this.requirements = [];
    this.generatedFiles = [];
    this.currentProgress = 0;
    this.completedTasks = [];
    this.agentOutputs = {};
    this.artifacts = [];
    this.validationReport = {
      imports: [],
      packageJson: [],
      missingDependencies: [],
      folderReferences: [],
      duplicateFiles: [],
      emptyFiles: [],
      issues: [],
    };
  }
}
