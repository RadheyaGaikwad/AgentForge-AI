export type AgentStatus = "Idle" | "Planning" | "Working" | "Waiting" | "Reviewing" | "Fixing" | "Verified" | "Completed";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  status: AgentStatus;
  currentTask: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}
