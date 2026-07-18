import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";

export interface RollbackRecord {
  id: string;
  createdAt: string;
  projectRoot: string;
  relativePath: string;
  content: string;
  reason: string;
}

export class RollbackService {
  async capture(projectRoot: string, relativePath: string, content: string, reason = "manual-edit"): Promise<RollbackRecord> {
    const historyDirectory = path.join(projectRoot, ".history");
    await fs.mkdir(historyDirectory, { recursive: true });

    const record: RollbackRecord = {
      id: `rollback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      projectRoot,
      relativePath,
      content,
      reason,
    };

    const recordPath = path.join(historyDirectory, `${record.id}.json`);
    await fs.writeFile(recordPath, JSON.stringify(record, null, 2), "utf8");

    executionLogService.add({
      level: "info",
      actor: "Rollback Service",
      message: `Stored a rollback snapshot for ${relativePath}.`,
      metadata: { recordPath },
    });

    return record;
  }

  async restore(projectRoot: string, rollbackId: string): Promise<RollbackRecord | null> {
    const recordPath = path.join(projectRoot, ".history", `${rollbackId}.json`);

    try {
      const raw = await fs.readFile(recordPath, "utf8");
      const record = JSON.parse(raw) as RollbackRecord;
      await fs.writeFile(path.join(projectRoot, record.relativePath), record.content, "utf8");

      executionLogService.add({
        level: "success",
        actor: "Rollback Service",
        message: `Restored ${record.relativePath} from rollback ${rollbackId}.`,
        metadata: { recordPath },
      });

      return record;
    } catch {
      executionLogService.add({
        level: "warning",
        actor: "Rollback Service",
        message: `Rollback ${rollbackId} could not be restored for ${projectRoot}.`,
        metadata: { recordPath },
      });

      return null;
    }
  }
}

export async function captureRollbackSnapshot(projectRoot: string, relativePath: string, content: string, reason = "manual-edit"): Promise<RollbackRecord> {
  const service = new RollbackService();
  return await service.capture(projectRoot, relativePath, content, reason);
}
