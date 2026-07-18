import fs from "node:fs/promises";
import path from "node:path";
import { executionLogService } from "@/services/executionLogService";

export interface ChangeRecord {
  id: string;
  projectRoot: string;
  relativePath: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export class ChangeTracker {
  async record(projectRoot: string, relativePath: string, action: string, metadata: Record<string, unknown> = {}): Promise<ChangeRecord> {
    const historyDirectory = path.join(projectRoot, "diffs");
    await fs.mkdir(historyDirectory, { recursive: true });

    const record: ChangeRecord = {
      id: `change-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      projectRoot,
      relativePath,
      action,
      createdAt: new Date().toISOString(),
      metadata,
    };

    const recordPath = path.join(historyDirectory, `${record.id}.json`);
    await fs.writeFile(recordPath, JSON.stringify(record, null, 2), "utf8");

    executionLogService.add({
      level: "info",
      actor: "Change Tracker",
      message: `Recorded a change for ${relativePath}.`,
      metadata: { recordPath, action },
    });

    return record;
  }

  async load(projectRoot: string): Promise<ChangeRecord[]> {
    const historyDirectory = path.join(projectRoot, "diffs");

    try {
      const entries = await fs.readdir(historyDirectory);
      const records = await Promise.all(entries.filter((entry) => entry.endsWith(".json")).map(async (entry) => {
        const raw = await fs.readFile(path.join(historyDirectory, entry), "utf8");
        return JSON.parse(raw) as ChangeRecord;
      }));

      return records.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    } catch {
      return [];
    }
  }
}

export async function trackProjectChange(projectRoot: string, relativePath: string, action: string, metadata: Record<string, unknown> = {}): Promise<ChangeRecord> {
  const tracker = new ChangeTracker();
  return await tracker.record(projectRoot, relativePath, action, metadata);
}
