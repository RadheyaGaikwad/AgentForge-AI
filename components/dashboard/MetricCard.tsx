"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  detail: string;
  accent: string;
  children?: React.ReactNode;
}

export function MetricCard({
  icon: Icon,
  title,
  value,
  detail,
  accent,
  children,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="rounded-[26px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_20px_80px_rgba(2,6,23,0.22)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white/40">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">{value}</p>
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-7 text-white/45">{detail}</p>
      {children}
    </motion.div>
  );
}
