import { NextResponse } from "next/server";
import { agentforgePrisma } from "@/lib/agentforgePrisma";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request): Promise<Response> {
  const token = request.headers.get("cookie")?.match(/agentforge_session=([^;]+)/)?.[1];
  if (token) await agentforgePrisma.session.delete({ where: { token } }).catch(() => undefined);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
