import { randomUUID } from "crypto";
import { prisma } from "@/lib/db/prisma";

const SESSION_MAX_AGE_DAYS = 30;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export type SingleSessionUser = {
  id: string;
  role?: string | null;
};

export async function createSingleActiveSession(user: SingleSessionUser) {
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const sessionToken = randomUUID();
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isAdmin) {
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }

  await prisma.session.create({
    data: {
      userId: user.id,
      sessionToken,
      expires,
    },
  });

  return {
    sessionToken,
    expires,
  };
}

export async function isSingleSessionValid(sessionToken?: string | null) {
  if (!sessionToken) return false;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { expires: true },
  });

  if (!session) return false;

  if (session.expires <= new Date()) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
    return false;
  }

  return true;
}

export async function touchSingleSession(sessionToken?: string | null) {
  if (!sessionToken) return;

  await prisma.session.updateMany({
    where: { sessionToken },
    data: { expires: new Date(Date.now() + SESSION_MAX_AGE_MS) },
  });
}
