import { SystemPromptManager, type SystemPromptContext } from "@/services/systemPromptManager";
import { conversationMemoryService } from "@/services/conversationMemoryService";
import { sharedContextService } from "@/services/sharedContextService";
import { contextBuilder } from "@/services/contextBuilder";
import { smartContextEngine } from "@/services/context/smartContextEngine";
import { projectMemoryService } from "@/services/memory/projectMemoryService";

export interface PromptBuildInput {
  role: string;
  projectName: string;
  projectDescription?: string;
  phase: string;
  task?: string;
  objective?: string;
  currentTask?: string;
  context?: string;
  agentId: string;
}

export class PromptBuilder {
  constructor(private readonly systemPromptManager: SystemPromptManager = new SystemPromptManager()) {}

  build(input: PromptBuildInput): string {
    const sharedContext = sharedContextService.getSnapshot();
    const projectId = typeof sharedContext.projectInfo.id === "string" ? sharedContext.projectInfo.id : undefined;
    const projectKey = projectMemoryService.resolveProjectKey(input.projectName, projectId);
    const baseMemory = conversationMemoryService.buildContextPrompt(input.agentId, "");
    const smartContext = smartContextEngine.selectContext({
      projectKey,
      projectName: input.projectName,
      projectDescription: input.projectDescription ?? sharedContext.projectInfo.description?.toString(),
      agentRole: input.role,
      task: input.task,
      objective: input.objective,
      sharedContext,
      conversationMemory: baseMemory.split("\n").filter(Boolean),
    });
    const memory = smartContext.relevantMemoryEntries.length > 0
      ? smartContext.relevantMemoryEntries.join("\n")
      : baseMemory;
    const completedTasks = sharedContext.completedTasks.length > 0 ? sharedContext.completedTasks : ["None yet."];
    const contextString = contextBuilder.build({
      projectName: input.projectName,
      projectDescription: input.projectDescription ?? sharedContext.projectInfo.description?.toString(),
      agentRole: input.role,
      task: input.task,
      objective: input.objective,
      sharedContext,
      memory: smartContext.relevantMemoryEntries,
      completedTasks,
      smartContext,
    });

    const systemPromptContext: SystemPromptContext = {
      projectName: input.projectName,
      projectDescription: input.projectDescription ?? sharedContext.projectInfo.description?.toString(),
      phase: input.phase,
      task: input.task,
      objective: input.objective,
      sharedContext: contextString,
      memory,
      completedTasks,
      currentTask: input.currentTask ?? input.task ?? "No current task has been assigned.",
      expectedOutput: this.expectedOutputForRole(input.role),
    };

    return this.systemPromptManager.buildSystemPrompt(input.role, systemPromptContext);
  }

  private expectedOutputForRole(role: string): string {
    const normalized = role.toLowerCase();

    if (normalized.includes("frontend")) {
      return "Return actual source code files for the generated Next.js UI, including page, layout, and component updates.";
    }

    if (normalized.includes("backend")) {
      return "Return actual source code files for APIs, services, controllers, routes, and middleware updates.";
    }

    if (normalized.includes("database")) {
      return "Return actual Prisma schema, model, relation, and migration source files.";
    }

    if (normalized.includes("qa")) {
      return "Return validation results, install/lint/build logs, and any follow-up code fixes required.";
    }

    if (normalized.includes("architect")) {
      return "Return architecture decisions, trade-offs, and structural guidance.";
    }

    return "Return a concise, execution-ready update with next steps and risks.";
  }

  private renderSharedContext(sharedContext: ReturnType<typeof sharedContextService.getSnapshot>): string {
    return [
      sharedContext.architecture ? `Architecture: ${sharedContext.architecture}` : "Architecture: Not yet defined.",
      sharedContext.requirements.length > 0 ? `Requirements: ${sharedContext.requirements.join("; ")}` : "Requirements: None recorded.",
      sharedContext.generatedFiles.length > 0 ? `Generated Files: ${sharedContext.generatedFiles.join(", ")}` : "Generated Files: None yet.",
      `Progress: ${sharedContext.currentProgress}%`,
      sharedContext.completedTasks.length > 0 ? `Completed Tasks: ${sharedContext.completedTasks.join("; ")}` : "Completed Tasks: None yet.",
    ].join("\n");
  }
}

export const promptBuilder = new PromptBuilder();
