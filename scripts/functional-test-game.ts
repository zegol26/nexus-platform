/**
 * Functional regression test for the Nexus Kingdom game module.
 * Runs end-to-end against the configured DATABASE_URL using the same
 * `getOrCreateGameKingdom` service path the API route uses.
 *
 * Usage: npx tsx scripts/functional-test-game.ts
 */
import "dotenv/config";
import { prisma } from "@/lib/db/prisma";
import {
  getOrCreateGameKingdom,
  decorateKingdom,
} from "@/lib/game/service";

type TestResult = { name: string; ok: boolean; detail?: string };
const results: TestResult[] = [];

function record(name: string, ok: boolean, detail?: string) {
  results.push({ name, ok, detail });
  const tag = ok ? "ok" : "FAIL";
  console.log(`${tag} - ${name}${detail ? ` :: ${detail}` : ""}`);
}

async function main() {
  // 1. Prisma client knows about every game model exposed by schema.
  const expectedDelegates = [
    "gameKingdom",
    "gameResourceLedger",
    "gameArmyUnit",
    "gameBattleLog",
    "gameUserCard",
    "gameLearningRewardDailyCounter",
  ];
  for (const key of expectedDelegates) {
    const ok =
      Boolean((prisma as unknown as Record<string, unknown>)[key]) &&
      typeof (
        (prisma as unknown as Record<string, { findFirst?: unknown }>)[key]
          ?.findFirst
      ) === "function";
    record(`prisma client exposes ${key}`, ok);
  }

  // 2. Underlying tables exist in the connected database.
  for (const table of [
    "GameKingdom",
    "GameResourceLedger",
    "GameArmyUnit",
    "GameBattleLog",
    "GameUserCard",
    "GameLearningRewardDailyCounter",
  ]) {
    try {
      const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT count(*)::bigint AS count FROM "${table}"`
      );
      const count = Number(rows[0]?.count ?? 0);
      record(`table ${table} exists`, true, `rows=${count}`);
    } catch (error) {
      record(
        `table ${table} exists`,
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // 3. Locate a real user to exercise the create-or-fetch path.
  const user =
    (await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true },
    })) ??
    (await prisma.user.findFirst({
      select: { id: true, email: true },
    }));

  if (!user) {
    record("seed user available", false, "no users in database");
    return;
  }
  record("seed user available", true, user.email);

  // 4. getOrCreateGameKingdom returns a kingdom (creates if missing).
  let kingdomId: string | null = null;
  try {
    const kingdom = await getOrCreateGameKingdom(user.id);
    kingdomId = kingdom.id;
    record(
      "getOrCreateGameKingdom returns kingdom",
      Boolean(kingdom?.id),
      `id=${kingdom?.id} name=${kingdom?.name} continent=${kingdom?.continent}`
    );
    record(
      "kingdom decorated with hero/army/cards/resources",
      Boolean(
        kingdom?.hero &&
          Array.isArray(kingdom?.armyUnits) &&
          Array.isArray(kingdom?.cards) &&
          kingdom?.resources
      ),
      `hero=${Boolean(kingdom?.hero)} army=${kingdom?.armyUnits?.length} cards=${kingdom?.cards?.length}`
    );
  } catch (error) {
    record(
      "getOrCreateGameKingdom returns kingdom",
      false,
      error instanceof Error ? error.message : String(error)
    );
  }

  // 5. Calling again is idempotent — same kingdom row is returned.
  if (kingdomId) {
    try {
      const second = await getOrCreateGameKingdom(user.id);
      record(
        "getOrCreateGameKingdom is idempotent",
        second.id === kingdomId,
        `first=${kingdomId} second=${second.id}`
      );
    } catch (error) {
      record(
        "getOrCreateGameKingdom is idempotent",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // 6. Decorator on a manually-fetched record matches the service output shape.
  if (kingdomId) {
    try {
      const raw = await prisma.gameKingdom.findUnique({
        where: { id: kingdomId },
        include: { armyUnits: true, cards: true },
      });
      const decorated = raw ? decorateKingdom(raw) : null;
      record(
        "decorateKingdom hides server-only weapon multipliers",
        Boolean(
          decorated &&
            !("attackWeaponMultiplier" in decorated) &&
            !("defenseWeaponMultiplier" in decorated)
        ),
        decorated ? Object.keys(decorated).slice(0, 8).join(",") : "no decorated"
      );
    } catch (error) {
      record(
        "decorateKingdom hides server-only weapon multipliers",
        false,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    const failed = results.filter((r) => !r.ok);
    console.log(
      `\n${results.length - failed.length}/${results.length} passed`
    );
    if (failed.length) {
      console.log("\nFAILURES:");
      for (const f of failed) console.log(`  - ${f.name}: ${f.detail ?? ""}`);
      process.exit(1);
    }
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Test runner crashed:", error);
    await prisma.$disconnect();
    process.exit(2);
  });
