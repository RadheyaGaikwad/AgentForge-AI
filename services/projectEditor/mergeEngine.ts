import type { TextDiffResult } from "@/services/projectEditor/diffEngine";

export interface MergeOutcome {
  status: "merged" | "conflict";
  mergedContent: string;
  conflicts: string[];
}

export class MergeEngine {
  merge(baseContent: string, incomingContent: string, diff?: TextDiffResult): MergeOutcome {
    const normalizedIncoming = incomingContent.trim();
    const normalizedBase = baseContent.trim();

    if (normalizedBase === normalizedIncoming) {
      return {
        status: "merged",
        mergedContent: incomingContent,
        conflicts: [],
      };
    }

    const hasMeaningfulDiff = diff ? diff.removed.length > 0 || diff.added.length > 0 : true;
    if (!hasMeaningfulDiff) {
      return {
        status: "merged",
        mergedContent: incomingContent,
        conflicts: [],
      };
    }

    return {
      status: "merged",
      mergedContent: incomingContent,
      conflicts: [],
    };
  }
}

export function mergeFileContent(baseContent: string, incomingContent: string, diff?: TextDiffResult): MergeOutcome {
  const engine = new MergeEngine();
  return engine.merge(baseContent, incomingContent, diff);
}
