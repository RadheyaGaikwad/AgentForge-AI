export interface AIProviderRequest {
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  taskType?: string;
  agentType?: string;
  model?: string;
}

export interface AIProviderResponse {
  provider: string;
  model: string;
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly model: string;
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
  stream?(request: AIProviderRequest): AsyncIterable<string>;
  healthCheck?(): Promise<boolean>;
  validateKey?(): Promise<boolean>;
}
