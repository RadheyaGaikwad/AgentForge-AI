export type ProjectArtifactType =
  | "manifest"
  | "component"
  | "page"
  | "layout"
  | "hook"
  | "route"
  | "controller"
  | "service"
  | "database-schema"
  | "migration"
  | "seed"
  | "test"
  | "review"
  | "utility"
  | "configuration"
  | "readme"
  | "environment"
  | "package"
  | "bug-report";

export interface ProjectArtifact {
  type: ProjectArtifactType;
  name: string;
  relativePath: string;
  path?: string;
  filename?: string;
  folder?: string;
  language: string;
  content: string;
  generatedBy: string;
  dependencies: string[];
  description: string;
}

export interface ProjectManifest {
  projectName: string;
  framework: string;
  language: string;
  packageManager: string;
  architecture: string;
  folderStructure: string[];
  requiredComponents: string[];
  backendServices: string[];
  database: string;
  configurationFiles: string[];
  readme: string;
  environmentVariables: string[];
  dependencies: string[];
  buildTool: string;
  testingStrategy: string;
}

export interface ValidationIssue {
  severity: "error" | "warning";
  label: string;
  details: string;
}

export interface ValidationReport {
  imports: string[];
  packageJson: string[];
  missingDependencies: string[];
  folderReferences: string[];
  duplicateFiles: string[];
  emptyFiles: string[];
  issues: ValidationIssue[];
}

export interface PreviewPageRoute {
  route: string;
  label: string;
  sourcePath: string;
}

export interface PreviewManifest {
  previewUrl: string;
  pages: PreviewPageRoute[];
  generatedAt: string;
  status?: "pending" | "ready" | "failed";
}

export interface ProjectSummary {
  filesGenerated: number;
  foldersGenerated: number;
  components: number;
  routes: number;
  databaseTables: number;
  estimatedLOC: number;
  framework: string;
  packageManager: string;
  readme: string;
}
