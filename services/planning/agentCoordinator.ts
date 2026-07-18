import { BrowserStorageManager } from "@/services/storage/browserStorageManager";
import type { SharedContextSnapshot } from "@/services/sharedContext";
import type { PlannedTaskNode } from "@/services/planning/dependencyGraph";

export interface AgentAssignment {
  taskId: string;
  agentId: string;
  agentRole: string;
  name: string;
  context: string;
}

const roleToAgentId: Record<string, string> = {
  "Project Manager": "project-manager",
  "System Architect": "architect",
  "Frontend Engineer": "frontend-engineer",
  "Backend Engineer": "backend-engineer",
  "Database Engineer": "database-engineer",
  "DevOps Engineer": "devops-engineer",
  "QA Engineer": "qa-engineer",
  "Documentation Engineer": "documentation-agent",
  "Security Engineer": "security-engineer",
};

const roleToName: Record<string, string> = {
  "Project Manager": "Project Manager Agent",
  "System Architect": "Architecture Agent",
  "Frontend Engineer": "Frontend Engineer Agent",
  "Backend Engineer": "Backend Engineer Agent",
  "Database Engineer": "Database Engineer Agent",
  "DevOps Engineer": "DevOps Engineer Agent",
  "QA Engineer": "QA Engineer Agent",
  "Documentation Engineer": "Documentation Agent",
  "Security Engineer": "Deployment Agent",
};

export class AgentCoordinator {
  assignTasks(tasks: PlannedTaskNode[], context: Partial<SharedContextSnapshot> = {}): AgentAssignment[] {
    return tasks.map((task) => {
      const agentId = roleToAgentId[task.role] ?? task.role.toLowerCase().replace(/\s+/g, "-");
      const agentName = roleToName[task.role] ?? task.role;
      const sharedContext = this.buildSharedContext(context, task);

      return {
        taskId: task.id,
        agentId,
        agentRole: task.role,
        name: agentName,
        context: sharedContext,
      };
    });
  }

  buildSharedContext(context: Partial<SharedContextSnapshot>, task: PlannedTaskNode): string {
    const projectMemory = context.projectInfo ? BrowserStorageManager.summarizePayload(context.projectInfo, 400) : "No project memory available yet.";
    const architecture = BrowserStorageManager.summarizeText(context.architecture || "Architecture is still being defined.", 300);
    const previousOutputs = context.completedTasks?.length ? context.completedTasks.slice(0, 4).join(" | ") : "No previous outputs recorded yet.";
    const generatedFiles = context.generatedFiles?.length ? context.generatedFiles.slice(0, 6).join(" | ") : "No generated files recorded yet.";
    const codingStandards = context.requirements?.length ? context.requirements.slice(0, 4).join(" | ") : "Follow the generated engineering standards for the project.";

    return [
      `Task: ${task.title}`,
      `Milestone: ${task.milestone}`,
      `Project Memory: ${projectMemory}`,
      `Architecture: ${architecture}`,
      `Previous Outputs: ${previousOutputs}`,
      `Generated Files: ${generatedFiles}`,
      `Coding Standards: ${codingStandards}`,
    ].join("\n");
  }
}

export const agentCoordinator = new AgentCoordinator();
