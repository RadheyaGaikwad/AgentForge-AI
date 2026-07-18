import type { ProjectBuilderSnapshot } from "@/services/projectBuilder";
import { readmeGenerator } from "@/services/export/readmeGenerator";
import type { Project } from "@/types/project";

export interface ProjectPackageFile {
  path: string;
  content: string;
}

export interface ProjectPackageBundle {
  files: ProjectPackageFile[];
  readme: string;
  installGuide: string;
  projectSummary: string;
}

const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "") || "generated-project";

export class ProjectPackageService {
  build(snapshot: ProjectBuilderSnapshot, project?: Project): ProjectPackageBundle {
    const files = snapshot.files.map((entry) => ({
      path: entry.relativePath,
      content: entry.content,
    }));

    const environmentVariables = snapshot.manifest?.environmentVariables ?? [];
    const envExampleContent = [
      "# Environment variables for the generated project",
      ...environmentVariables.map((variable) => `${variable}=`),
      "",
      "# Add your project-specific values here.",
    ].join("\n");

    const readme = readmeGenerator.generate(snapshot, project);
    const installGuide = this.buildInstallGuide(snapshot, project);
    const projectSummary = this.buildProjectSummary(snapshot, project);

    const packageFiles = new Map<string, ProjectPackageFile>();

    files.forEach((file) => {
      packageFiles.set(file.path, file);
    });

    packageFiles.set("README.md", { path: "README.md", content: readme });
    packageFiles.set("INSTALL.md", { path: "INSTALL.md", content: installGuide });
    packageFiles.set("PROJECT_SUMMARY.md", { path: "PROJECT_SUMMARY.md", content: projectSummary });
    packageFiles.set(".env.example", { path: ".env.example", content: envExampleContent });

    return {
      files: Array.from(packageFiles.values()).sort((left, right) => left.path.localeCompare(right.path)),
      readme,
      installGuide,
      projectSummary,
    };
  }

  buildInstallGuide(snapshot: ProjectBuilderSnapshot, project?: Project): string {
    const packageManager = snapshot.manifest?.packageManager ?? snapshot.projectSummary.packageManager;
    const projectName = project?.name ?? snapshot.manifest?.projectName ?? "AgentForge Project";

    return [
      `# Install Guide for ${projectName}`,
      "",
      "## Quick start",
      "```bash",
      `${packageManager === "pnpm" ? "pnpm install" : packageManager === "yarn" ? "yarn install" : "npm install"}`,
      `${packageManager === "pnpm" ? "pnpm dev" : packageManager === "yarn" ? "yarn dev" : "npm run dev"}`,
      "```",
      "",
      "## Files included in the export",
      "- `README.md`",
      "- `INSTALL.md`",
      "- `PROJECT_SUMMARY.md`",
      "- `.env.example`",
      "- Generated source files from the current workspace snapshot",
      "",
      "## Verification",
      "Run the generated project’s lint and build commands before publishing the final export.",
    ].join("\n");
  }

  buildProjectSummary(snapshot: ProjectBuilderSnapshot, project?: Project): string {
    const projectName = project?.name ?? snapshot.manifest?.projectName ?? "AgentForge Project";
    const summary = snapshot.projectSummary;
    const issueCount = snapshot.validationReport.issues.length;

    return [
      `# Project Summary: ${projectName}`,
      "",
      `Framework: ${summary.framework}`,
      `Package Manager: ${summary.packageManager}`,
      `Files Generated: ${summary.filesGenerated}`,
      `Folders Generated: ${summary.foldersGenerated}`,
      `Components: ${summary.components}`,
      `Routes: ${summary.routes}`,
      `Database Tables: ${summary.databaseTables}`,
      `Estimated LOC: ${summary.estimatedLOC}`,
      `Validation Issues: ${issueCount}`,
      "",
      "## Notes",
      "The export bundle preserves the project snapshot as a packaged set of generated files, along with the canonical install and summary documentation requested for completion.",
      "",
      "## Output",
      `- ${summary.readme}`,
      "- INSTALL.md",
      "- PROJECT_SUMMARY.md",
      "- .env.example",
    ].join("\n");
  }

  getArchiveName(project?: Project): string {
    const projectName = project?.name ?? "agentforge-project";
    return `${slugify(projectName)}-export.zip`;
  }
}

export const projectPackageService = new ProjectPackageService();
