import type { ProjectArtifactType } from "@/types/projectArtifact";

export interface TemplateArtifact {
  relativePath: string;
  content: string;
  language: string;
  type: ProjectArtifactType;
  dependencies?: string[];
}

export interface TemplateRegistryEntry {
  folders: string[];
  files: TemplateArtifact[];
}

const templateProfiles: Record<string, TemplateRegistryEntry> = {
  nextjs: {
    folders: ["app", "components", "hooks", "lib", "public", "styles"],
    files: [
      {
        relativePath: "package.json",
        content: "{}",
        language: "json",
        type: "package",
        dependencies: ["next", "react", "react-dom"],
      },
      {
        relativePath: "README.md",
        content: "# Generated Project",
        language: "markdown",
        type: "readme",
      },
      {
        relativePath: ".env.example",
        content: "NEXT_PUBLIC_APP_NAME=generated-app\nNEXT_PUBLIC_API_URL=http://localhost:3000",
        language: "dotenv",
        type: "environment",
      },
      {
        relativePath: ".gitignore",
        content: "node_modules\n.next\n.env\n.env.local\ncoverage\n",
        language: "gitignore",
        type: "configuration",
      },
    ],
  },
  react: {
    folders: ["src", "public", "components", "hooks", "lib"],
    files: [],
  },
  express: {
    folders: ["src", "routes", "services", "config"],
    files: [],
  },
  python: {
    folders: ["app", "tests"],
    files: [],
  },
};

export class TemplateRegistry {
  getTemplate(framework: string): TemplateRegistryEntry {
    const normalized = framework.toLowerCase();

    if (normalized.includes("next")) {
      return templateProfiles.nextjs;
    }

    if (normalized.includes("react")) {
      return templateProfiles.react;
    }

    if (normalized.includes("express") || normalized.includes("node")) {
      return templateProfiles.express;
    }

    if (normalized.includes("fastapi") || normalized.includes("python")) {
      return templateProfiles.python;
    }

    return templateProfiles.nextjs;
  }
}

export const templateRegistry = new TemplateRegistry();
