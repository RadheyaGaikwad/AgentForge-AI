"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Rocket, TimerReset } from "lucide-react";

const stages = [
  { label: "Build validation", state: "Complete" },
  { label: "Container packaging", state: "In progress" },
  { label: "Edge deployment", state: "Queued" },
];

export function DeploymentPanel() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65 }}
      className="rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <Rocket className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/40">Deployment</p>
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">Release readiness</h3>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-white">Production rollout</p>
            <p className="mt-1 text-sm text-white/50">Mock deployment pipeline ready for handoff.</p>
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300">
            Ready
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {stages.map((stage) => (
            <div key={stage.label} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-[#060811]/70 px-3 py-3 text-sm text-white/70">
              <span>{stage.label}</span>
              <span className="inline-flex items-center gap-2 text-white/50">
                {stage.state === "Complete" ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <TimerReset className="h-4 w-4 text-cyan-300" />}
                {stage.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
