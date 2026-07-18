"use client";

import { motion } from "framer-motion";
import { Download, ExternalLink, Sparkles } from "lucide-react";
import { TimelineEventItem } from "@/components/workspace/TimelineEventItem";
import type { TimelineEvent } from "@/types/timeline";

interface ProjectTimelineProps {
  events: TimelineEvent[];
  progress: number;
  activeAgentName?: string | null;
  statusLabel?: string;
  isCompleted?: boolean;
  onAction?: (action: string) => void;
}

export function ProjectTimeline({
  events,
  progress,
  activeAgentName,
  statusLabel,
  isCompleted = false,
  onAction,
}: ProjectTimelineProps) {
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const stage = isCompleted ? "Completed" : normalizedProgress >= 80 ? "Reviewing" : normalizedProgress >= 45 ? "Working" : "Planning";
  const estimatedTime = isCompleted ? "Completed" : normalizedProgress >= 80 ? "1 min remaining" : normalizedProgress >= 50 ? "2 min remaining" : normalizedProgress >= 25 ? "4 min remaining" : normalizedProgress >= 6 ? "6 min remaining" : "Preparing...";
  const statusMessage = statusLabel ?? (isCompleted
    ? "Project generated successfully."
    : activeAgentName?.includes("Frontend")
      ? "Generating frontend..."
      : activeAgentName?.includes("Backend")
        ? "Creating API routes..."
        : activeAgentName?.includes("Database")
          ? "Preparing database..."
          : activeAgentName?.includes("QA")
            ? "Running tests..."
            : activeAgentName?.includes("DevOps")
              ? "Deploying project..."
              : activeAgentName?.includes("Architect")
                ? "Planning architecture..."
                : "Preparing execution...");

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/40">Live Execution Logs</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Execution activity</h2>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[12px] font-medium text-emerald-300">
          {isCompleted ? "Complete" : "Streaming"}
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-[#05060B]/75 p-4">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Project generated successfully
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white/60">Overall Progress</p>
          <p className="text-sm font-semibold text-white">{normalizedProgress}%</p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${normalizedProgress}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Active agent</p>
            <p className="mt-2 text-sm font-semibold text-white">{activeAgentName ?? "Awaiting startup"}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Current stage</p>
            <p className="mt-2 text-sm font-semibold text-white">{stage}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Estimated time</p>
            <p className="mt-2 text-sm font-semibold text-white">{estimatedTime}</p>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border border-cyan-400/20 bg-cyan-400/10 px-3 py-3 text-sm text-cyan-100">
          {statusMessage}
        </div>

        {isCompleted ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Preview Project", icon: ExternalLink },
              { label: "Download ZIP", icon: Download },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => onAction?.(action.label)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Recent activity</p>
        <div className="mt-3 space-y-3">
          {events.map((event, index) => (
            <TimelineEventItem key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
