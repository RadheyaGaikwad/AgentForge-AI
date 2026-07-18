"use client";

import { motion } from "framer-motion";
import { GitCommit, Rocket } from "lucide-react";
import { BENTO_ITEMS, type BentoItem } from "@/constants/features";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/cn";

const SPAN_CLASSES: Record<BentoItem["span"], string> = {
  sm: "col-span-1 row-span-1",
  md: "col-span-1 row-span-1 md:col-span-1",
  lg: "col-span-1 row-span-1 md:col-span-2 md:row-span-2",
  wide: "col-span-1 row-span-1 md:col-span-2",
  tall: "col-span-1 row-span-1 md:row-span-2",
};

function StatDisplay({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value, 1800);

  return (
    <div ref={ref}>
      <p className="text-4xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
        {Math.round(count)}
        <span className="text-cyan-400">{suffix}</span>
      </p>
      <p className="mt-1 text-[12px] text-white/35">{label}</p>
    </div>
  );
}

function MiniGraph({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="mt-4 flex h-20 items-end gap-1.5">
      {data.map((v, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-gradient-to-t from-indigo-500/40 to-cyan-400/60"
          initial={{ height: 0 }}
          whileInView={{ height: `${(v / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

function TerminalPreview({ lines }: { lines: string[] }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.04] bg-[#05060B]/80 p-4 font-mono text-[11px] leading-relaxed">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className={
            line.startsWith("✓")
              ? "text-emerald-400/80"
              : line.startsWith("→")
                ? "text-cyan-400/60"
                : "text-white/40"
          }
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

function CodePreview({ code }: { code: string }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl border border-white/[0.04] bg-[#05060B]/80 p-4 font-mono text-[10px] leading-relaxed text-white/50">
      {code}
    </pre>
  );
}

function NetworkViz() {
  return (
    <div className="relative mt-4 h-32">
      <svg viewBox="0 0 300 120" className="h-full w-full" aria-hidden>
        {[
          [150, 60, 80, 30],
          [150, 60, 220, 30],
          [150, 60, 80, 90],
          [150, 60, 220, 90],
          [80, 30, 220, 30],
          [80, 90, 220, 90],
        ].map(([x1, y1, x2, y2], i) => (
          <motion.line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(99,102,241,0.3)"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}
        {[
          [150, 60, "#6366F1"],
          [80, 30, "#06B6D4"],
          [220, 30, "#A855F7"],
          [80, 90, "#3B82F6"],
          [220, 90, "#22D3EE"],
        ].map(([cx, cy, color], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r="6"
            fill={color as string}
            fillOpacity={0.6}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.08, type: "spring" }}
          />
        ))}
      </svg>
    </div>
  );
}

function DeployAnimation() {
  return (
    <div className="mt-4 flex items-center gap-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
        >
          {i === 3 ? (
            <Rocket className="h-4 w-4 text-cyan-400" />
          ) : (
            <GitCommit className="h-4 w-4 text-white/30" />
          )}
        </motion.div>
      ))}
      <motion.div
        className="h-px flex-1 bg-gradient-to-r from-indigo-500/40 via-cyan-400/60 to-transparent"
        animate={{ scaleX: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: "left" }}
      />
      <span className="font-mono text-[11px] text-emerald-400/70">deployed ✓</span>
    </div>
  );
}

function BentoCard({ item, index }: { item: BentoItem; index: number }) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0B1020]/60 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(99,102,241,0.08)]",
        SPAN_CLASSES[item.span]
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_60%)]" />

      <div className="relative flex h-full flex-col">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
            <Icon className="h-4 w-4 text-white/50" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-white">
              {item.title}
            </h3>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-white/35">{item.description}</p>

        {item.variant === "stat" && item.stat && (
          <div className="mt-auto pt-6">
            <StatDisplay {...item.stat} />
          </div>
        )}

        {item.variant === "terminal" && item.terminalLines && (
          <TerminalPreview lines={item.terminalLines} />
        )}

        {item.variant === "graph" && item.graphData && (
          <MiniGraph data={item.graphData} />
        )}

        {item.variant === "code" && item.codeSnippet && (
          <CodePreview code={item.codeSnippet} />
        )}

        {item.variant === "deploy" && <DeployAnimation />}

        {item.variant === "network" && (
          <>
            {item.stat && (
              <div className="mb-2 mt-4">
                <StatDisplay {...item.stat} />
              </div>
            )}
            <NetworkViz />
          </>
        )}
      </div>
    </motion.div>
  );
}

export function BentoFeatures() {
  return (
    <section id="features" className="relative px-5 py-32 md:px-8 md:py-44">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>Platform</SectionLabel>
        <SectionHeading
          title="Engineering at the Speed of Thought"
          subtitle="Every capability you need to go from idea to deployed software — orchestrated by autonomous AI agents."
        />

        <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
          {BENTO_ITEMS.map((item, i) => (
            <BentoCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
