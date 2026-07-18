export type TaskStatus = "Pending" | "Assigned" | "Running" | "Waiting" | "Blocked" | "Completed" | "Failed" | "Cancelled" | "Retry";
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedAgent: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  createdAt: string;
  completedAt: string | null;
}
