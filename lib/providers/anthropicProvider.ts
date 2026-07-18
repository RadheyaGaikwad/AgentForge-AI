import { BaseProvider } from "@/lib/providers/baseProvider";

export class AnthropicClaudeProvider extends BaseProvider {
  readonly id = "anthropic-claude-37-sonnet";
  readonly name = "Anthropic Claude";
  readonly model = "claude-3-7-sonnet";
}
