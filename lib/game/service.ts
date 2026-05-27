import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  attackWeapons,
  castleDefenseMultiplier,
  continents,
  conversions,
  deckCards,
  defenseWeapons,
  heroes,
  initialResources,
  learningRewards,
  unitCatalog,
  type GameResourceKey,
  type GameResources,
} from "@/lib/game/config";

type RewardType = keyof typeof learningRewards;
type ConversionKey = keyof typeof conversions;

export type BattleActionErrorCode =
  | "INVALID_TARGET"
  | "SHIELD_ACTIVE"
  | "COOLDOWN_ACTIVE";

export class BattleActionError extends Error {
  code: BattleActionErrorCode;
  meta?: Record<string, unknown>;
  constructor(code: BattleActionErrorCode, message: string, meta?: Record<string, unknown>) {
    super(message);
    this.name = "BattleActionError";
    this.code = code;
    this.meta = meta;
  }
}

export async function getOrCreateGameKingdom(userId: string) {
  const existing = await prisma.gameKingdom.findUnique({
    where: { userId },
    include: { armyUnits: true, cards: true },
  });
  if (existing) return decorateKingdom(existing);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (!user) throw new Error("User tidak ditemukan.");

  const continent = await assignContinent();
  const name = user.name?.trim() || `${user.email.split("@")[0]} Kingdom`;
  const initialHero = heroes[Math.floor(Math.random() * heroes.length)].key;

  try {
    const kingdom = await prisma.gameKingdom.create({
      data: {
        userId,
        name,
        continent,
        heroKey: initialHero,
        resourcesJson: initialResources as Prisma.InputJsonValue,
        armyUnits: {
          create: [
            { unitKey: "ASHIGARU_SCOUT", quantity: 3, defenseQuantity: 1 },
            { unitKey: "BAMBOO_ARCHER", quantity: 2, defenseQuantity: 1 },
          ],
        },
        cards: {
          create: [
            { cardKey: "KANA_FOCUS_CARD", quantity: 1 },
            { cardKey: "READING_SCOUT", quantity: 1 },
          ],
        },
      },
      include: { armyUnits: true, cards: true },
    });

    return decorateKingdom(kingdom);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const kingdom = await prisma.gameKingdom.findUnique({
        where: { userId },
        include: { armyUnits: true, cards: true },
      });
      if (kingdom) return decorateKingdom(kingdom);
    }
    throw error;
  }
}

export const CONTINENT_CAPACITY = 5;

export async function assignContinent() {
  const grouped = await prisma.gameKingdom.groupBy({
    by: ["continent"],
    _count: { continent: true },
  });
  const counts = new Map(grouped.map((item) => [item.continent, item._count.continent]));

  // First open seat in any base continent.
  for (const continent of continents) {
    if ((counts.get(continent) ?? 0) < CONTINENT_CAPACITY) return continent;
  }

  // All bases full — open a new variant ("II", "III", ...) per base.
  for (let variant = 2; variant < 1000; variant += 1) {
    for (const base of continents) {
      const variantName = `${base} ${toRoman(variant)}`;
      if ((counts.get(variantName) ?? 0) < CONTINENT_CAPACITY) return variantName;
    }
  }

  // Safety fallback (should not reach).
  return continents[0];
}

function toRoman(num: number) {
  const map: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let remaining = num;
  for (const [value, symbol] of map) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

export async function selectHero(userId: string, heroKey: string) {
  const hero = heroes.find((item) => item.key === heroKey);
  if (!hero) throw new Error("Hero tidak valid.");
  await getOrCreateGameKingdom(userId);
  return prisma.$transaction(async (tx) => {
    const kingdom = await ensureKingdomInTransaction(tx, userId);
    if (kingdom.heroSelectedAt) {
      throw new Error("Hero sudah pernah dipilih dan tidak bisa diubah.");
    }
    const updated = await tx.gameKingdom.update({
      where: { id: kingdom.id },
      data: {
        heroKey,
        heroSelectedAt: new Date(),
      },
      include: { armyUnits: true, cards: true },
    });
    return decorateKingdom(updated);
  });
}

export async function claimLearningReward({
  userId,
  rewardType,
  sourceRef,
  metadata,
}: {
  userId: string;
  rewardType: RewardType;
  sourceRef: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await getOrCreateGameKingdom(userId);
  const reward = learningRewards[rewardType];
  const sourceKey = `${rewardType}:${sourceRef}`;
  const today = new Date().toISOString().slice(0, 10);

  return prisma.$transaction(async (tx) => {
    const kingdom = await ensureKingdomInTransaction(tx, userId);
    const existing = await tx.gameResourceLedger.findUnique({
      where: { userId_sourceKey: { userId, sourceKey } },
      select: { id: true },
    });
    if (existing) return { claimed: false, reason: "Reward sudah pernah diklaim.", kingdom: decorateKingdom(kingdom) };

    if ("dailyKey" in reward) {
      const counter = await tx.gameLearningRewardDailyCounter.upsert({
        where: { userId_counterDate: { userId, counterDate: today } },
        update: {},
        create: { userId, counterDate: today },
      });
      const current = counter[reward.dailyKey];
      if (current >= reward.dailyLimit) {
        return { claimed: false, reason: "Daily reward cap sudah tercapai.", kingdom: decorateKingdom(kingdom) };
      }
      await tx.gameLearningRewardDailyCounter.update({
        where: { userId_counterDate: { userId, counterDate: today } },
        data: { [reward.dailyKey]: { increment: 1 } },
      });
    }

    const nextResources = addResources(parseResources(kingdom.resourcesJson), reward.resources);
    const nextXp = kingdom.xp + reward.xp;
    const updated = await tx.gameKingdom.update({
      where: { id: kingdom.id },
      data: {
        resourcesJson: nextResources as Prisma.InputJsonValue,
        xp: nextXp,
        level: Math.max(kingdom.level, Math.floor(nextXp / 250) + 1),
      },
      include: { armyUnits: true, cards: true },
    });

    await tx.gameResourceLedger.create({
      data: {
        userId,
        kingdomId: kingdom.id,
        sourceKey,
        sourceType: rewardType,
        resourcesJson: reward.resources as Prisma.InputJsonValue,
        xp: reward.xp,
        metadata,
      },
    });

    await maybeAwardCard(tx, updated.id, rewardType);
    return { claimed: true, reason: "Reward berhasil diklaim.", kingdom: decorateKingdom(updated) };
  });
}

export async function convertResource(userId: string, conversionKey: ConversionKey) {
  const conversion = conversions[conversionKey];
  if (!conversion) throw new Error("Konversi tidak valid.");
  await getOrCreateGameKingdom(userId);

  return prisma.$transaction(async (tx) => {
    const kingdom = await ensureKingdomInTransaction(tx, userId);
    const resources = parseResources(kingdom.resourcesJson);
    if (!hasResources(resources, conversion.from)) throw new Error("Resource belum cukup untuk konversi.");
    const updatedResources = addResources(subtractResources(resources, conversion.from), conversion.to);
    const updated = await tx.gameKingdom.update({
      where: { id: kingdom.id },
      data: { resourcesJson: updatedResources as Prisma.InputJsonValue },
      include: { armyUnits: true, cards: true },
    });
    return decorateKingdom(updated);
  });
}

export async function trainUnit(userId: string, unitKey: string, quantity: number) {
  const unit = unitCatalog.find((item) => item.key === unitKey);
  if (!unit) throw new Error("Unit tidak valid.");
  await getOrCreateGameKingdom(userId);
  const safeQuantity = Math.min(Math.max(Math.floor(quantity), 1), 50);
  const totalCost = multiplyResources(unit.cost, safeQuantity);

  return prisma.$transaction(async (tx) => {
    const kingdom = await ensureKingdomInTransaction(tx, userId);
    if (kingdom.castleLevel < unit.unlockCastleLevel) throw new Error("Castle level belum cukup untuk unit ini.");
    const resources = parseResources(kingdom.resourcesJson);
    if (!hasResources(resources, totalCost)) throw new Error("Resource belum cukup untuk training unit.");
    await tx.gameKingdom.update({
      where: { id: kingdom.id },
      data: { resourcesJson: subtractResources(resources, totalCost) as Prisma.InputJsonValue },
    });
    await tx.gameArmyUnit.upsert({
      where: { kingdomId_unitKey: { kingdomId: kingdom.id, unitKey } },
      update: { quantity: { increment: safeQuantity } },
      create: { kingdomId: kingdom.id, unitKey, quantity: safeQuantity },
    });
    return getOrCreateGameKingdom(userId);
  });
}

export async function upgradeCastle(userId: string) {
  await getOrCreateGameKingdom(userId);
  return prisma.$transaction(async (tx) => {
    const kingdom = await ensureKingdomInTransaction(tx, userId);
    if (kingdom.castleLevel >= 10) throw new Error("Castle sudah mencapai level maksimal.");
    const cost = castleUpgradeCost(kingdom.castleLevel);
    const resources = parseResources(kingdom.resourcesJson);
    if (!hasResources(resources, cost)) throw new Error("Resource belum cukup untuk upgrade castle.");
    const updated = await tx.gameKingdom.update({
      where: { id: kingdom.id },
      data: {
        castleLevel: { increment: 1 },
        resourcesJson: subtractResources(resources, cost) as Prisma.InputJsonValue,
      },
      include: { armyUnits: true, cards: true },
    });
    return decorateKingdom(updated);
  });
}

export async function getTargets(userId: string) {
  const kingdom = await getOrCreateGameKingdom(userId);
  const [recentAttackers, kingdoms] = await Promise.all([
    prisma.gameBattleLog.findMany({
      where: { defenderKingdomId: kingdom.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { attacker: { include: { armyUnits: true } } },
    }),
    prisma.gameKingdom.findMany({
      where: { userId: { not: userId } },
      orderBy: [{ continent: "asc" }, { castleLevel: "desc" }, { xp: "desc" }],
      take: 200,
      include: { armyUnits: true },
    }),
  ]);

  const seen = new Set<string>();
  return [...recentAttackers.map((log) => log.attacker), ...kingdoms]
    .filter((target) => {
      if (seen.has(target.id)) return false;
      seen.add(target.id);
      return true;
    })
    .map(decorateKingdom);
}

export async function attackKingdom(userId: string, targetKingdomId: string) {
  await getOrCreateGameKingdom(userId);
  return prisma.$transaction(async (tx) => {
    const attacker = await ensureKingdomInTransaction(tx, userId);
    const defender = await tx.gameKingdom.findUnique({
      where: { id: targetKingdomId },
      include: { armyUnits: true, cards: true },
    });
    if (!defender || defender.userId === userId) {
      throw new BattleActionError("INVALID_TARGET", "Target tidak valid.");
    }
    if (defender.shieldUntil && defender.shieldUntil.getTime() > Date.now()) {
      throw new BattleActionError("SHIELD_ACTIVE", "Target sedang dalam pertahanan shield.", {
        shieldUntil: defender.shieldUntil.toISOString(),
        defenderName: defender.name,
      });
    }
    const recent = await tx.gameBattleLog.findFirst({
      where: { attackerKingdomId: attacker.id, defenderKingdomId: defender.id, createdAt: { gt: new Date(Date.now() - 6 * 60 * 60 * 1000) } },
      select: { id: true, createdAt: true },
    });
    if (recent) {
      const cooldownEnds = new Date(recent.createdAt.getTime() + 6 * 60 * 60 * 1000);
      throw new BattleActionError("COOLDOWN_ACTIVE", "Cooldown 6 jam terhadap target ini masih aktif.", {
        cooldownEnds: cooldownEnds.toISOString(),
        defenderName: defender.name,
      });
    }

    const attackerPower = Math.round(powerFor(attacker, "attack"));
    const defenderPower = Math.max(1, Math.round(powerFor(defender, "defense")));
    const ratio = attackerPower / defenderPower;
    const stealPercent = stealPercentForRatio(ratio);
    const defenderResources = parseResources(defender.resourcesJson);
    const stolen = mapResources(defenderResources, (value) => Math.floor(value * stealPercent));
    const updatedDefenderResources = subtractResources(defenderResources, stolen);
    const updatedAttackerResources = addResources(parseResources(attacker.resourcesJson), stolen);
    const result = ratio < 0.75 ? "ATTACKER_LOSS" : ratio < 1 ? "MINOR_WIN" : ratio < 1.5 ? "NORMAL_WIN" : ratio < 2.2 ? "MAJOR_WIN" : "FULL_DAMAGE";
    const shieldHours = result === "MAJOR_WIN" || result === "FULL_DAMAGE" ? 8 : 2;

    const { attackerLossPercent, defenderLossPercent } = casualtyPercentsForRatio(ratio);
    const attackerCasualties = computeCasualties(attacker.armyUnits, attackerLossPercent);
    const defenderCasualties = computeCasualties(defender.armyUnits, defenderLossPercent);

    await tx.gameKingdom.update({ where: { id: attacker.id }, data: { resourcesJson: updatedAttackerResources as Prisma.InputJsonValue } });
    await tx.gameKingdom.update({
      where: { id: defender.id },
      data: {
        resourcesJson: updatedDefenderResources as Prisma.InputJsonValue,
        shieldUntil: new Date(Date.now() + shieldHours * 60 * 60 * 1000),
      },
    });

    for (const casualty of attackerCasualties) {
      if (casualty.lost <= 0) continue;
      await tx.gameArmyUnit.update({
        where: { kingdomId_unitKey: { kingdomId: attacker.id, unitKey: casualty.unitKey } },
        data: { quantity: { decrement: casualty.lost } },
      });
    }
    for (const casualty of defenderCasualties) {
      if (casualty.lost <= 0) continue;
      await tx.gameArmyUnit.update({
        where: { kingdomId_unitKey: { kingdomId: defender.id, unitKey: casualty.unitKey } },
        data: {
          quantity: { decrement: casualty.lost },
          defenseQuantity: { decrement: Math.min(casualty.lost, casualty.defenseLost) },
        },
      });
    }

    const log = await tx.gameBattleLog.create({
      data: {
        attackerKingdomId: attacker.id,
        defenderKingdomId: defender.id,
        continent: defender.continent,
        result,
        attackerPower,
        defenderPower,
        stolenResourcesJson: stolen as Prisma.InputJsonValue,
        casualtiesJson: {
          attackerLossPercent,
          defenderLossPercent,
          attackerTotalLost: sumLost(attackerCasualties),
          defenderTotalLost: sumLost(defenderCasualties),
        } as Prisma.InputJsonValue,
        attackerCasualtiesJson: attackerCasualties as Prisma.InputJsonValue,
        defenderCasualtiesJson: defenderCasualties as Prisma.InputJsonValue,
        snapshotJson: {
          ratio,
          stealPercent,
          attackWeapon: attacker.selectedAttackWeaponKey,
          defenseWeapon: defender.selectedDefenseWeaponKey,
          attackerName: attacker.name,
          defenderName: defender.name,
        },
      },
    });
    return {
      ...log,
      stolen,
      attackerCasualties,
      defenderCasualties,
    };
  });
}

function casualtyPercentsForRatio(ratio: number) {
  if (ratio < 0.5) return { attackerLossPercent: 0.45, defenderLossPercent: 0.05 };
  if (ratio < 0.75) return { attackerLossPercent: 0.32, defenderLossPercent: 0.08 };
  if (ratio < 1) return { attackerLossPercent: 0.22, defenderLossPercent: 0.14 };
  if (ratio < 1.5) return { attackerLossPercent: 0.14, defenderLossPercent: 0.24 };
  if (ratio < 2.2) return { attackerLossPercent: 0.09, defenderLossPercent: 0.36 };
  return { attackerLossPercent: 0.05, defenderLossPercent: 0.5 };
}

type CasualtyEntry = {
  unitKey: string;
  unitName: string;
  before: number;
  lost: number;
  after: number;
  defenseLost: number;
};

function computeCasualties(
  units: Array<{ unitKey: string; quantity: number; defenseQuantity: number }>,
  percent: number
): CasualtyEntry[] {
  return units.map((unit) => {
    const lost = Math.min(unit.quantity, Math.floor(unit.quantity * percent));
    const defenseLost = Math.min(unit.defenseQuantity, Math.floor(unit.defenseQuantity * percent));
    const catalog = unitCatalog.find((item) => item.key === unit.unitKey);
    return {
      unitKey: unit.unitKey,
      unitName: catalog?.name ?? unit.unitKey,
      before: unit.quantity,
      lost,
      after: unit.quantity - lost,
      defenseLost,
    };
  });
}

function sumLost(entries: CasualtyEntry[]) {
  return entries.reduce((total, entry) => total + entry.lost, 0);
}

export async function getLeaderboard() {
  const kingdoms = await prisma.gameKingdom.findMany({
    orderBy: [{ xp: "desc" }, { castleLevel: "desc" }],
    take: 20,
    include: { user: { select: { name: true, email: true } }, armyUnits: true, cards: true },
  });
  return kingdoms.map(decorateKingdom);
}

export async function getIncomingAttacks(userId: string) {
  const kingdom = await getOrCreateGameKingdom(userId);
  const logs = await prisma.gameBattleLog.findMany({
    where: { defenderKingdomId: kingdom.id, defenderSeenAt: null },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      attacker: { select: { id: true, name: true, continent: true, castleLevel: true } },
    },
  });
  return logs;
}

export async function acknowledgeIncomingAttacks(userId: string, battleIds?: string[]) {
  const kingdom = await getOrCreateGameKingdom(userId);
  const where: Prisma.GameBattleLogWhereInput = {
    defenderKingdomId: kingdom.id,
    defenderSeenAt: null,
  };
  if (battleIds && battleIds.length > 0) {
    where.id = { in: battleIds };
  }
  const result = await prisma.gameBattleLog.updateMany({
    where,
    data: { defenderSeenAt: new Date() },
  });
  return { acknowledged: result.count };
}

export async function getBattleLogs(userId: string) {
  const kingdom = await getOrCreateGameKingdom(userId);
  return prisma.gameBattleLog.findMany({
    where: { OR: [{ attackerKingdomId: kingdom.id }, { defenderKingdomId: kingdom.id }] },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { attacker: { select: { name: true } }, defender: { select: { name: true } } },
  });
}

export function decorateKingdom<T extends { resourcesJson: Prisma.JsonValue; armyUnits?: Array<{ unitKey: string; quantity: number; defenseQuantity: number }>; cards?: Array<{ cardKey: string; quantity: number; equipped: boolean }> }>(kingdom: T) {
  const army = kingdom.armyUnits ?? [];
  const attackPower = army.reduce((sum, unit) => sum + (unitCatalog.find((item) => item.key === unit.unitKey)?.attack ?? 0) * unit.quantity, 0);
  const defensePower = army.reduce((sum, unit) => sum + (unitCatalog.find((item) => item.key === unit.unitKey)?.defense ?? 0) * Math.max(unit.defenseQuantity, Math.floor(unit.quantity / 2)), 0);
  return {
    ...kingdom,
    resources: parseResources(kingdom.resourcesJson),
    attackPower,
    defensePower,
    hero: heroes.find((hero) => hero.key === ("heroKey" in kingdom ? kingdom.heroKey : "ARJUNA")) ?? heroes[0],
    attackWeapon: publicWeapon(attackWeapons.find((weapon) => weapon.key === ("selectedAttackWeaponKey" in kingdom ? kingdom.selectedAttackWeaponKey : "")) ?? attackWeapons[6]),
    defenseWeapon: publicWeapon(defenseWeapons.find((weapon) => weapon.key === ("selectedDefenseWeaponKey" in kingdom ? kingdom.selectedDefenseWeaponKey : "")) ?? defenseWeapons[6]),
  };
}

function publicWeapon<T extends { key: string; name: string; powerHint: string }>(weapon: T) {
  return { key: weapon.key, name: weapon.name, powerHint: weapon.powerHint };
}

function powerFor(kingdom: Awaited<ReturnType<typeof ensureKingdomInTransaction>>, type: "attack" | "defense") {
  const hero = heroes.find((item) => item.key === kingdom.heroKey) ?? heroes[0];
  const attackWeapon = attackWeapons.find((item) => item.key === kingdom.selectedAttackWeaponKey) ?? attackWeapons[0];
  const defenseWeapon = defenseWeapons.find((item) => item.key === kingdom.selectedDefenseWeaponKey) ?? defenseWeapons[0];
  const base = kingdom.armyUnits.reduce((sum, unit) => {
    const catalog = unitCatalog.find((item) => item.key === unit.unitKey);
    if (!catalog) return sum;
    return sum + (type === "attack" ? catalog.attack * unit.quantity : catalog.defense * Math.max(unit.defenseQuantity, Math.floor(unit.quantity / 2)));
  }, 0);
  const variance = 0.95; // Stored battle snapshot keeps result stable; MVP uses deterministic variance.
  return type === "attack"
    ? base * hero.attackBonus * attackWeapon.modifier * variance
    : base * hero.defenseBonus * defenseWeapon.modifier * castleDefenseMultiplier(kingdom.castleLevel) * variance;
}

async function ensureKingdomInTransaction(tx: Prisma.TransactionClient, userId: string) {
  const existing = await tx.gameKingdom.findUnique({ where: { userId }, include: { armyUnits: true, cards: true } });
  if (existing) return existing;
  throw new Error("Kingdom belum dibuat. Jalankan initialize lebih dulu.");
}

async function maybeAwardCard(tx: Prisma.TransactionClient, kingdomId: string, rewardType: RewardType) {
  const cardKey = rewardType.includes("MOCK") ? "MOCK_TEST_BANNER" : rewardType.includes("READING") ? "READING_SCOUT" : rewardType.includes("LESSON") ? "FOOD_CARAVAN" : null;
  if (!cardKey) return;
  await tx.gameUserCard.upsert({
    where: { kingdomId_cardKey: { kingdomId, cardKey } },
    update: { quantity: { increment: 1 } },
    create: { kingdomId, cardKey, quantity: 1 },
  });
}

export function castleUpgradeCost(level: number): Partial<GameResources> {
  return { wood: level * 80, food: level * 60, stone: level * 45, silver: level * 15, gold: Math.max(0, level - 4) * 5 };
}

function stealPercentForRatio(ratio: number) {
  if (ratio < 0.75) return 0.03;
  if (ratio < 1) return 0.1;
  if (ratio < 1.5) return 0.22;
  if (ratio < 2.2) return 0.35;
  return 0.5;
}

function parseResources(value: Prisma.JsonValue): GameResources {
  const data = typeof value === "object" && value ? value as Partial<Record<GameResourceKey, number>> : {};
  return {
    wood: Number(data.wood ?? 0),
    food: Number(data.food ?? 0),
    stone: Number(data.stone ?? 0),
    silver: Number(data.silver ?? 0),
    gold: Number(data.gold ?? 0),
  };
}

function addResources(a: GameResources, b: Partial<GameResources>): GameResources {
  return mapResources(a, (value, key) => value + Number(b[key] ?? 0));
}

function subtractResources(a: GameResources, b: Partial<GameResources>): GameResources {
  return mapResources(a, (value, key) => Math.max(0, value - Number(b[key] ?? 0)));
}

function multiplyResources(resources: Partial<GameResources>, quantity: number): Partial<GameResources> {
  return Object.fromEntries(Object.entries(resources).map(([key, value]) => [key, Number(value) * quantity])) as Partial<GameResources>;
}

function hasResources(resources: GameResources, cost: Partial<GameResources>) {
  return (Object.keys(cost) as GameResourceKey[]).every((key) => resources[key] >= Number(cost[key] ?? 0));
}

function mapResources(resources: GameResources, mapper: (value: number, key: GameResourceKey) => number): GameResources {
  return {
    wood: mapper(resources.wood, "wood"),
    food: mapper(resources.food, "food"),
    stone: mapper(resources.stone, "stone"),
    silver: mapper(resources.silver, "silver"),
    gold: mapper(resources.gold, "gold"),
  };
}

export { attackWeapons, continents, conversions, deckCards, defenseWeapons, heroes, learningRewards, unitCatalog };
