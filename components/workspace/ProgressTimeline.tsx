"use client";

import { motion } from "framer-motion";

interface TimelineStep {
  title: string;
  detail: string;
  time: string;
}

interface ProgressTimelineProps {
  steps: TimelineStep[];
}

export function ProgressTimeline({ steps }: ProgressTimelineProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-[28px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/40">Progress Timeline</p>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">Execution flow</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/45">
          Real-time mode
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="relative rounded-[22px] border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="absolute left-4 top-4 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            <div className="pl-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{step.time}</p>
              <p className="mt-2 font-semibold text-white">{step.title}</p>
              <p className="mt-2 text-sm leading-7 text-white/45">{step.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
