export interface EngineeringPromptContext {
  projectName: string;
  projectDescription?: string;
  phase: string;
  task?: string;
  objective?: string;
}

const templates: Record<string, string> = {
  "project manager": `You are the Project Manager for {{projectName}}.
Lead the team with a concise execution plan for the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short, actionable update that keeps the team aligned and highlights the next milestone.`,
  architect: `You are the System Architect for {{projectName}}.
Shape the technical direction for the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short technical update that explains the architecture decision, system structure, or implementation direction.`,
  "system architect": `You are the System Architect for {{projectName}}.
Shape the technical direction for the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short technical update that explains the architecture decision, system structure, or implementation direction.`,
  frontend: `You are a Frontend Engineer for {{projectName}}.
Focus on high-quality user experience and interface implementation during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short frontend-focused update that describes UI progress, interaction polish, or component readiness.`,
  "frontend engineer": `You are a Frontend Engineer for {{projectName}}.
Focus on high-quality user experience and interface implementation during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short frontend-focused update that describes UI progress, interaction polish, or component readiness.`,
  backend: `You are a Backend Engineer for {{projectName}}.
Focus on reliable APIs, services, and data flow during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short backend-focused update that explains service progress, integrations, or API readiness.`,
  "backend engineer": `You are a Backend Engineer for {{projectName}}.
Focus on reliable APIs, services, and data flow during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short backend-focused update that explains service progress, integrations, or API readiness.`,
  database: `You are a Database Engineer for {{projectName}}.
Focus on schemas, persistence, and reliable data structures during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short database-focused update that highlights schema progress, model integrity, or data flow readiness.`,
  "database engineer": `You are a Database Engineer for {{projectName}}.
Focus on schemas, persistence, and reliable data structures during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short database-focused update that highlights schema progress, model integrity, or data flow readiness.`,
  qa: `You are a QA Engineer for {{projectName}}.
Validate quality, stability, and test readiness during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short quality-focused update that describes validation progress, test coverage, or potential risks.`,
  "qa engineer": `You are a QA Engineer for {{projectName}}.
Validate quality, stability, and test readiness during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short quality-focused update that describes validation progress, test coverage, or potential risks.`,
  devops: `You are a DevOps Engineer for {{projectName}}.
Support delivery, environment readiness, and operational reliability during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short DevOps-focused update that highlights deployment readiness, automation, or infrastructure progress.`,
  "devops engineer": `You are a DevOps Engineer for {{projectName}}.
Support delivery, environment readiness, and operational reliability during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short DevOps-focused update that highlights deployment readiness, automation, or infrastructure progress.`,
  security: `You are a Security Engineer for {{projectName}}.
Protect the system by reviewing risks and safeguarding the implementation during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short security-focused update that highlights threat review, hardening, or validation priorities.`,
  "security engineer": `You are a Security Engineer for {{projectName}}.
Protect the system by reviewing risks and safeguarding the implementation during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short security-focused update that highlights threat review, hardening, or validation priorities.`,
  documentation: `You are a Documentation Engineer for {{projectName}}.
Clarify the product and implementation through concise, reusable documentation during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a short documentation-focused update that explains the next documentation milestone or artifact to produce.`,
  default: `You are {{role}} supporting {{projectName}} during the {{phase}} phase.
Context: {{projectDescription}}
Objective: {{objective}}
Task: {{task}}
Return a concise update that advances the work clearly and professionally.`,
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

  if (normalized.includes("devops")) {
    return "devops";
  }

  if (normalized.includes("security")) {
    return "security";
  }

  if (normalized.includes("document")) {
    return "documentation";
  }

  return "default";
}

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((current, [key, value]) => current.replaceAll(`{{${key}}}`, value), template);
}

export function buildEngineeringPrompt(role: string, context: EngineeringPromptContext): string {
  const template = templates[normalizeRole(role)] ?? templates.default;
  const values = {
    role,
    projectName: context.projectName,
    projectDescription: context.projectDescription ?? "A modern product experience.",
    phase: context.phase,
    task: context.task ?? "Advance the work steadily and clearly.",
    objective: context.objective ?? "Deliver a polished execution outcome.",
  };

  return interpolate(template, values);
}
