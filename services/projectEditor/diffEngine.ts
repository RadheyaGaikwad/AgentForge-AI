export interface TextDiffResult {
  prefix: string[];
  removed: string[];
  added: string[];
  suffix: string[];
}

const splitLines = (content: string): string[] => content.length === 0 ? [] : content.split(/\r?\n/u);

export class DiffEngine {
  computeTextDiff(before: string, after: string): TextDiffResult {
    const beforeLines = splitLines(before);
    const afterLines = splitLines(after);
    const commonPrefixLength = this.commonPrefixLength(beforeLines, afterLines);
    const commonSuffixLength = this.commonSuffixLength(beforeLines.slice(commonPrefixLength), afterLines.slice(commonPrefixLength));

    const prefix = beforeLines.slice(0, commonPrefixLength);
    const suffix = beforeLines.slice(beforeLines.length - commonSuffixLength);
    const removed = beforeLines.slice(commonPrefixLength, beforeLines.length - commonSuffixLength);
    const added = afterLines.slice(commonPrefixLength, afterLines.length - commonSuffixLength);

    return {
      prefix,
      removed,
      added,
      suffix,
    };
  }

  private commonPrefixLength(beforeLines: string[], afterLines: string[]): number {
    const length = Math.min(beforeLines.length, afterLines.length);
    let index = 0;

    while (index < length && beforeLines[index] === afterLines[index]) {
      index += 1;
    }

    return index;
  }

  private commonSuffixLength(beforeLines: string[], afterLines: string[]): number {
    const beforeSuffixStart = Math.max(beforeLines.length - 1, 0);
    const afterSuffixStart = Math.max(afterLines.length - 1, 0);
    let length = 0;

    while (
      length < Math.min(beforeLines.length, afterLines.length)
      && beforeLines[beforeSuffixStart - length] === afterLines[afterSuffixStart - length]
    ) {
      length += 1;
    }

    return length;
  }
}

export function computeTextDiff(before: string, after: string): TextDiffResult {
  const diffEngine = new DiffEngine();
  return diffEngine.computeTextDiff(before, after);
}
