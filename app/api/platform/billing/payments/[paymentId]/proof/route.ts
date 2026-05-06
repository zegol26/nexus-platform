import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const supportedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export async function POST(
  request: Request,
  context: { params: Promise<{ paymentId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentId } = await context.params;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const payment = await prisma.paymentTransaction.findUnique({
    where: { id: paymentId },
  });

  if (!payment || payment.userId !== user.id) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("proof");
  const note = String(formData.get("note") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Payment proof file is required." }, { status: 400 });
  }

  if (!supportedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: "Use JPG, PNG, WEBP, or PDF proof." }, { status: 400 });
  }

  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "Payment proof is too large. Maximum size is 6MB." }, { status: 400 });
  }

  const extension = file.name.split(".").pop() || "bin";
  const safeName = `${payment.id}-${Date.now()}.${extension.replace(/[^a-z0-9]/gi, "")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "payment-proofs");
  const uploadPath = path.join(uploadDir, safeName);
  const publicUrl = `/uploads/payment-proofs/${safeName}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

  const proof = await prisma.paymentProof.upsert({
    where: { paymentId: payment.id },
    update: {
      fileUrl: publicUrl,
      fileName: file.name,
      fileMimeType: file.type,
      note,
      status: "WAITING_VERIFICATION",
      reviewedBy: null,
      reviewedAt: null,
    },
    create: {
      paymentId: payment.id,
      userId: user.id,
      fileUrl: publicUrl,
      fileName: file.name,
      fileMimeType: file.type,
      note,
      status: "WAITING_VERIFICATION",
    },
  });

  await prisma.paymentTransaction.update({
    where: { id: payment.id },
    data: { status: "WAITING_VERIFICATION" },
  });

  return NextResponse.json({ proof });
}
