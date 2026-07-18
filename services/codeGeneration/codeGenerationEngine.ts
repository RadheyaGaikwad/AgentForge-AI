import { artifactManager } from "@/services/codeGeneration/artifactManager";
import { projectCodeBuilder } from "@/services/codeGeneration/projectBuilder";
import type { ProjectArtifact } from "@/types/projectArtifact";

export interface CodeGenerationEngineInput {
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

export class CodeGenerationEngine {
  generate(input: CodeGenerationEngineInput): ProjectArtifact[] {
    const generatedArtifacts = projectCodeBuilder.build({
      projectName: input.projectName,
      description: input.description,
      architecture: input.architecture,
      tasks: input.tasks,
      artifacts: input.artifacts,
      agentOutputs: input.agentOutputs,
      framework: input.framework,
      techStack: input.techStack,
    });

    artifactManager.clear();
    artifactManager.addArtifacts(generatedArtifacts);

    return artifactManager.list();
  }
}

export const codeGenerationEngine = new CodeGenerationEngine();
