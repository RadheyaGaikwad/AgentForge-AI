import fs from "node:fs/promises";
import path from "node:path";

export async function createDirectoryTree(baseDir: string, relativePaths: string[]): Promise<void> {
  const uniqueDirectories = Array.from(
    new Set(
      relativePaths
        .map((relativePath) => relativePath.split(/[\\/]/).filter(Boolean).slice(0, -1).join("/"))
        .filter(Boolean),
    ),
  );

  await Promise.all(
    uniqueDirectories.map(async (dirPath) => {
      await fs.mkdir(path.join(baseDir, dirPath), { recursive: true });
    }),
  );
}

export async function createDirectory(baseDir: string): Promise<void> {
  await fs.mkdir(baseDir, { recursive: true });
}
