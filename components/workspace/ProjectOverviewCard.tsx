"use client";

import { motion } from "framer-motion";
import { Clock3, Sparkles, TimerReset } from "lucide-react";

interface ProjectOverviewCardProps {
  projectName: string;
  description: string;
  status: string;
  startedAt: string;
  estimatedCompletion: string;
  activeAgentName: string | null;
  progress: number;
}

export function ProjectOverviewCard({
  projectName,
  description,
  status,
  startedAt,
  estimatedCompletion,
  activeAgentName,
  progress,
}: ProjectOverviewCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65 }}
      className="rounded-[34px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Project Overview
          </div>
          <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.03em] text-white">
            {projectName}
          </h2>
          <p className="mt-3 text-[15px] leading-8 text-white/55">{description}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Status</p>
          <p className="mt-2 text-lg font-semibold text-white">{status}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Clock3 className="h-4 w-4 text-cyan-300" />
            Project Pulse
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Started</p>
              <p className="mt-2 text-sm font-semibold text-white">{startedAt}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">ETA</p>
              <p className="mt-2 text-sm font-semibold text-white">{estimatedCompletion}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Active Agent</p>
              <p className="mt-2 text-sm font-semibold text-white">{activeAgentName ?? "Planning"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <TimerReset className="h-4 w-4 text-violet-300" />
              Overall Progress
            </div>
            <span className="text-sm font-semibold text-cyan-300">{progress}%</span>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              transition={{ duration: 0.6 }}
              className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500"
            />
          </div>
          <p className="mt-3 text-sm text-white/55">Execution continues through the current milestone and pauses only for review checkpoints.</p>
        </div>
      </div>
    </motion.section>
  );
}
