"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Sparkles, Workflow } from "lucide-react";

const projects = [
  {
    title: "Northstar CRM",
    description: "AI-native customer growth workspace",
    updated: "6m ago",
    status: "Shipping",
    icon: Sparkles,
    accent: "from-cyan-500/20 to-indigo-500/20",
  },
  {
    title: "Orbit Copilot",
    description: "Agent orchestration for operations teams",
    updated: "1h ago",
    status: "Review",
    icon: Bot,
    accent: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    title: "Pulse Studio",
    description: "Lean product design and launch system",
    updated: "3h ago",
    status: "Live",
    icon: Workflow,
    accent: "from-emerald-500/20 to-cyan-500/20",
  },
];

export function RecentProjects() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/40">Recent Projects</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Latest builds</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/45">
          Updated now
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {projects.map((project, index) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${project.accent} p-3`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold text-white">{project.title}</h3>
              <p className="mt-2 text-[14px] leading-7 text-white/50">{project.description}</p>
              <div className="mt-5 flex items-center justify-between text-[13px] text-white/45">
                <span>{project.updated}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-white/60">
                  {project.status}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
