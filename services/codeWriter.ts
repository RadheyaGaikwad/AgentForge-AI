import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";

const GENERATED_FILE_MARKER = "/* AgentForge AI generated file. Manual edits are preserved. */";
const MARKER_SAFE_EXTENSIONS = new Set(["ts", "tsx", "js", "jsx", "mjs", "css", "scss", "sass", "html"]);

export interface WriteFileResult {
  targetPath: string;
  status: "written" | "skipped";
}

const shouldPrefixGeneratedMarker = (targetPath: string): boolean => {
  const extension = path.extname(targetPath).replace(/^\./, "").toLowerCase();
  return MARKER_SAFE_EXTENSIONS.has(extension);
};

export async function writeGeneratedFile(targetPath: string, content: string): Promise<WriteFileResult> {
  const shouldUseMarker = shouldPrefixGeneratedMarker(targetPath);
  const normalizedContent = shouldUseMarker ? `${GENERATED_FILE_MARKER}\n${content.trim()}` : content.trim();

  try {
    const existing = await fs.readFile(targetPath, "utf8");
    if (shouldUseMarker && !existing.includes(GENERATED_FILE_MARKER)) {
      executionLogService.add({
        level: "warning",
        actor: "File Writer",
        message: `Skipped write for ${targetPath} because the file is not marked as AgentForge-generated.`,
        metadata: { targetPath },
      });

      return {
        targetPath,
        status: "skipped",
      };
    }

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, normalizedContent, "utf8");

    executionLogService.add({
      level: "info",
      actor: "File Writer",
      message: `Updated generated file ${targetPath}.`,
      metadata: { targetPath },
    });

    return {
      targetPath,
      status: "written",
    };
  } catch {
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, normalizedContent, "utf8");

    executionLogService.add({
      level: "info",
      actor: "File Writer",
      message: `Created generated file ${targetPath}.`,
      metadata: { targetPath },
    });

    return {
      targetPath,
      status: "written",
    };
  }
}

export async function appendGeneratedLog(logPath: string, generatedFiles: string[]): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntries = generatedFiles.map((generatedFile) => `${timestamp} ${generatedFile}`).join("\n");

  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, `${logEntries}\n`, "utf8");
}
