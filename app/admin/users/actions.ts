"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/prisma";

export async function setTeachingRole(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Admin access required.");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || !["USER", "TEACHER"].includes(role)) throw new Error("Invalid teaching role update.");
  if (userId === admin.id) throw new Error("You cannot change your own admin role here.");
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!target || !["USER", "TEACHER"].includes(target.role)) throw new Error("Only learner and teacher accounts can be changed here.");
  await prisma.user.update({ where: { id: userId }, data: { role: role as "USER" | "TEACHER" } });
  revalidatePath("/admin/users");
}
