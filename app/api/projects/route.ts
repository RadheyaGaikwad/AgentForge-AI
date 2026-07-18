import path from "node:path";
import { currentUser } from "@/lib/auth";
import { agentforgePrisma } from "@/lib/agentforgePrisma";

export async function GET(): Promise<Response> {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const projects = await agentforgePrisma.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return Response.json(projects);
}

export async function POST(request: Request): Promise<Response> {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { name?: string; prompt?: string; projectType?: string };
  const name = body.name?.trim() || "Untitled Project";
  const prompt = body.prompt?.trim() || "";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "generated-project";
  const project = await agentforgePrisma.project.create({ data: { name, prompt, status: "Planning", outputFolder: path.join("GeneratedProjects", slug), userId: user.id } });
  return Response.json({ ...project, projectType: body.projectType ?? "Web Application" }, { status: 201 });
}
