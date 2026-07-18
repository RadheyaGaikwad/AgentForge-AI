import { BaseProvider } from "@/lib/providers/baseProvider";

export class MockProvider extends BaseProvider {
  readonly id = "mock-agent";
  readonly name = "Mock";
  readonly model = "Mock Agent";
}
