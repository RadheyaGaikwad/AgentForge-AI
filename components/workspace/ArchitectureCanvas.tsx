"use client";

import { motion } from "framer-motion";
import { ArrowRight, Cpu, Layers3, ServerCog, Sparkles } from "lucide-react";

export function ArchitectureCanvas() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#05060B]/80 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_35%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.24em] text-white/35">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            Architecture Graph
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/40">
            Live
          </div>
        </div>

        <svg viewBox="0 0 520 280" className="h-[260px] w-full">
          <defs>
            <linearGradient id="flow" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.9 }}
            transition={{ duration: 1.2 }}
            d="M80 120 C160 80, 210 80, 260 120 S360 160, 440 120"
            stroke="url(#flow)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />

          <circle cx="80" cy="120" r="18" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
          <circle cx="260" cy="120" r="22" fill="#111827" stroke="#818cf8" strokeWidth="2" />
          <circle cx="440" cy="120" r="18" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />

          <rect x="30" y="90" width="100" height="60" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
          <rect x="220" y="90" width="80" height="60" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
          <rect x="400" y="90" width="90" height="60" rx="16" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />

          <g transform="translate(47 112)">
            <Cpu className="h-5 w-5 text-cyan-300" />
          </g>
          <g transform="translate(237 112)">
            <Layers3 className="h-5 w-5 text-indigo-300" />
          </g>
          <g transform="translate(422 112)">
            <ServerCog className="h-5 w-5 text-sky-300" />
          </g>
        </svg>

        <div className="mt-4 flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/50">
          <span>Prompt → Architecture → Build → Verify</span>
          <div className="flex items-center gap-2 text-cyan-300">
            <ArrowRight className="h-4 w-4" />
            Continuous delivery
          </div>
        </div>
      </div>
    </div>
  );
}
