"use client";

import { motion } from "framer-motion";
import { AGENTS } from "@/constants/agents";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { cn } from "@/lib/cn";

const STATUS_LABELS = {
  active: { label: "Active", color: "text-emerald-400", dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" },
  thinking: { label: "Thinking", color: "text-amber-400", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" },
  ready: { label: "Ready", color: "text-cyan-400", dot: "bg-cyan-400/70" },
} as const;

export function AgentTeam() {
  return (
    <section id="agents" className="relative px-5 py-32 md:px-8 md:py-44">
      <div className="mx-auto max-w-7xl">
        <SectionLabel>Your Team</SectionLabel>
        <SectionHeading
          title="Meet Your AI Engineering Team"
          subtitle="Ten specialized autonomous agents — each an expert in their domain — collaborating in real-time to ship production software."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            const status = STATUS_LABELS[agent.status];

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <TiltCard glowColor={agent.glow}>
                  <div
                    className="group relative overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#0B1020]/70 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.12]"
                    style={{
                      boxShadow: `0 0 0 0 ${agent.glow}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${agent.glow}`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${agent.glow}`;
                    }}
                  >
                    {/* Hover glow overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${agent.color}12, transparent 70%)`,
                      }}
                    />

                    <div className="relative">
                      {/* Avatar + status */}
                      <div className="mb-5 flex items-start justify-between">
                        <div className="relative">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08]"
                            style={{ background: `${agent.color}15` }}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{ color: agent.color }}
                              strokeWidth={1.5}
                            />
                          </div>
                          <div
                            className={cn(
                              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0B1020]",
                              status.dot,
                              agent.status !== "ready" && "animate-pulse"
                            )}
                          />
                        </div>
                        <span className={cn("text-[11px] font-medium", status.color)}>
                          {status.label}
                        </span>
                      </div>

                      <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                        {agent.name}
                      </p>
                      <h3 className="mb-2 text-[15px] font-semibold tracking-[-0.01em] text-white">
                        {agent.role}
                      </h3>
                      <p className="mb-4 text-[13px] leading-relaxed text-white/40">
                        {agent.description}
                      </p>
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wider text-white/25">
                          Specialization
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-white/50">
                          {agent.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
