"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import type { WorkflowExecutionNode } from "@/services/workflowEngineService";

interface WorkflowExecutionViewProps {
  nodes: WorkflowExecutionNode[];
}

const statusStyles: Record<WorkflowExecutionNode["status"], string> = {
  Pending: "border-white/10 bg-white/[0.04] text-white/50",
  Running: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  Waiting: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Blocked: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export function WorkflowExecutionView({ nodes }: WorkflowExecutionViewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-[30px] border border-white/10 bg-[#0B1020]/70 p-6 shadow-[0_25px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/40">Workflow Engine</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">Execution follows dependency order</h2>
        </div>
        <div className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[12px] font-medium text-violet-300">
          Mocked
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {nodes.map((node, index) => {
          const statusIcon = node.status === "Completed"
            ? CheckCircle2
            : node.status === "Running"
              ? PlayCircle
              : node.status === "Waiting"
                ? PauseCircle
                : node.status === "Blocked"
                  ? XCircle
                  : Circle;
          const StatusIcon = statusIcon;

          return (
            <div key={node.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-2xl border p-2 ${statusStyles[node.status]}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{node.title}</p>
                    <p className="text-[13px] text-white/45">{node.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-white/45">
                  <span className={`rounded-full px-2.5 py-1 ${statusStyles[node.status]}`}>{node.status}</span>
                  {index < nodes.length - 1 ? <ArrowRight className="h-4 w-4" /> : null}
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${node.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
