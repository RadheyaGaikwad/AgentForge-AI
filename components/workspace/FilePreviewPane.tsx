"use client";

import { Copy, Download, Eye } from "lucide-react";
import type { FileRegistryEntry } from "@/services/fileRegistry";

interface FilePreviewPaneProps {
  file: FileRegistryEntry | null;
}

export function FilePreviewPane({ file }: FilePreviewPaneProps) {
  if (!file) {
    return (
      <div className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 text-sm text-white/60 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
        Select a generated file to preview it here.
      </div>
    );
  }

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/40">File preview</p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white">{file.relativePath}</h3>
        </div>
        <div className="flex gap-2">
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80">
            <Copy className="h-4 w-4" />
            Copy
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80">
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-white/10 bg-[#05060B]/75 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-cyan-200">
          <Eye className="h-4 w-4" />
          Read-only preview
        </div>
        <pre className="max-h-[420px] overflow-auto rounded-2xl bg-black/25 p-4 text-[12px] leading-6 text-slate-200">
          <code>{file.content || "// Empty file"}</code>
        </pre>
      </div>
    </div>
  );
}
