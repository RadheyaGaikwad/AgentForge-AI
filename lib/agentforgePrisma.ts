import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { agentforgePrisma?: PrismaClient };
export const agentforgePrisma = globalForPrisma.agentforgePrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.agentforgePrisma = agentforgePrisma;
