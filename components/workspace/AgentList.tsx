"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AgentCard } from "@/components/workspace/AgentCard";
import type { AgentStatus } from "@/types/agent";

interface AgentItem {
  id: string;
  name: string;
  task: string;
  progress: number;
  status: AgentStatus;
  icon: LucideIcon;
  accent: string;
  initials: string;
}

interface AgentListProps {
  agents: AgentItem[];
  activeAgentId?: string | null;
}

export function AgentList({ agents, activeAgentId }: AgentListProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/40">AI Team Status</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Team execution</h2>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[12px] font-medium text-emerald-300">
          Online
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {agents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            task={agent.task}
            progress={agent.progress}
            status={agent.status}
            icon={agent.icon}
            accent={agent.accent}
            initials={agent.initials}
            index={index}
            isActive={activeAgentId === agent.id}
          />
        ))}
      </div>
    </motion.section>
  );
}
