import { BaseProvider } from "@/lib/providers/baseProvider";

export class DeepSeekProvider extends BaseProvider {
  readonly id = "deepseek-chat";
  readonly name = "DeepSeek";
  readonly model = "deepseek-chat";
}
