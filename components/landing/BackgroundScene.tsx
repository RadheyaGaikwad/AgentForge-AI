"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/cn";

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  size: 1 + (i % 2),
  opacity: 0.15 + (i % 5) * 0.08,
  duration: 8 + (i % 7) * 2,
  delay: (i % 12) * 0.5,
}));

const stars = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: (i * 43 + 3) % 100,
  y: (i * 67 + 19) % 100,
  size: 0.5 + (i % 3) * 0.5,
  opacity: 0.1 + (i % 4) * 0.15,
}));

export function BackgroundScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.6]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#05060B]" />

      {/* Mesh gradients */}
      <motion.div style={{ opacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(6,182,212,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,rgba(139,92,246,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_30%_at_70%_60%,rgba(236,72,153,0.04),transparent_60%)]" />
      </motion.div>

      {/* Animated blobs */}
      <motion.div style={{ y: y1 }} className="absolute inset-0">
        <motion.div
          className="absolute -left-40 top-[10%] h-[600px] w-[600px] rounded-full bg-indigo-600/[0.07] blur-[150px]"
          animate={{ x: [0, 80, 0], y: [0, -60, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-40 top-[30%] h-[700px] w-[700px] rounded-full bg-cyan-500/[0.05] blur-[160px]"
          animate={{ x: [0, -60, 0], y: [0, 80, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-[30%] h-[500px] w-[500px] rounded-full bg-purple-600/[0.06] blur-[130px]"
          animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Light rays */}
      <motion.div style={{ y: y2 }} className="absolute inset-0">
        <div className="absolute left-[20%] top-0 h-full w-px bg-gradient-to-b from-indigo-500/[0.08] via-transparent to-transparent" />
        <div className="absolute left-[50%] top-0 h-[80%] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-400/[0.06] via-indigo-500/[0.03] to-transparent" />
        <div className="absolute left-[75%] top-0 h-full w-px bg-gradient-to-b from-purple-500/[0.05] via-transparent to-transparent" />
      </motion.div>

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />

      {/* Stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-cyan-400/60"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3], y: [0, -30, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Noise */}
      <div className="absolute inset-0 opacity-[0.012] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#05060B_75%)]" />
    </div>
  );
}

interface FloatingCodeProps {
  code: string;
  className?: string;
  delay?: number;
}

export function FloatingCode({ code, className, delay = 0 }: FloatingCodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        opacity: { delay, duration: 0.8 },
        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={cn(
        "pointer-events-none absolute hidden rounded-xl border border-white/[0.06] bg-[#0B1020]/80 px-4 py-3 font-mono text-[10px] leading-relaxed text-white/30 backdrop-blur-xl lg:block",
        className
      )}
    >
      <pre>{code}</pre>
    </motion.div>
  );
}
