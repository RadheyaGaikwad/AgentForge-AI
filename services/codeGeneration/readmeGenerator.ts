export interface ReadmeGeneratorOptions {
  projectName: string;
  description?: string;
  framework?: string;
  techStack?: string[];
  architecture?: string;
}

export class ReadmeGenerator {
  generate(options: ReadmeGeneratorOptions): string {
    const stackEntries = options.techStack ?? [];
    const stack = stackEntries.length > 0 ? stackEntries.join(", ") : (options.framework ?? "Next.js");

    return `# ${options.projectName}

${options.description ?? "A generated software project produced by AgentForge AI."}

## Stack
- Framework: ${options.framework ?? "Next.js"}
- Tech Stack: ${stack}

## Architecture
${options.architecture ?? "Generated from the orchestrated agent outputs and assembled into a real project artifact tree."}

## Getting Started
1. Install dependencies with npm install.
2. Start the development server with npm run dev.
3. Build the production bundle with npm run build.

## Project Structure
- app/
- components/
- lib/
- services/
- prisma/
- public/

## Notes
This README was generated from the project context, architecture, and task outputs produced by the AI agents.
`;
  }
}

export const readmeGenerator = new ReadmeGenerator();
