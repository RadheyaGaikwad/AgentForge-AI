"use client";

import { motion } from "framer-motion";
import { TerminalSquare } from "lucide-react";

interface LiveConsoleProps {
  logs: string[];
}

export function LiveConsole({ logs }: LiveConsoleProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/40">Bottom Live Console</p>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">Execution feed</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[12px] text-emerald-300">
          <TerminalSquare className="h-3.5 w-3.5" />
          Streaming
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-[#05060B]/80 p-4 font-mono text-[13px] leading-7 text-white/70">
        {logs.map((entry, index) => (
          <motion.div
            key={`${entry}-${index}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-2"
          >
            <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            <span>{entry}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
