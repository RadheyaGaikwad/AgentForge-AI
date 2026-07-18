import { conversationMemoryService } from "@/services/conversationMemoryService";
import { ProjectMemory } from "@/services/projectMemory";
import { sharedContextService } from "@/services/sharedContextService";
import { projectBuilder } from "@/services/projectBuilder";
import { BrowserStorageManager } from "@/services/storage/browserStorageManager";
import { responseParser, type ParsedResponse } from "@/services/responseParser";
import { projectMemoryService } from "@/services/memory/projectMemoryService";
import type { ProjectArtifact } from "@/types/projectArtifact";

const projectMemory = new ProjectMemory();

export interface ConversationManagerSnapshot {
  memory: Record<string, unknown>;
  outputs: Record<string, string>;
  history: string[];
}

export class ConversationManager {
  recordResponse(agentId: string, role: string, phase: string, content: string): ParsedResponse {
    const parsed = responseParser.parse(content);
    const sharedContext = sharedContextService.getSnapshot();
    const projectName = sharedContext.projectInfo.name?.toString() ?? "Untitled Project";
    const projectKey = projectMemoryService.resolveProjectKey(projectName, typeof sharedContext.projectInfo.id === "string" ? sharedContext.projectInfo.id : undefined);

    conversationMemoryService.record(agentId, {
      role,
      phase,
      content,
      timestamp: new Date().toISOString(),
      type: "response",
    });

    sharedContextService.recordAgentOutput(agentId, BrowserStorageManager.summarizeText(content, 800));
    sharedContextService.updateProgress(Math.max(sharedContextService.getSnapshot().currentProgress, 5));

    projectMemoryService.rememberEntry(projectKey, {
      type: "output",
      title: `${role} ${phase}`,
      content,
      source: agentId,
    }, projectName);

    if (parsed.type === "tasks") {
      const tasks = Array.isArray(parsed.content) ? parsed.content : [];
      tasks.forEach((task) => {
        if (typeof task === "string") {
          sharedContextService.markTaskCompleted(task);
        }
      });
    }

    const sourceArtifacts = parsed.files?.length
      ? parsed.files.map((file) => this.createArtifactFromSourceFile(file, role, phase))
      : [this.createArtifactFromParsedResponse(parsed, role, phase)];

    sourceArtifacts.forEach((artifact) => {
      projectBuilder.ingestArtifact(artifact);
    });

    projectMemory.remember(`history:${agentId}`, {
      agentId,
      role,
      phase,
      content,
      parsedType: parsed.type,
      timestamp: new Date().toISOString(),
    });

    return parsed;
  }

  private createArtifactFromSourceFile(file: { path: string; content: string; language: string }, role: string, phase: string): ProjectArtifact {
    return {
      type: this.mapFilePathToArtifactType(file.path),
      name: file.path.split("/").pop() ?? `${role}-${phase}.tsx`,
      relativePath: file.path,
      language: file.language,
      content: file.content,
      generatedBy: role,
      dependencies: [],
      description: `${role} generated ${file.path} during ${phase}.`,
    };
  }

  private createArtifactFromParsedResponse(parsed: ParsedResponse, role: string, phase: string): ProjectArtifact {
    return {
      type: this.mapParsedResponseToArtifactType(parsed),
      name: `${role}-${phase}-${Math.random().toString(36).slice(2, 8)}.md`,
      relativePath: `artifacts/${role.toLowerCase().replace(/\s+/g, "-")}/${phase.toLowerCase()}.md`,
      language: parsed.type === "code" ? "ts" : parsed.type === "json" ? "json" : "md",
      content: typeof parsed.content === "string"
        ? BrowserStorageManager.summarizeText(parsed.content, 800)
        : BrowserStorageManager.summarizePayload(parsed.content, 800),
      generatedBy: role,
      dependencies: [],
      description: `${role} generated a ${parsed.type} artifact for ${phase}.`,
    };
  }

  private mapParsedResponseToArtifactType(parsed: ParsedResponse): ProjectArtifact["type"] {
    if (parsed.type === "code") {
      return "component";
    }

    if (parsed.type === "json") {
      return "configuration";
    }

    if (parsed.type === "tasks") {
      return "route";
    }

    if (parsed.type === "markdown") {
      return "readme";
    }

    return "utility";
  }

  private mapFilePathToArtifactType(relativePath: string): ProjectArtifact["type"] {
    if (relativePath.includes("app/page.tsx") || relativePath.endsWith("/page.tsx")) {
      return "page";
    }

    if (relativePath.includes("app/layout.tsx") || relativePath.endsWith("/layout.tsx")) {
      return "layout";
    }

    if (relativePath.startsWith("app/api/") || relativePath.endsWith("route.ts")) {
      return "route";
    }

    if (relativePath.startsWith("components/")) {
      return "component";
    }

    if (relativePath.startsWith("services/")) {
      return "service";
    }

    if (relativePath.startsWith("prisma/") || relativePath.includes("schema.prisma")) {
      return "database-schema";
    }

    if (relativePath.includes("middleware") || relativePath.endsWith("middleware.ts")) {
      return "route";
    }

    return "configuration";
  }

  snapshot(): ConversationManagerSnapshot {
    const memory = conversationMemoryService.getAgentMemory("project-manager");
    const sharedContext = sharedContextService.getSnapshot();

    return {
      memory: {
        previousResponses: memory.previousResponses,
        requirements: memory.requirements,
        decisions: memory.decisions,
        context: memory.context,
      },
      outputs: sharedContext.agentOutputs,
      history: sharedContext.agentOutputs ? Object.values(sharedContext.agentOutputs) : [],
    };
  }
}

export const conversationManager = new ConversationManager();
