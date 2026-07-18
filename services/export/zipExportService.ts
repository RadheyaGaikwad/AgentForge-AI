import type { ProjectBuilderSnapshot } from "@/services/projectBuilder";
import { projectPackageService } from "@/services/export/projectPackageService";
import type { Project } from "@/types/project";

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  return value >>> 0;
});

const crc32 = (buffer: Uint8Array) => {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value = (value >>> 8) ^ crcTable[(value ^ byte) & 0xff];
  }
  return (value ^ 0xffffffff) >>> 0;
};

const createZipArchive = (files: Array<{ path: string; content: string }>): Blob => {
  const encoder = new TextEncoder();
  const localEntries: Uint8Array[] = [];
  const centralEntries: Uint8Array[] = [];
  let offset = 0;

  const normalizedFiles = files.map((file) => ({
    name: file.path,
    data: encoder.encode(file.content),
  }));

  for (const file of normalizedFiles) {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.data);
    const local = new Uint8Array(30 + name.length + file.data.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, file.data.length, true);
    localView.setUint32(22, file.data.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    local.set(name, 30);
    local.set(file.data, 30 + name.length);
    localEntries.push(local);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, file.data.length, true);
    centralView.setUint32(24, file.data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(40, 0, true);
    centralView.setUint32(44, offset, true);
    central.set(name, 46);
    centralEntries.push(central);

    offset += local.length;
  }

  const centralSize = centralEntries.reduce((total, entry) => total + entry.length, 0);
  const directoryOffset = offset;
  const archive = new Uint8Array(directoryOffset + centralSize + 22);

  let cursor = 0;
  for (const entry of localEntries) {
    archive.set(entry, cursor);
    cursor += entry.length;
  }

  for (const entry of centralEntries) {
    archive.set(entry, cursor);
    cursor += entry.length;
  }

  const end = new DataView(archive.buffer, archive.byteOffset, archive.byteLength - cursor);
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(4, 0, true);
  end.setUint16(6, 0, true);
  end.setUint16(8, normalizedFiles.length, true);
  end.setUint16(10, normalizedFiles.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, directoryOffset, true);
  end.setUint16(20, 0, true);

  return new Blob([archive], { type: "application/zip" });
};

export class ZipExportService {
  buildBlob(snapshot: ProjectBuilderSnapshot, project?: Project): Blob {
    const packageBundle = projectPackageService.build(snapshot, project);
    return createZipArchive(packageBundle.files);
  }

  async download(snapshot: ProjectBuilderSnapshot, project?: Project): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    const projectName = project?.name;

    if (!projectName) {
      throw new Error("Project name is required to build the ZIP archive.");
    }

    const response = await fetch(`/api/project-archive?project=${encodeURIComponent(projectName)}`);

    if (!response.ok) {
      throw new Error(`Archive request failed with status ${response.status}.`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = projectPackageService.getArchiveName(project);
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }
}

export const zipExportService = new ZipExportService();
