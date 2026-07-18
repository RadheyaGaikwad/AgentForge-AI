"use client";

import type { AgentStatus } from "@/types/agent";

interface AgentStatusBadgeProps {
  status: AgentStatus;
}

const statusStyles: Record<AgentStatus, string> = {
  Idle: "bg-slate-400/20 text-slate-300",
  Planning: "bg-violet-400/20 text-violet-300",
  Working: "bg-cyan-400/20 text-cyan-300",
  Waiting: "bg-amber-400/20 text-amber-300",
  Reviewing: "bg-fuchsia-400/20 text-fuchsia-300",
  Fixing: "bg-rose-400/20 text-rose-300",
  Verified: "bg-emerald-400/20 text-emerald-300",
  Completed: "bg-emerald-500/20 text-emerald-300",
};

const statusLabels: Record<AgentStatus, string> = {
  Idle: "Idle",
  Planning: "Planning",
  Working: "Working",
  Waiting: "Waiting",
  Reviewing: "Reviewing",
  Fixing: "Fixing",
  Verified: "Verified",
  Completed: "Completed",
};

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
