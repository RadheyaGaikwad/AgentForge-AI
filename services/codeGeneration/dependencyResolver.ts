const KNOWN_DEPENDENCIES: Record<string, string[]> = {
  nextjs: ["next", "react", "react-dom"],
  react: ["react", "react-dom"],
  tailwind: ["tailwindcss", "postcss", "autoprefixer"],
  node: ["express", "dotenv"],
  express: ["express", "dotenv"],
  fastapi: ["fastapi", "uvicorn", "python-dotenv"],
  prisma: ["prisma", "@prisma/client"],
  mongo: ["mongodb"],
  postgresql: ["pg"],
  docker: ["docker"],
};

export interface DependencyResolutionOptions {
  techStack?: string[];
  framework?: string;
  packageManager?: string;
}

export class DependencyResolver {
  resolve(options: DependencyResolutionOptions = {}): string[] {
    const normalizedStack = (options.techStack ?? []).map((entry) => entry.toLowerCase());
    const framework = (options.framework ?? "").toLowerCase();
    const dependencies = new Set<string>();

    if (framework.includes("next")) {
      KNOWN_DEPENDENCIES.nextjs.forEach((dependency) => dependencies.add(dependency));
    }

    if (framework.includes("react") && !framework.includes("next")) {
      KNOWN_DEPENDENCIES.react.forEach((dependency) => dependencies.add(dependency));
    }

    if (framework.includes("express") || normalizedStack.includes("express")) {
      KNOWN_DEPENDENCIES.express.forEach((dependency) => dependencies.add(dependency));
    }

    if (framework.includes("fastapi") || normalizedStack.includes("fastapi")) {
      KNOWN_DEPENDENCIES.fastapi.forEach((dependency) => dependencies.add(dependency));
    }

    if (normalizedStack.includes("tailwind")) {
      KNOWN_DEPENDENCIES.tailwind.forEach((dependency) => dependencies.add(dependency));
    }

    if (normalizedStack.includes("prisma")) {
      KNOWN_DEPENDENCIES.prisma.forEach((dependency) => dependencies.add(dependency));
    }

    if (normalizedStack.includes("mongo") || normalizedStack.includes("mongodb")) {
      KNOWN_DEPENDENCIES.mongo.forEach((dependency) => dependencies.add(dependency));
    }

    if (normalizedStack.includes("postgres") || normalizedStack.includes("postgresql")) {
      KNOWN_DEPENDENCIES.postgresql.forEach((dependency) => dependencies.add(dependency));
    }

    if (framework.includes("python") || normalizedStack.includes("python")) {
      dependencies.add("python");
    }

    return Array.from(dependencies);
  }
}

export const dependencyResolver = new DependencyResolver();
