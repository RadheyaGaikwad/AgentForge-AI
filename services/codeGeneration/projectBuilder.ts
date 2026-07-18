import type { ProjectArtifact } from "@/types/projectArtifact";
import { artifactManager } from "@/services/codeGeneration/artifactManager";
import { dependencyResolver } from "@/services/codeGeneration/dependencyResolver";
import { languageResolver } from "@/services/codeGeneration/languageResolver";
import { packageGenerator } from "@/services/codeGeneration/packageGenerator";
import { readmeGenerator } from "@/services/codeGeneration/readmeGenerator";
import { templateRegistry } from "@/services/codeGeneration/templateRegistry";
import { responseParser } from "@/services/responseParser";

export interface ProjectBuildInput {
  projectName: string;
  description?: string;
  architecture?: string;
  tasks?: string[];
  artifacts?: ProjectArtifact[];
  agentOutputs?: Array<{
    role: string;
    phase: string;
    content: string;
    files?: Array<{ path: string; content: string; language: string }>;
  }>;
  framework?: string;
  techStack?: string[];
}

const cleanArtifactContent = (content: string): string => {
  return content
    .replace(/```(?:ts|tsx|js|jsx|json|md|markdown|prisma|sql|yaml|yml|dotenv|bash)?\s*/gi, "")
    .replace(/```/g, "")
    .trim();
};

export class ProjectBuilder {
  build(input: ProjectBuildInput): ProjectArtifact[] {
    artifactManager.clear();

    const framework = input.framework ?? "nextjs";
    const techStack = input.techStack ?? [];
    const template = templateRegistry.getTemplate(framework);
    template.folders.forEach((folder) => {
      if (folder && folder.trim()) {
        artifactManager.addArtifact({
          type: "configuration",
          name: folder,
          relativePath: `${folder}/.gitkeep`,
          language: "text",
          content: "",
          generatedBy: "AgentForge Engine",
          dependencies: [],
          description: `Tracks the ${folder} directory in the generated project tree.`,
        });
      }
    });

    const packageArtifact = packageGenerator.generate({
      projectName: input.projectName,
      framework,
      techStack,
      description: input.description,
    });

    artifactManager.addArtifact({
      type: "package",
      name: packageArtifact.fileName,
      relativePath: packageArtifact.fileName,
      language: "json",
      content: packageArtifact.content,
      generatedBy: "AgentForge Engine",
      dependencies: packageArtifact.dependencies,
      description: "Generated package manifest for the project.",
    });

    artifactManager.addArtifact({
      type: "readme",
      name: "README.md",
      relativePath: "README.md",
      language: "markdown",
      content: readmeGenerator.generate({
        projectName: input.projectName,
        description: input.description,
        framework,
        techStack,
        architecture: input.architecture,
      }),
      generatedBy: "AgentForge Engine",
      dependencies: dependencyResolver.resolve({ framework, techStack }),
      description: "Generated project documentation.",
    });

    artifactManager.addArtifact({
      type: "environment",
      name: ".env.example",
      relativePath: ".env.example",
      language: "dotenv",
      content: "NEXT_PUBLIC_APP_NAME=generated-app\nNEXT_PUBLIC_API_URL=http://localhost:3000",
      generatedBy: "AgentForge Engine",
      dependencies: [],
      description: "Environment example file for the generated project.",
    });

    artifactManager.addArtifact({
      type: "configuration",
      name: ".gitignore",
      relativePath: ".gitignore",
      language: "gitignore",
      content: "node_modules\n.next\n.env\n.env.local\ncoverage\n",
      generatedBy: "AgentForge Engine",
      dependencies: [],
      description: "Git ignore file for the generated project.",
    });

    (input.artifacts ?? []).forEach((artifact) => {
      artifactManager.addArtifact({
        ...artifact,
        relativePath: artifact.relativePath || artifact.path || artifact.name,
        language: artifact.language || languageResolver.resolve(artifact.relativePath || artifact.path || artifact.name).language,
        content: cleanArtifactContent(artifact.content ?? ""),
        dependencies: Array.from(new Set((artifact.dependencies ?? []).filter(Boolean))),
      });
    });

    (input.agentOutputs ?? []).forEach((output) => {
      const parsed = responseParser.parse(output.content);
      const filesToAdd = output.files ?? (parsed.files ?? []);
      filesToAdd.forEach((file) => {
        artifactManager.addArtifact({
          type: "configuration",
          name: file.path.split("/").pop() ?? output.phase,
          relativePath: file.path,
          path: file.path,
          filename: file.path.split("/").pop() ?? output.phase,
          folder: file.path.split("/").slice(0, -1).join("/"),
          language: file.language || languageResolver.resolve(file.path).language,
          content: cleanArtifactContent(file.content ?? ""),
          generatedBy: output.role,
          dependencies: [],
          description: `${output.role} produced ${file.path} during ${output.phase}.`,
        });
      });
    });

    const finalArtifacts = artifactManager.list().filter((artifact) => !artifact.relativePath.endsWith("/.gitkeep"));
    artifactManager.clear();
    finalArtifacts.forEach((artifact) => artifactManager.addArtifact(artifact));

    return artifactManager.list();
  }
}

export const projectCodeBuilder = new ProjectBuilder();
