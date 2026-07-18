"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AgentStatusBadge } from "@/components/workspace/AgentStatusBadge";
import type { AgentStatus } from "@/types/agent";

interface AgentCardProps {
  name: string;
  task: string;
  progress: number;
  status: AgentStatus;
  icon: LucideIcon;
  accent: string;
  initials: string;
  index: number;
  isActive: boolean;
}

export function AgentCard({ name, task, progress, status, accent, initials, index, isActive }: AgentCardProps) {
  const isCompleted = status === "Completed";
  const isPreparing = status === "Planning" || status === "Working" || status === "Reviewing" || status === "Fixing" || status === "Verified";
  const isWaiting = !isCompleted && !isActive && !isPreparing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`rounded-[22px] border p-3.5 transition-all ${
        isCompleted
          ? "border-emerald-400/35 bg-emerald-400/10"
          : isActive
            ? "border-cyan-400/35 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.16)]"
            : isWaiting
              ? "border-white/10 bg-white/[0.03] opacity-80"
              : "border-white/10 bg-white/[0.04]"
      } ${isActive ? "animate-pulse" : ""}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={isActive ? { scale: [1, 1.04, 1], boxShadow: ["0 0 0 rgba(34,211,238,0.15)", "0 0 24px rgba(34,211,238,0.2)", "0 0 0 rgba(34,211,238,0.15)"] } : { scale: 1, boxShadow: "0 0 0 rgba(34,211,238,0)" }}
          transition={{ duration: 1.2, repeat: isActive ? Infinity : 0 }}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} ${isCompleted ? "ring-1 ring-emerald-400/40" : isActive ? "ring-1 ring-cyan-400/40" : ""}`}
        >
          <span className="text-[11px] font-semibold text-white">{initials}</span>
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[13px] font-semibold text-white">{name}</p>
            <AgentStatusBadge status={status} />
          </div>
          <p className="mt-1 text-[12px] leading-6 text-white/45">{task}</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between text-[11px] text-white/45">
          <span>{status === "Verified" ? "Verified" : status === "Fixing" ? "Fixing" : isCompleted ? "Completed" : isPreparing ? "In motion" : isWaiting ? "Waiting" : "Ready"}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-2 rounded-full ${isCompleted ? "bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500" : isWaiting ? "bg-gradient-to-r from-slate-500/70 to-slate-400/70" : "bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500"}`}
          />
        </div>
      </div>
    </motion.div>
  );
}
