"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutGrid,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Workspace", icon: LayoutGrid, href: "/workspace" },
  { label: "Projects", icon: FolderKanban, href: "/dashboard" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]"
    >
      <div className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-5 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-[0_0_35px_rgba(99,102,241,0.28)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/40">AgentForge</p>
            <p className="text-lg font-semibold tracking-[-0.02em] text-white">Workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.label}
                whileHover={{ x: 4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 380, damping: 24 }}
              >
                <Link href={item.href} className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-[15px] transition-all ${isActive ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "text-white/55 hover:bg-white/[0.05] hover:text-white/80"}`}>
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );
}
