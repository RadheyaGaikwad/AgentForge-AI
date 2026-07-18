const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ts: "typescript",
  tsx: "typescriptreact",
  js: "javascript",
  jsx: "javascriptreact",
  json: "json",
  md: "markdown",
  prisma: "prisma",
  sql: "sql",
  env: "dotenv",
  yml: "yaml",
  yaml: "yaml",
  css: "css",
  scss: "scss",
  sh: "shell",
  html: "html",
  gitignore: "gitignore",
  dockerignore: "gitignore",
};

export interface LanguageResolutionResult {
  language: string;
  extension: string;
}

export class LanguageResolver {
  resolve(pathname: string, fallback = "text"): LanguageResolutionResult {
    const normalizedPath = pathname.replace(/\\/g, "/").trim();
    const extension = normalizedPath.split(".").pop()?.toLowerCase() ?? "";

    if (!extension) {
      return {
        language: fallback,
        extension: "",
      };
    }

    return {
      language: LANGUAGE_BY_EXTENSION[extension] ?? fallback,
      extension,
    };
  }

  getDefaultLanguage(framework: string, language = "typescript"): string {
    if (framework.toLowerCase().includes("python") || framework.toLowerCase().includes("fastapi")) {
      return "python";
    }

    if (framework.toLowerCase().includes("node") || framework.toLowerCase().includes("express")) {
      return "javascript";
    }

    return language;
  }
}

export const languageResolver = new LanguageResolver();
