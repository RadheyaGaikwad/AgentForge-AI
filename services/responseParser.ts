export type ParsedResponseType = "code" | "markdown" | "json" | "logs" | "tasks";

export interface GeneratedFilePatch {
  path: string;
  content: string;
  language: string;
}

export interface ParsedResponse {
  type: ParsedResponseType;
  content: unknown;
  summary: string;
  generatedCode?: string;
  files?: GeneratedFilePatch[];
  tasks?: string[];
  architecture?: string;
  notes?: string[];
  warnings?: string[];
  recommendations?: string[];
}

const JSON_CODE_BLOCK_PATTERN = /```json\s*([\s\S]*?)```/i;
const CODE_BLOCK_PATTERN = /```([\w-]+)?\s*([\s\S]*?)```/i;
const FILE_BLOCK_PATTERN = /(?:^|\n)\s*File:\s*([^\n]+)\s*(?:\r?\n)\s*```([\w-]+)?\s*([\s\S]*?)```/gi;
const TASK_PATTERN = /(?:^|\n)\s*(?:-\s+|\*\s+|\d+\.\s+)(.+)$/gm;
const ARCHITECTURE_PATTERN = /(?:^|\n)\s*(?:architecture|system design|design):\s*([^\n]+)/i;
const WARNING_PATTERN = /(?:^|\n)\s*(?:warning|warnings):\s*([^\n]+)/gi;
const RECOMMENDATION_PATTERN = /(?:^|\n)\s*(?:recommendation|recommendations):\s*([^\n]+)/gi;
const NOTE_PATTERN = /(?:^|\n)\s*(?:note|notes):\s*([^\n]+)/gi;

export class ResponseParser {
  parse(rawResponse: string): ParsedResponse {
    const normalized = rawResponse.trim();

    if (!normalized) {
      return {
        type: "logs",
        content: [],
        summary: "No response content was returned.",
      };
    }

    const jsonMatch = normalized.match(JSON_CODE_BLOCK_PATTERN);
    if (jsonMatch?.[1]) {
      try {
        const content = JSON.parse(jsonMatch[1]);
        return {
          type: "json",
          content,
          summary: `Parsed JSON response (${typeof content}).`,
          notes: this.extractLineItems(normalized, NOTE_PATTERN),
          warnings: this.extractLineItems(normalized, WARNING_PATTERN),
          recommendations: this.extractLineItems(normalized, RECOMMENDATION_PATTERN),
        };
      } catch {
        // fall through to other parsing strategies
      }
    }

    const fileBlocks = Array.from(normalized.matchAll(FILE_BLOCK_PATTERN)).map((match) => ({
      path: match[1]?.trim(),
      language: match[2]?.trim() ?? "txt",
      content: match[3]?.trim() ?? "",
    })).filter((entry) => entry.path && entry.content);

    if (fileBlocks.length > 0) {
      return {
        type: "code",
        content: fileBlocks,
        summary: `Parsed ${fileBlocks.length} generated source files.`,
        generatedCode: fileBlocks.length === 1 ? fileBlocks[0].content.slice(0, 1600) : `${fileBlocks.length} source files prepared for disk writeout.`,
        files: fileBlocks,
        notes: this.extractLineItems(normalized, NOTE_PATTERN),
        warnings: this.extractLineItems(normalized, WARNING_PATTERN),
        recommendations: this.extractLineItems(normalized, RECOMMENDATION_PATTERN),
      };
    }

    const codeBlockMatch = normalized.match(CODE_BLOCK_PATTERN);
    if (codeBlockMatch?.[2]) {
      return {
        type: "code",
        content: codeBlockMatch[2].trim(),
        summary: `Parsed code block with language ${codeBlockMatch[1] ?? "unknown"}.`,
        generatedCode: codeBlockMatch[2].trim(),
        notes: this.extractLineItems(normalized, NOTE_PATTERN),
        warnings: this.extractLineItems(normalized, WARNING_PATTERN),
        recommendations: this.extractLineItems(normalized, RECOMMENDATION_PATTERN),
      };
    }

    const taskMatches = Array.from(normalized.matchAll(TASK_PATTERN)).map((match) => match[1].trim()).filter(Boolean);
    if (taskMatches.length > 0) {
      return {
        type: "tasks",
        content: taskMatches,
        summary: `Parsed ${taskMatches.length} task items.`,
        tasks: taskMatches,
        notes: this.extractLineItems(normalized, NOTE_PATTERN),
        warnings: this.extractLineItems(normalized, WARNING_PATTERN),
        recommendations: this.extractLineItems(normalized, RECOMMENDATION_PATTERN),
      };
    }

    if (normalized.startsWith("#") || normalized.includes("\n#")) {
      return {
        type: "markdown",
        content: normalized,
        summary: "Parsed markdown response.",
        architecture: normalized.match(ARCHITECTURE_PATTERN)?.[1]?.trim(),
        notes: this.extractLineItems(normalized, NOTE_PATTERN),
        warnings: this.extractLineItems(normalized, WARNING_PATTERN),
        recommendations: this.extractLineItems(normalized, RECOMMENDATION_PATTERN),
      };
    }

    return {
      type: "logs",
      content: normalized.split(/\r?\n/).filter(Boolean),
      summary: "Parsed plain text response as logs.",
      notes: this.extractLineItems(normalized, NOTE_PATTERN),
      warnings: this.extractLineItems(normalized, WARNING_PATTERN),
      recommendations: this.extractLineItems(normalized, RECOMMENDATION_PATTERN),
    };
  }

  private extractLineItems(rawResponse: string, pattern: RegExp): string[] {
    const matches = Array.from(rawResponse.matchAll(pattern)).map((match) => match[1]?.trim()).filter(Boolean);
    return matches.length > 0 ? matches : [];
  }
}

export const responseParser = new ResponseParser();
