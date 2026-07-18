"use client";

import { motion } from "framer-motion";
import { ArrowRight, Eye, Sparkles, ShieldCheck } from "lucide-react";

interface ApprovalCheckpointCardProps {
  title: string;
  description: string;
  status: string;
  isPreviewReady?: boolean;
  onReviewFrontend: () => void;
  onRequestChanges: () => void;
  onContinue: () => void;
}

export function ApprovalCheckpointCard({
  title,
  description,
  status,
  isPreviewReady = false,
  onReviewFrontend,
  onRequestChanges,
  onContinue,
}: ApprovalCheckpointCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="rounded-[32px] border border-cyan-400/20 bg-cyan-400/10 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.22)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B1020]/70 text-cyan-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-200/70">Frontend ready</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-white">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-white/70">{description}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-white/10 bg-[#0B1020]/60 p-4">
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Status</p>
        <p className="mt-2 text-sm font-semibold text-white">{status}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReviewFrontend}
          disabled={!isPreviewReady}
          aria-disabled={!isPreviewReady}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Eye className="h-4 w-4" />
          Review Frontend
        </button>
        <button
          type="button"
          onClick={onRequestChanges}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80"
        >
          <Sparkles className="h-4 w-4" />
          Request UI Changes
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/80"
        >
          <ArrowRight className="h-4 w-4" />
          Continue
        </button>
      </div>
    </motion.section>
  );
}
