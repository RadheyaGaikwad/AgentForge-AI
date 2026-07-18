"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { NAV_LINKS } from "@/constants/navigation";
import { useNavbarScroll } from "@/hooks/useNavbarScroll";
import { cn } from "@/lib/cn";
import { MagneticButton } from "@/components/ui/TiltCard";

export function Navbar() {
  const scrolled = useNavbarScroll(40);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-5 pt-5 md:px-8"
    >
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-5 py-3 transition-all duration-500 md:px-6",
          scrolled
            ? "border-white/[0.08] bg-[#0B1020]/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
            : "border-white/[0.04] bg-white/[0.02] backdrop-blur-xl"
        )}
      >
        <Link href="#" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 opacity-80 blur-sm transition-opacity group-hover:opacity-100" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400">
              <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            AgentForge
          </span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-[13px] text-white/45 transition-all duration-300 hover:bg-white/[0.04] hover:text-white/90"
            >
              {link.label}
            </a>
          ))}
        </div>

        <MagneticButton>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-medium text-[#05060B] shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-shadow hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Launch App
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </motion.a>
        </MagneticButton>
      </nav>
    </motion.header>
  );
}
