import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { agentforgePrisma } from "@/lib/agentforgePrisma";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "agentforge_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, encoded] = stored.split(":");
  if (!salt || !encoded) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(encoded, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function currentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await agentforgePrisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}
