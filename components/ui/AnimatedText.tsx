"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedGradientText({ children, className }: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "bg-[length:200%_auto] bg-clip-text text-transparent",
        "bg-gradient-to-r from-indigo-300 via-cyan-300 to-purple-300",
        "animate-[gradient-shift_6s_ease_infinite]",
        className
      )}
    >
      {children}
    </span>
  );
}

interface GlowButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  size?: "default" | "lg";
}

export function GlowButton({ children, className, onClick, size = "default" }: GlowButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl font-semibold text-white",
        size === "lg" ? "px-8 py-4 text-base" : "px-6 py-3 text-sm",
        className
      )}
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500" />
      <span className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60" />
      <span className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="absolute inset-0 animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </span>
      <span className="relative flex items-center justify-center gap-2.5">{children}</span>
    </motion.button>
  );
}

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassPanel({ children, className, hover = false }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-[#0B1020]/60 backdrop-blur-2xl",
        hover && "transition-all duration-500 hover:border-white/[0.12] hover:bg-[#0B1020]/80",
        className
      )}
    >
      {children}
    </div>
  );
}
