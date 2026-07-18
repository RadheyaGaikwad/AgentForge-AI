export interface ConversationMemoryEntry {
  role: string;
  phase: string;
  content: string;
  timestamp: string;
  type: "response" | "requirement" | "decision" | "context";
}

export interface AgentMemoryState {
  previousResponses: string[];
  requirements: string[];
  decisions: string[];
  context: string[];
}

export class ConversationMemoryService {
  private readonly memories = new Map<string, AgentMemoryState>();

  getAgentMemory(agentId: string): AgentMemoryState {
    const existing = this.memories.get(agentId);

    if (existing) {
      return existing;
    }

    const created: AgentMemoryState = {
      previousResponses: [],
      requirements: [],
      decisions: [],
      context: [],
    };

    this.memories.set(agentId, created);
    return created;
  }

  record(agentId: string, entry: ConversationMemoryEntry): void {
    const memory = this.getAgentMemory(agentId);

    if (entry.type === "response") {
      memory.previousResponses = [...memory.previousResponses, entry.content].slice(-8);
    }

    if (entry.type === "requirement") {
      memory.requirements = [...memory.requirements, entry.content].slice(-8);
    }

    if (entry.type === "decision") {
      memory.decisions = [...memory.decisions, entry.content].slice(-8);
    }

    if (entry.type === "context") {
      memory.context = [...memory.context, entry.content].slice(-8);
    }
  }

  buildContextPrompt(agentId: string, basePrompt: string): string {
    const memory = this.getAgentMemory(agentId);
    const sections: string[] = [basePrompt];

    if (memory.previousResponses.length > 0) {
      sections.push(`Previous responses:\n- ${memory.previousResponses.join("\n- ")}`);
    }

    if (memory.requirements.length > 0) {
      sections.push(`Requirements:\n- ${memory.requirements.join("\n- ")}`);
    }

    if (memory.decisions.length > 0) {
      sections.push(`Decisions:\n- ${memory.decisions.join("\n- ")}`);
    }

    if (memory.context.length > 0) {
      sections.push(`Context:\n- ${memory.context.join("\n- ")}`);
    }

    return sections.join("\n\n");
  }

  reset(): void {
    this.memories.clear();
  }
}

export const conversationMemoryService = new ConversationMemoryService();
