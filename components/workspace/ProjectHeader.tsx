"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, TimerReset } from "lucide-react";

export function ProjectHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            AgentForge Workspace
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            AI-native product build
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-white/55">
            A live operating system for orchestrating design, implementation, verification, and delivery from one place.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 p-2.5">
            <TimerReset className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">Build Window</p>
            <p className="text-sm font-semibold text-white">03:14 remaining</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] p-2">
            <ArrowUpRight className="h-4 w-4 text-white/60" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
