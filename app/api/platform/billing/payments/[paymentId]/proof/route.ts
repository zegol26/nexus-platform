import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const supportedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_FILE_BYTES = 6 * 1024 * 1024;

export async function POST(
  request: Request,
  context: { params: Promise<{ paymentId: string }> }
) {
  try {
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
      return NextResponse.json(
        { error: "Payment proof file is required." },
        { status: 400 }
      );
    }

    if (!supportedMimeTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Use JPG, PNG, WEBP, or PDF proof." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Payment proof is too large. Maximum size is 6MB." },
        { status: 400 }
      );
    }

    // Encode the proof as a base64 data URL stored directly in the
    // PaymentProof row. Vercel Functions don't have a writable
    // filesystem outside /tmp, so the previous `public/uploads/...`
    // write would silently fail and the client request would hang
    // waiting for a response body that never arrived.
    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;

    const proof = await prisma.paymentProof.upsert({
      where: { paymentId: payment.id },
      update: {
        fileUrl: dataUrl,
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
        fileUrl: dataUrl,
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
  } catch (error) {
    console.error("[billing/proof] upload failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Upload gagal: ${error.message}`
            : "Upload gagal.",
      },
      { status: 500 }
    );
  }
}
