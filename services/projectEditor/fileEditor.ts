import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";

export interface FileEditRequest {
  filePath: string;
  oldText: string;
  newText: string;
}

export interface FileEditResult {
  filePath: string;
  applied: boolean;
  original: string;
  updated: string;
}

export class FileEditor {
  async replace(filePath: string, oldText: string, newText: string): Promise<FileEditResult> {
    const absolutePath = path.resolve(filePath);
    const original = await fs.readFile(absolutePath, "utf8");

    if (!original.includes(oldText)) {
      executionLogService.add({
        level: "warning",
        actor: "File Editor",
        message: `Failed to apply a safe replacement because the requested anchor text was not found in ${absolutePath}.`,
        metadata: { filePath: absolutePath, oldText },
      });

      return {
        filePath: absolutePath,
        applied: false,
        original,
        updated: original,
      };
    }

    const updated = original.replace(oldText, newText);
    await fs.writeFile(absolutePath, updated, "utf8");

    executionLogService.add({
      level: "success",
      actor: "File Editor",
      message: `Applied a targeted replacement to ${absolutePath}.`,
      metadata: { filePath: absolutePath },
    });

    return {
      filePath: absolutePath,
      applied: true,
      original,
      updated,
    };
  }

  async upsert(filePath: string, content: string): Promise<FileEditResult> {
    const absolutePath = path.resolve(filePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    const original = await fs.readFile(absolutePath, "utf8").catch(() => "");
    await fs.writeFile(absolutePath, content, "utf8");

    executionLogService.add({
      level: "info",
      actor: "File Editor",
      message: `Upserted ${absolutePath}.`,
      metadata: { filePath: absolutePath },
    });

    return {
      filePath: absolutePath,
      applied: true,
      original,
      updated: content,
    };
  }
}

export async function applyFileEdit(request: FileEditRequest): Promise<FileEditResult> {
  const editor = new FileEditor();
  return await editor.replace(request.filePath, request.oldText, request.newText);
}
