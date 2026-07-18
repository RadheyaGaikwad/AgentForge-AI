"use client";

import { motion } from "framer-motion";
import { Activity, CheckCircle2, Clock3, Sparkles } from "lucide-react";
import type { TimelineEvent } from "@/types/timeline";

interface TimelineEventItemProps {
  event: TimelineEvent;
  index: number;
}

const statusStyles: Record<TimelineEvent["status"], string> = {
  Informational: "bg-slate-400/20 text-slate-300",
  Progress: "bg-cyan-400/20 text-cyan-300",
  Completed: "bg-emerald-400/20 text-emerald-300",
  Warning: "bg-amber-400/20 text-amber-300",
};

const statusIcons = {
  Informational: Activity,
  Progress: Sparkles,
  Completed: CheckCircle2,
  Warning: Clock3,
};

export function TimelineEventItem({ event, index }: TimelineEventItemProps) {
  const Icon = statusIcons[event.status];
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(event.timestamp));

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 ${statusStyles[event.status]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-semibold text-white">{event.title}</p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[event.status]}`}>
                {event.status}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-7 text-white/50">{event.description}</p>
          </div>
        </div>
        <div className="text-right text-[12px] text-white/45">
          <p>{timeLabel}</p>
          <p className="mt-1">{event.actor}</p>
        </div>
      </div>
    </motion.div>
  );
}
