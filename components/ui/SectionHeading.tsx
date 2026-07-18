"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "inline-block text-[11px] font-medium uppercase tracking-[0.2em] text-cyan-400/70",
        className
      )}
    >
      {children}
    </motion.span>
  );
}

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mb-20 max-w-3xl", className)}
    >
      <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-white md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-relaxed text-white/40 md:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
