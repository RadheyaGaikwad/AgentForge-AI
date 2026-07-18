import { create } from "zustand";
import type { AgentStatus } from "@/types/agent";
import { Brain, BrainCircuit, Code2, Database, Layers3, MonitorPlay, ShieldCheck, Workflow, Zap } from "lucide-react";

export interface WorkspaceAgent {
  id: string;
  name: string;
  task: string;
  progress: number;
  status: AgentStatus;
  icon: typeof Layers3;
  accent: string;
  initials: string;
}

interface AgentsState {
  agents: WorkspaceAgent[];
  setAgents: (agents: WorkspaceAgent[]) => void;
  updateAgent: (id: string, updates: Partial<WorkspaceAgent>) => void;
  advanceAgents: (lifecycleStates: AgentStatus[]) => void;
}

const createInitialAgents = (): WorkspaceAgent[] => [
  {
    id: "project-manager",
    name: "Project Manager Agent",
    task: "Planning architecture and aligning the roadmap",
    progress: 18,
    status: "Planning",
    icon: Layers3,
    accent: "from-cyan-500/80 to-indigo-500/80",
    initials: "PM",
  },
  {
    id: "architect",
    name: "Architecture Agent",
    task: "Refining the system blueprint",
    progress: 48,
    status: "Working",
    icon: BrainCircuit,
    accent: "from-violet-500/80 to-fuchsia-500/80",
    initials: "AA",
  },
  {
    id: "frontend-engineer",
    name: "Frontend Engineer Agent",
    task: "Building the core experience layer",
    progress: 48,
    status: "Working",
    icon: Code2,
    accent: "from-amber-400/80 to-orange-500/80",
    initials: "FE",
  },
  {
    id: "backend-engineer",
    name: "Backend Engineer Agent",
    task: "Creating APIs and orchestrating services",
    progress: 72,
    status: "Waiting",
    icon: Workflow,
    accent: "from-emerald-400/80 to-cyan-500/80",
    initials: "BE",
  },
  {
    id: "database-engineer",
    name: "Database Engineer Agent",
    task: "Designing schema and optimizing queries",
    progress: 86,
    status: "Reviewing",
    icon: Database,
    accent: "from-sky-500/80 to-blue-500/80",
    initials: "DB",
  },
  {
    id: "devops-engineer",
    name: "DevOps Engineer Agent",
    task: "Preparing rollout and observability",
    progress: 100,
    status: "Completed",
    icon: Zap,
    accent: "from-indigo-400/80 to-cyan-400/80",
    initials: "DE",
  },
  {
    id: "qa-engineer",
    name: "QA Engineer Agent",
    task: "Running regression checks and edge cases",
    progress: 72,
    status: "Waiting",
    icon: MonitorPlay,
    accent: "from-pink-500/80 to-rose-500/80",
    initials: "QA",
  },
  {
    id: "documentation-agent",
    name: "Documentation Agent",
    task: "Producing clear technical documentation and standards",
    progress: 48,
    status: "Working",
    icon: Brain,
    accent: "from-purple-500/80 to-indigo-500/80",
    initials: "DA",
  },
  {
    id: "security-engineer",
    name: "Deployment Agent",
    task: "Auditing auth and hardening systems",
    progress: 86,
    status: "Reviewing",
    icon: ShieldCheck,
    accent: "from-lime-500/80 to-emerald-500/80",
    initials: "DP",
  },
];

export const useAgentsStore = create<AgentsState>((set) => ({
  agents: createInitialAgents(),
  setAgents: (agents) => set({ agents }),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) => (agent.id === id ? { ...agent, ...updates } : agent)),
    })),
  advanceAgents: (lifecycleStates) =>
    set((state) => ({
      agents: state.agents.map((agent, index) => {
        const stateIndex = index % lifecycleStates.length;
        const nextStatus = lifecycleStates[stateIndex];
        const progressMap: Record<AgentStatus, number> = {
          Idle: 0,
          Planning: 18,
          Working: 48,
          Waiting: 72,
          Reviewing: 86,
          Fixing: 70,
          Verified: 95,
          Completed: 100,
        };

        return {
          ...agent,
          status: nextStatus,
          progress: progressMap[nextStatus],
        };
      }),
    })),
}));
