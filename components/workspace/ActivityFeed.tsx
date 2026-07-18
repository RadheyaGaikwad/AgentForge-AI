"use client";

import { motion } from "framer-motion";
import { BellRing } from "lucide-react";

interface ActivityFeedItem {
  title: string;
  detail: string;
  time: string;
}

interface ActivityFeedProps {
  items: ActivityFeedItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-[28px] border border-white/10 bg-[#0B1020]/70 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/40">Right Activity Feed</p>
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-white">Latest signals</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] p-2">
          <BellRing className="h-4 w-4 text-white/60" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="rounded-[22px] border border-white/10 bg-white/[0.04] p-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-white">{item.title}</p>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">{item.time}</span>
            </div>
            <p className="mt-2 text-sm leading-7 text-white/45">{item.detail}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
