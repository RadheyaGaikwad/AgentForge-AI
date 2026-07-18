import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { agentforgePrisma } from "@/lib/agentforgePrisma";
import { hashPassword, SESSION_COOKIE, verifyPassword } from "@/lib/auth";

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return Response.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  let user = await agentforgePrisma.user.findUnique({ where: { email } });
  if (!user) user = await agentforgePrisma.user.create({ data: { email, passwordHash: await hashPassword(password) } });
  else if (!await verifyPassword(password, user.passwordHash)) return Response.json({ error: "Incorrect email or password." }, { status: 401 });
  const token = randomBytes(32).toString("hex");
  await agentforgePrisma.session.create({ data: { token, userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) } });
  const response = NextResponse.json({ user: { id: user.id, email: user.email } });
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
