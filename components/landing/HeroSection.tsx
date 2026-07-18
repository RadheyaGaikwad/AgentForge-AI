"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  Sparkles,
  Star,
} from "lucide-react";
import { BUILDER_AVATARS } from "@/constants/agents";
import { AnimatedGradientText, GlowButton } from "@/components/ui/AnimatedText";
import { GlassPanel } from "@/components/ui/AnimatedText";
import { AICoreVisualization } from "@/components/landing/AICoreVisualization";

const suggestionChips = [
  "🏥 Hospital Management",
  "🏋️ Gym Management",
  "📚 Library Management",
  "📦 Inventory Management",
  "🤝 CRM",
  "🏢 ERP",
  "🏫 School Management",
  "🏨 Hotel Management",
  "👥 HR Management",
  "💼 Payroll Management",
  "🧾 Billing System",
  "🏭 Custom Business Application",
];

export function HeroSection() {

  return (
    <section className="relative min-h-screen px-5 pt-32 pb-20 md:px-8 md:pt-36 lg:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* Left */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-6 text-sm font-medium tracking-wide text-white/40">
              Business application generation platform
            </p>

            <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-white">
              AgentForge builds
              <br />
              business software faster.
            </h1>

            <p className="mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
              <AnimatedGradientText>Web Applications</AnimatedGradientText>
              <br />
              <AnimatedGradientText>Desktop Applications</AnimatedGradientText>
            </p>

            <p className="mt-7 max-w-lg text-base leading-relaxed text-white/40 md:text-[17px]">
              Generate production-ready business web applications and desktop application projects for real operations teams.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mt-10"
            id="launch"
          >
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-indigo-500/20 via-cyan-400/15 to-purple-500/20 blur-3xl" />
            <GlassPanel className="relative overflow-hidden border-white/[0.12] p-[1px] shadow-[0_25px_90px_rgba(2,6,23,0.45)]">
              <div className="relative overflow-hidden rounded-[30px] bg-[#060811]/85 p-5 sm:p-6">
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6], scale: [0.98, 1, 0.98] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-10 top-12 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl"
                />
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.04, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-violet-500/20 blur-3xl"
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      Project Builder
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/35">
                      ⌘ ↵
                    </div>
                  </div>

                  <textarea
                    className="mt-5 min-h-[140px] w-full resize-none border-none bg-transparent text-[17px] leading-8 text-white/85 outline-none placeholder:text-white/35 sm:text-[18px]"
                    placeholder="Generate a hospital, gym, library, inventory, CRM, ERP, school, hotel, HR, payroll, billing, or custom business application..."
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestionChips.map((chip, index) => (
                      <motion.button
                        key={chip}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.04, duration: 0.35 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-[13px] text-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
                      >
                        {chip}
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-white/50">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                        Delivery Team Ready
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/45 sm:text-[13px]">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                        Team Size: <span className="ml-1 font-semibold text-white">8 agents</span>
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                        Build Time: <span className="ml-1 font-semibold text-white">3 min</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <a href="/login">
                      <GlowButton size="lg" className="rounded-full px-6 py-3.5 text-sm sm:px-7">
                        Launch Project
                        <ArrowRight className="h-4 w-4" />
                      </GlowButton>
                    </a>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex flex-wrap items-center gap-6"
          >
            {/* Builder avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {BUILDER_AVATARS.map((avatar, i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#05060B] text-[10px] font-semibold text-white"
                    style={{ background: avatar.color }}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <span className="text-[13px] text-white/35">
                <span className="text-white/60">2,400+</span> builders
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[12px] text-white/50">12.4k</span>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-white/35">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400/80">
                Open Source
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-white/35">
              <CreditCard className="h-3.5 w-3.5" />
              No credit card
            </div>
          </motion.div>
        </div>

        {/* Right — AI Core */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_60%)]" />
          <AICoreVisualization />
        </motion.div>
      </div>
    </section>
  );
}
