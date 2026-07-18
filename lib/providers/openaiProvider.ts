import { BaseProvider } from "@/lib/providers/baseProvider";

export class OpenAIProvider extends BaseProvider {
  readonly id = "openai-gpt41";
  readonly name = "OpenAI";
  readonly model = "gpt-4.1";
}
