export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  roles: string[];
  parallel?: boolean;
}

export const engineeringWorkflow: WorkflowStage[] = [
  {
    id: "project-manager",
    name: "Planner Agent",
    description: "Align scope, priorities, and delivery milestones.",
    roles: ["Project Manager"],
  },
  {
    id: "system-architect",
    name: "Architecture Agent",
    description: "Design the architecture and technical boundaries.",
    roles: ["System Architect"],
  },
  { id: "frontend-engineer", name: "Frontend Agent", description: "Builds the user-facing application from the architecture handoff.", roles: ["Frontend Engineer"] },
  { id: "backend-engineer", name: "Backend Agent", description: "Builds services from the frontend and architecture handoffs.", roles: ["Backend Engineer"] },
  { id: "database-engineer", name: "Database Agent", description: "Defines persistence from the backend and architecture handoffs.", roles: ["Database Engineer"] },
  {
    id: "qa-engineer",
    name: "QA Agent",
    description: "Validate reliability, quality, and edge cases.",
    roles: ["QA Engineer"],
  },
  {
    id: "devops-engineer",
    name: "Deployment Agent",
    description: "Prepare delivery, review, and handoff readiness.",
    roles: ["DevOps Engineer"],
  },
];
