import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { generateProject } from "@/services/projectGenerator";
import { prepareProjectPreview } from "@/services/previewService";
import { buildProjectTemplates } from "@/services/templateManager";
import type { DetectedArchitecture } from "@/services/architectureAnalyzer";
import type { ProjectArtifact } from "@/types/projectArtifact";

const slugify = (value: string): string => {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "generated";
};

const getOutputDirectory = (projectName: string): string => {
  return path.join(process.cwd(), "GeneratedProjects", slugify(projectName));
};

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as {
    projectName?: string;
    description?: string;
    architecture?: string;
    tasks?: string[];
    artifacts?: ProjectArtifact[];
    agentOutputs?: Array<{
      role: string;
      phase: string;
      content: string;
      files?: Array<{ path: string; content: string; language: string }>;
    }>;
    framework?: string;
    techStack?: string[];
    parsedResponse?: {
      type?: string;
      content?: unknown;
      summary?: string;
      files?: Array<{ path: string; content: string; language: string }>;
    };
    deploy?: boolean;
    architectureModel?: DetectedArchitecture;
  };

  const projectName = body.projectName?.trim() || "agentforge-generated-app";
  const outputDirectory = getOutputDirectory(projectName);
  // The core artifact set is always complete.  Provider responses are advisory
  // until they are parsed into explicit file artifacts by their owning agent;
  // they must never replace package metadata with a scaffold.
  const engineArtifacts: ProjectArtifact[] = buildProjectTemplates(projectName, body.architectureModel).map((file) => ({
    type: file.relativePath.endsWith("route.ts") ? "route" : file.relativePath.endsWith(".prisma") ? "database-schema" : "configuration",
    name: file.relativePath.split("/").at(-1) ?? file.relativePath,
    relativePath: file.relativePath,
    language: file.relativePath.endsWith(".tsx") ? "tsx" : file.relativePath.endsWith(".ts") ? "ts" : "text",
    content: file.content,
    generatedBy: "AgentForge pipeline",
    dependencies: [],
    description: `Generated working artifact: ${file.relativePath}`,
  }));
  const result = await generateProject({
    projectName,
    outputDirectory,
    extraFiles: [],
    architecture: body.architectureModel,
  });

  let preview: Awaited<ReturnType<typeof prepareProjectPreview>> = {
    previewUrl: "",
    previewManifest: {
      previewUrl: "",
      pages: [],
      generatedAt: new Date().toISOString(),
      status: "failed",
    },
    installedDependencies: false,
    serverStarted: false,
    previewStatus: "failed",
    errorMessage: "Preview service unavailable.",
    logs: [],
    installLogs: [],
    runtimeLogs: [],
  };

  try {
    if (body.deploy) {
      preview = await prepareProjectPreview(outputDirectory, engineArtifacts);
    } else {
      preview.previewStatus = "pending";
      preview.previewManifest.status = "pending";
      preview.errorMessage = undefined;
    }
  } catch (error) {
    preview.errorMessage = error instanceof Error ? error.message : "Preview service unavailable.";
    preview.logs = [preview.errorMessage];
    preview.installLogs = [preview.errorMessage];
    preview.runtimeLogs = [preview.errorMessage];
  }

  return NextResponse.json({
    ok: true,
    ...result,
    artifacts: engineArtifacts,
    previewUrl: preview.previewUrl,
    previewManifest: preview.previewManifest,
    preview,
  });
}
