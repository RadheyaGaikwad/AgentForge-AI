export interface ProviderRouteInput {
  taskType?: string;
  agentType?: string;
  context?: string;
}

const defaultModelMap: Record<string, string> = {
  architect: "anthropic/claude-sonnet",
  systemarchitect: "anthropic/claude-sonnet",
  frontend: "anthropic/claude-sonnet",
  backend: "openai/gpt-4.1",
  database: "deepseek/deepseek-chat",
  qa: "google/gemini-2.5-pro",
  projectmanager: "openai/gpt-4.1",
  devops: "openai/gpt-4.1",
  default: "openai/gpt-4.1",
};

export class ProviderRouter {
  private readonly orderedModels: string[];

  constructor(private readonly modelMap: Record<string, string> = defaultModelMap) {
    this.orderedModels = Object.values(modelMap).filter((value, index, array) => array.indexOf(value) === index);
  }

  route(input: ProviderRouteInput): string {
    const agentType = this.normalize(input.agentType);
    const taskType = this.normalize(input.taskType);
    const context = this.normalize(input.context);

    const directModel = this.resolveDirectMatch(agentType, taskType, context);
    if (directModel) {
      return directModel;
    }

    return this.modelMap.default ?? "openai/gpt-4.1";
  }

  getFallbackModels(): string[] {
    return this.orderedModels.filter((model) => model !== this.modelMap.default);
  }

  private resolveDirectMatch(agentType: string, taskType: string, context: string): string | undefined {
    const identifiers = [agentType, taskType, context].filter(Boolean);

    for (const identifier of identifiers) {
      const directCandidate = this.modelMap[identifier];
      if (directCandidate) {
        return directCandidate;
      }
    }

    for (const [key, value] of Object.entries(this.modelMap)) {
      if (key === "default") {
        continue;
      }

      if (identifiers.some((identifier) => identifier.includes(key))) {
        return value;
      }
    }

    return undefined;
  }

  private normalize(value?: string): string {
    return (value ?? "")
      .toLowerCase()
      .replace(/[^a-z\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}
