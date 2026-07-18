"use client";

import { motion } from "framer-motion";
import { WORKFLOW_STAGES } from "@/constants/workflow";
import { SectionHeading, SectionLabel } from "@/components/ui/SectionHeading";

export function WorkflowPipeline() {
  return (
    <section id="workflow" className="relative overflow-hidden px-5 py-32 md:px-8 md:py-44">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(99,102,241,0.06),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl">
        <SectionLabel className="block text-center">Pipeline</SectionLabel>
        <SectionHeading
          title="From Prompt to Production"
          subtitle="Watch your idea flow through an autonomous engineering pipeline — every stage orchestrated by AI."
          className="mx-auto text-center"
        />

        <div className="relative mt-4">
          {/* Energy beam background */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 overflow-hidden">
            <motion.div
              className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent blur-sm"
              animate={{ y: ["-20%", "120%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-cyan-400/10 to-purple-500/20" />
          </div>

          <div className="flex flex-col items-center gap-0">
            {WORKFLOW_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isFirst = i === 0;
              const isLast = i === WORKFLOW_STAGES.length - 1;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative flex flex-col items-center"
                >
                  {/* Node */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`relative z-10 flex items-center gap-4 rounded-2xl border px-6 py-4 backdrop-blur-2xl transition-all duration-300 ${
                      isLast
                        ? "border-cyan-400/30 bg-cyan-500/[0.08] shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                        : isFirst
                          ? "border-indigo-400/30 bg-indigo-500/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                          : "border-white/[0.06] bg-[#0B1020]/80 hover:border-white/[0.12]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isLast
                          ? "bg-cyan-500/15"
                          : isFirst
                            ? "bg-indigo-500/15"
                            : "bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isLast
                            ? "text-cyan-400"
                            : isFirst
                              ? "text-indigo-400"
                              : "text-white/50"
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-[15px] font-semibold tracking-[-0.01em] ${
                          isLast ? "text-cyan-300" : isFirst ? "text-indigo-300" : "text-white"
                        }`}
                      >
                        {stage.title}
                      </p>
                      <p className="text-[12px] text-white/35">{stage.subtitle}</p>
                    </div>

                    {/* Pulse ring on active nodes */}
                    {(isFirst || isLast) && (
                      <motion.div
                        className={`absolute inset-0 rounded-2xl border ${
                          isLast ? "border-cyan-400/20" : "border-indigo-400/20"
                        }`}
                        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Connector */}
                  {!isLast && (
                    <div className="relative flex h-10 flex-col items-center justify-center">
                      <motion.div
                        animate={{ opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                        className="text-white/20"
                      >
                        ↓
                      </motion.div>
                      {/* Energy particle */}
                      <motion.div
                        className="absolute h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        animate={{ y: [-8, 32], opacity: [0, 1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
