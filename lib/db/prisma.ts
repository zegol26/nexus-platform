import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

/**
 * Lazy Prisma client.
 *
 * The previous implementation threw `Error: DATABASE_URL is not set`
 * inside the module body. That triggered every time a route handler
 * importing this file was evaluated — including Next.js' build-time
 * "Collecting page data" phase, which evaluates each route's bundled
 * chunk in a worker that does not always inherit the project env.
 * One missing env var at the wrong moment broke the entire deploy.
 *
 * The Proxy below defers `new Pool()` / `new PrismaClient()` until the
 * very first property access at request time. Page data collection
 * imports the module without touching `prisma.<delegate>` so the env
 * check never fires; the throw is preserved for legitimate runtime
 * use where DATABASE_URL is genuinely absent.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

function createClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool =
    globalForPrisma.prismaPool ??
    new Pool({
      connectionString,
    });
  attachDatabasePool(pool);

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaPool = pool;
  }

  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = globalForPrisma.prisma ?? createClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
