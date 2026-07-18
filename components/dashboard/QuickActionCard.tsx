"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  index: number;
  href?: string;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  accent,
  index,
  href,
}: QuickActionCardProps) {
  const content = (
    <>
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accent} p-2.5`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold tracking-[-0.01em] text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-6 text-white/45">{description}</p>
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 + index * 0.06, duration: 0.4 }}
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="group block rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-left backdrop-blur-xl transition-all"
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + index * 0.06, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-left backdrop-blur-xl transition-all"
      type="button"
    >
      {content}
    </motion.button>
  );
}
