"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const examples = [
  "Build a gym management web app",
  "Create a desktop inventory manager",
  "Build a hospital management web app",
  "Create a desktop CRM",
  "Build a library management web app",
];

export function PromptComposer() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[34px] border border-white/10 bg-[#0B1020]/70 p-7 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl sm:p-9"
    >
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/35">AI Workspace</p>
        <h1 className="mt-4 text-[clamp(2rem,3.6vw,3.1rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-white">
          What are we building today?
        </h1>

        <div className="relative mt-8">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-indigo-500/20 via-cyan-400/15 to-purple-500/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#060811]/85 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[13px] text-white/45">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Prompt
            </div>
            <textarea
              className="mt-4 min-h-[140px] w-full resize-none border-none bg-transparent text-[17px] leading-8 text-white/80 outline-none placeholder:text-white/35 sm:text-[18px]"
              placeholder="Describe your idea..."
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {examples.map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] text-white/70 backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                >
                  {item}
                </motion.button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <p className="text-[14px] leading-7 text-white/50">
                Build anything with a focused AI engineering team.
              </p>
              <motion.button
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-violet-500 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.25)]"
              >
                Build with AI Team
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
