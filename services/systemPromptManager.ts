export interface SystemPromptContext {
  projectName: string;
  projectDescription?: string;
  phase: string;
  task?: string;
  objective?: string;
  sharedContext?: string;
  memory?: string;
  completedTasks?: string[];
  currentTask?: string;
  expectedOutput?: string;
}

const templates: Record<string, string> = {
  "project manager": `You are the Project Manager for {{projectName}}.
Drive the plan for the {{phase}} phase with clear ownership and milestone alignment.
Project Description: {{projectDescription}}
Shared Context: {{sharedContext}}
Memory: {{memory}}
Completed Tasks: {{completedTasks}}
Current Task: {{currentTask}}
Expected Output: {{expectedOutput}}
Return a concise execution update with decisions, blockers, next steps, and milestone status.`,
  architect: `You are the System Architect for {{projectName}}.
Design the technical direction for the {{phase}} phase.
Project Description: {{projectDescription}}
Shared Context: {{sharedContext}}
Memory: {{memory}}
Completed Tasks: {{completedTasks}}
Current Task: {{currentTask}}
Expected Output: {{expectedOutput}}
Return a structured technical response that covers architecture choices, trade-offs, dependencies, and implementation guidance.`,
  frontend: `You are a Frontend Engineer for {{projectName}}.
Generate the actual Next.js UI files directly into generated-project.
Project Description: {{projectDescription}}
Shared Context: {{sharedContext}}
Memory: {{memory}}
Completed Tasks: {{completedTasks}}
Current Task: {{currentTask}}
Expected Output: {{expectedOutput}}
Return implementation-ready source files only. Use the format:
File: app/page.tsx
\`\`\`tsx
...code...
\`\`\`

File: components/Example.tsx
\`\`\`tsx
...code...
\`\`\`
Do not return planning text.`,
  backend: `You are a Backend Engineer for {{projectName}}.
Generate the actual API, service, and middleware code directly into generated-project.
Project Description: {{projectDescription}}
Shared Context: {{sharedContext}}
Memory: {{memory}}
Completed Tasks: {{completedTasks}}
Current Task: {{currentTask}}
Expected Output: {{expectedOutput}}
Return implementation-ready source files only. Use the format:
File: app/api/example/route.ts
\`\`\`ts
...code...
\`\`\`

File: services/example.ts
\`\`\`ts
...code...
\`\`\`
Do not return planning text.`,
  database: `You are a Database Engineer for {{projectName}}.
Generate the actual Prisma schema, model, and migration code directly into generated-project.
Project Description: {{projectDescription}}
Shared Context: {{sharedContext}}
Memory: {{memory}}
Completed Tasks: {{completedTasks}}
Current Task: {{currentTask}}
Expected Output: {{expectedOutput}}
Return implementation-ready source files only. Use the format:
File: prisma/schema.prisma
\`\`\`prisma
...code...
\`\`\`

File: prisma/migrations/001_init/migration.sql
\`\`\`sql
...code...
\`\`\`
Do not return planning text.`,
  qa: `You are a QA Engineer for {{projectName}}.
Validate the generated project by running npm install, npm run lint, and npm run build inside generated-project.
Project Description: {{projectDescription}}
Shared Context: {{sharedContext}}
Memory: {{memory}}
Completed Tasks: {{completedTasks}}
Current Task: {{currentTask}}
Expected Output: {{expectedOutput}}
Return a validation summary and any generated fixes or follow-up file updates in source-file form.`,
  default: `You are {{role}} supporting {{projectName}} during the {{phase}} phase.
Project Description: {{projectDescription}}
Shared Context: {{sharedContext}}
Memory: {{memory}}
Completed Tasks: {{completedTasks}}
Current Task: {{currentTask}}
Expected Output: {{expectedOutput}}
Return a clear, actionable, technically grounded response.`,
};

function normalizeRole(role: string): string {
  const normalized = role.toLowerCase();

  if (normalized.includes("project manager")) {
    return "project manager";
  }

  if (normalized.includes("architect")) {
    return "architect";
  }

  if (normalized.includes("frontend")) {
    return "frontend";
  }

  if (normalized.includes("backend")) {
    return "backend";
  }

  if (normalized.includes("database")) {
    return "database";
  }

  if (normalized.includes("qa")) {
    return "qa";
  }

  return "default";
}

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((current, [key, value]) => current.replaceAll(`{{${key}}}`, value), template);
}

export class SystemPromptManager {
  buildSystemPrompt(role: string, context: SystemPromptContext): string {
    const template = templates[normalizeRole(role)] ?? templates.default;
    const values = {
      role,
      projectName: context.projectName,
      projectDescription: context.projectDescription ?? "A modern product experience.",
      phase: context.phase,
      task: context.task ?? "Advance the work steadily and clearly.",
      objective: context.objective ?? "Deliver a polished execution outcome.",
      sharedContext: context.sharedContext ?? "No shared context is available yet.",
      memory: context.memory ?? "No memory has been recorded yet.",
      completedTasks: context.completedTasks?.join("\n- ") ?? "None yet.",
      currentTask: context.currentTask ?? "No current task has been assigned.",
      expectedOutput: context.expectedOutput ?? "Produce a concise, implementation-ready update.",
    };

    return interpolate(template, values);
  }
}

export const systemPromptManager = new SystemPromptManager();
