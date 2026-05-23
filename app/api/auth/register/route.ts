import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { sendRegistrationConfirmationEmail } from "@/lib/email/transactional";
import { isValidEmail, normalizeEmail } from "@/lib/email/validation";
import { ensureNihongoTrial } from "@/lib/nexus/access-guards";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = normalizeEmail(body.email);
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Masukkan email yang valid" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await ensureNihongoTrial(user.id);

    const emailResult = await sendRegistrationConfirmationEmail({
      email: user.email,
      name: user.name,
    }).catch((error) => {
      console.error("REGISTRATION_EMAIL_ERROR", error);
      return { sent: false, skipped: false };
    });

    return NextResponse.json({
      message: emailResult.sent
        ? "Registrasi berhasil. Email konfirmasi sudah dikirim."
        : "Registrasi berhasil. Email konfirmasi belum terkirim karena konfigurasi email belum siap.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
