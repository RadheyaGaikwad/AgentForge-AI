"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { FOOTER_LINKS } from "@/constants/navigation";
import { GlowButton } from "@/components/ui/AnimatedText";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/30">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-[14px] text-white/45 transition-colors duration-300 hover:text-white/80"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative px-5 py-32 md:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-cyan-400/70">
            Pricing
          </p>
          <h2 className="text-4xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
            Start Building Today
          </h2>
          <p className="mt-4 text-white/40">
            Launch your first engineering team for free. Scale as your projects grow.
          </p>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative mt-12 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0B1020]/80 p-10 backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_60%)]" />
            <div className="relative">
              <p className="text-[13px] text-white/35">Pro Plan</p>
              <div className="mt-2 flex items-end justify-center gap-1">
                <span className="text-6xl font-semibold tracking-[-0.04em] text-white">$49</span>
                <span className="mb-2 text-white/35">/month</span>
              </div>
              <ul className="my-8 space-y-3">
                {[
                  "Unlimited AI engineering teams",
                  "Real-time collaboration dashboard",
                  "Direct ZIP export workflows",
                  "Priority review pipelines",
                ].map((item) => (
                  <li key={item} className="flex items-center justify-center gap-2 text-[14px] text-white/45">
                    <span className="text-cyan-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <GlowButton className="w-full">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </GlowButton>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-5 pt-20 pb-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Newsletter */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 rounded-[28px] border border-white/[0.06] bg-[#0B1020]/50 p-8 backdrop-blur-2xl md:flex-row md:items-center md:p-10">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-white">AgentForge</span>
            </div>
            <p className="max-w-sm text-[14px] text-white/40">
              Stay updated on the future of AI software engineering.
            </p>
          </div>
          <div className="flex w-full max-w-md gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:border-white/[0.15] focus:outline-none"
            />
            <GlowButton>Subscribe</GlowButton>
          </div>
        </div>

        {/* Link columns */}
        <div className="mb-16 grid grid-cols-2 gap-10 md:grid-cols-4">
          <FooterColumn title="Product" links={FOOTER_LINKS.product} />
          <FooterColumn title="Resources" links={FOOTER_LINKS.resources} />
          <FooterColumn title="Company" links={FOOTER_LINKS.company} />
          <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 md:flex-row">
          <p className="text-[13px] text-white/30">
            © {new Date().getFullYear()} AgentForge. The AI Engineering Operating System.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-white/30">Full-stack web application generation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
