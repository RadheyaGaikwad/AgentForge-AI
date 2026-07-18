"use client";

import type { ProjectSummary } from "@/types/projectArtifact";

interface ProjectSummaryPanelProps {
  summary: ProjectSummary;
}

export function ProjectSummaryPanel({ summary }: ProjectSummaryPanelProps) {
  const stats = [
    { label: "Files Generated", value: summary.filesGenerated },
    { label: "Folders Generated", value: summary.foldersGenerated },
    { label: "Components", value: summary.components },
    { label: "Routes", value: summary.routes },
    { label: "Database Tables", value: summary.databaseTables },
    { label: "Estimated LOC", value: summary.estimatedLOC },
  ];

  return (
    <div className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
      <p className="text-sm font-medium text-white/40">Project summary</p>
      <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-white">Build snapshot</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{stat.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
        <p>Framework: {summary.framework}</p>
        <p>Package Manager: {summary.packageManager}</p>
        <p>README: {summary.readme}</p>
      </div>
    </div>
  );
}
