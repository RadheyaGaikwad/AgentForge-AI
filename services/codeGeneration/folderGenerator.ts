import fs from "node:fs/promises";
import path from "node:path";

export interface FolderTreeInput {
  baseDirectory: string;
  folders: string[];
}

export class FolderGenerator {
  async createTree(input: FolderTreeInput): Promise<string[]> {
    const normalizedFolders = Array.from(
      new Set(
        input.folders
          .map((folder) => folder.replace(/\\/g, "/").replace(/^\//, "").trim())
          .filter(Boolean),
      ),
    );

    await Promise.all(
      normalizedFolders.map(async (folderPath) => {
        await fs.mkdir(path.join(input.baseDirectory, folderPath), { recursive: true });
      }),
    );

    return normalizedFolders;
  }
}

export const folderGenerator = new FolderGenerator();
