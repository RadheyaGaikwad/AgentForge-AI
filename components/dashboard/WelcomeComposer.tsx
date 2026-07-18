"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function WelcomeComposer() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[32px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.32em] text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
            Welcome back, Radheya
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-white/55 sm:text-[17px]">
            Start with a new project, then watch the AI team move through the build in a single clear workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          All systems online
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <motion.a
          href="/new-project"
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white"
        >
          New Project
          <ArrowUpRight className="h-4 w-4" />
        </motion.a>
        <a href="/workspace" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition-all hover:bg-white/[0.08]">
          Open Workspace
        </a>
      </div>
    </motion.section>
  );
}
