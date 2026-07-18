"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface TeamMemberCardProps {
  icon: LucideIcon;
  name: string;
  role: string;
  status: string;
  accent: string;
  index: number;
}

export function TeamMemberCard({
  icon: Icon,
  name,
  role,
  status,
  accent,
  index,
}: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ x: 4, scale: 1.01 }}
      className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5"
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl bg-gradient-to-br ${accent} p-2.5`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[14px] font-semibold text-white">{name}</p>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
          </div>
          <p className="mt-1 text-sm text-white/45">{role}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-[#05060B]/60 px-3 py-2.5">
        <div className="flex items-center gap-2 text-[12px] text-white/50">
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="inline-block h-2 w-2 rounded-full bg-cyan-400"
          />
          {status}
        </div>
        <span className="text-[11px] uppercase tracking-[0.22em] text-white/30">Online</span>
      </div>
    </motion.div>
  );
}
