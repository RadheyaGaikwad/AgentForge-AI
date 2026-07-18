"use client";

import type { PreviewManifest } from "@/types/projectArtifact";
import { ExternalLink, Globe2 } from "lucide-react";

interface PreviewManifestPanelProps {
  manifest: PreviewManifest;
}

export function PreviewManifestPanel({ manifest }: PreviewManifestPanelProps) {
  const previewPages = manifest.pages.length > 0 ? manifest.pages : [{ route: "/", label: "Home page", sourcePath: "app/page.tsx" }];

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/40">Preview manifest</p>
          <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white">Frontend review surface</h3>
        </div>
        <a
          href={manifest.previewUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100 transition-all hover:bg-cyan-400/15"
        >
          <Globe2 className="h-4 w-4" />
          Open app
        </a>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-3 text-sm text-white/70">
        <p className="font-medium text-cyan-100">Detected preview URL</p>
        <p className="mt-1 break-all">{manifest.previewUrl}</p>
      </div>

      <div className="mt-4 space-y-2">
        {previewPages.map((page) => (
          <div key={`${page.route}-${page.sourcePath}`} className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <div>
              <p className="text-sm font-medium text-white">{page.label}</p>
              <p className="text-xs text-white/45">{page.route}</p>
            </div>
            <a
              href={`${manifest.previewUrl}${page.route === "/" ? "" : page.route}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/75 transition-all hover:bg-white/[0.08]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
