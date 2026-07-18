import { BaseProvider } from "@/lib/providers/baseProvider";

export class GeminiProvider extends BaseProvider {
  readonly id = "gemini-20-flash";
  readonly name = "Google Gemini";
  readonly model = "gemini-2.0-flash";
}
