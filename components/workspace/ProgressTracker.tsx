"use client";

import { motion } from "framer-motion";

interface ProgressTrackerProps {
  progress: number;
  activeAgentName?: string | null;
  statusLabel?: string;
}

const steps = [
  { label: "Planning", active: true },
  { label: "Architecture", active: true },
  { label: "Execution", active: true },
  { label: "Review", active: false },
  { label: "Completion", active: false },
];

export function ProgressTracker({ progress, activeAgentName, statusLabel }: ProgressTrackerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/40">Build Progress</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Delivery pipeline</h2>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[12px] font-medium text-cyan-300">
          {Math.max(progress, 0)}% complete
        </div>
      </div>

      <div className="mt-4 text-[13px] text-white/50">
        <span className="text-white/70">{statusLabel ?? "Preparing execution"}</span>
        {activeAgentName ? ` · ${activeAgentName}` : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={`rounded-full border px-4 py-2.5 text-[14px] font-medium transition-all ${
              step.active
                ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.16)]"
                : "border-white/[0.08] bg-white/[0.03] text-white/50"
            }`}
          >
            {step.label}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
