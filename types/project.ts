export type ProjectStatus = "Planning" | "In Progress" | "Blocked" | "Completed";

export interface Project {
  id: string;
  name: string;
  description: string;
  projectType: string;
  techStack: string[];
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  projectPath?: string;
  database?: string;
  previewUrl?: string;
  zipPath?: string;
  deploymentStatus?: "PENDING" | "SUCCESS" | "FAILED";
  projectSummary?: string;
}
