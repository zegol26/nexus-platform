import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import { parse } from "dotenv";

loadEnvFallback(".env.production.local");
loadEnvFallback(".env");

const databaseReachable = await canReachDatabase(process.env.DATABASE_URL);

if (databaseReachable) {
  run("npx", ["prisma", "migrate", "deploy"]);
} else {
  console.warn("Skipping prisma migrate deploy because DATABASE_URL is empty, invalid, or unreachable.");
}

run("npx", ["prisma", "generate"]);

const shouldSeedOnBuild =
  process.env.RUN_SEED_ON_BUILD === "true" ||
  (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production");

if (databaseReachable && shouldSeedOnBuild) {
  run("npx", ["prisma", "db", "seed"]);
} else if (databaseReachable) {
  console.warn(
    "Skipping prisma db seed during production build. Set RUN_SEED_ON_BUILD=true to run seed intentionally."
  );
} else {
  console.warn("Skipping prisma db seed because the database is not reachable.");
}

run("npx", ["next", "build"]);

function loadEnvFallback(filePath) {
  if (!existsSync(filePath)) return;

  const values = parse(readFileSync(filePath));
  for (const [key, value] of Object.entries(values)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function canReachDatabase(connectionString) {
  return new Promise((resolve) => {
    if (!connectionString) {
      resolve(false);
      return;
    }

    let parsed;
    try {
      parsed = new URL(connectionString);
    } catch {
      resolve(false);
      return;
    }

    const socket = net.createConnection({
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      timeout: 1500,
    });

    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}
