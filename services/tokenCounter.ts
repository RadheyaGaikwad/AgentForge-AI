export class TokenCounter {
  count(text: string): number {
    const normalizedText = text.trim();
    if (!normalizedText) {
      return 0;
    }

    const tokens = normalizedText.split(/\s+/).filter(Boolean);
    return tokens.length;
  }

  estimatePromptTokens(prompt: string): number {
    return this.count(prompt);
  }

  estimateCompletionTokens(response: string): number {
    return this.count(response);
  }
}

export const tokenCounter = new TokenCounter();
