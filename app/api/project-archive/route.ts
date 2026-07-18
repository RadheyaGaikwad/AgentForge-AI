import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  return value >>> 0;
});
const crc32 = (buffer: Buffer) => buffer.reduce((value, byte) => (value >>> 8) ^ crcTable[(value ^ byte) & 0xff], 0xffffffff) ^ 0xffffffff;
const u16 = (value: number) => { const result = Buffer.alloc(2); result.writeUInt16LE(value, 0); return result; };
const u32 = (value: number) => { const result = Buffer.alloc(4); result.writeUInt32LE(value >>> 0, 0); return result; };

async function filesIn(directory: string, root = directory): Promise<Array<{ name: string; data: Buffer }>> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: Array<{ name: string; data: Buffer }> = [];
  for (const entry of entries) {
    if (["node_modules", ".next", ".history", "diffs", "snapshots"].includes(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(full, root));
    else if (!entry.name.startsWith(".agentforge-")) files.push({ name: path.relative(root, full).split(path.sep).join("/"), data: await fs.readFile(full) });
  }
  return files;
}

function zip(files: Array<{ name: string; data: Buffer }>): Buffer {
  let offset = 0;
  const locals: Buffer[] = [];
  const central: Buffer[] = [];
  for (const file of files) {
    const name = Buffer.from(file.name);
    const checksum = crc32(file.data) >>> 0;
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(checksum), u32(file.data.length), u32(file.data.length), u16(name.length), u16(0), name, file.data]);
    locals.push(local);
    central.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(checksum), u32(file.data.length), u32(file.data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    offset += local.length;
  }
  const directory = Buffer.concat(central);
  return Buffer.concat([...locals, directory, u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(directory.length), u32(offset), u16(0)]);
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const requested = request.nextUrl.searchParams.get("project") ?? "";
  const slug = requested.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) return Response.json({ error: "A project name is required." }, { status: 400 });
  const directory = path.join(process.cwd(), "GeneratedProjects", slug);
  try {
    const archive = zip(await filesIn(directory));
    return new Response(new Uint8Array(archive), { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${slug}.zip"` } });
  } catch {
    return Response.json({ error: "Generated project was not found." }, { status: 404 });
  }
}
