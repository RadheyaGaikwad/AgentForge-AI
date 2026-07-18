"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock3, PauseCircle, PlayCircle, RotateCcw, Sparkles, XCircle } from "lucide-react";
import type { Task } from "@/types/task";

interface AgentSummary {
  id: string;
  name: string;
  role: string;
}

interface TaskQueueProps {
  tasks: Task[];
  agents: AgentSummary[];
}

const statusStyles: Record<Task["status"], string> = {
  Pending: "bg-slate-400/20 text-slate-300",
  Assigned: "bg-cyan-400/20 text-cyan-300",
  Running: "bg-violet-400/20 text-violet-300",
  Waiting: "bg-amber-400/20 text-amber-300",
  Blocked: "bg-rose-400/20 text-rose-300",
  Completed: "bg-emerald-400/20 text-emerald-300",
  Failed: "bg-rose-400/20 text-rose-300",
  Cancelled: "bg-stone-400/20 text-stone-300",
  Retry: "bg-orange-400/20 text-orange-300",
};

const statusIcons: Record<Task["status"], typeof Clock3> = {
  Pending: Clock3,
  Assigned: Sparkles,
  Running: PlayCircle,
  Waiting: PauseCircle,
  Blocked: AlertCircle,
  Completed: CheckCircle2,
  Failed: AlertCircle,
  Cancelled: XCircle,
  Retry: RotateCcw,
};

export function TaskQueue({ tasks, agents }: TaskQueueProps) {
  const agentMap = new Map(agents.map((agent) => [agent.id, agent]));

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/40">Task Queue</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Work is queued by ownership</h2>
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[12px] font-medium text-cyan-300">
          Modular
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {tasks.map((task, index) => {
          const owner = task.assignedAgent ? agentMap.get(task.assignedAgent) : null;
          const StatusIcon = statusIcons[task.status];

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-white">{task.title}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[task.status]}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-7 text-white/50">{task.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/45">
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1">
                      Owner: {owner?.name ?? "Unassigned"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1">
                      Priority: {task.priority}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-white/70">
                  <StatusIcon className="h-4.5 w-4.5" />
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
