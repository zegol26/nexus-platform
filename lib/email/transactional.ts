import nodemailer from "nodemailer";

type RegistrationEmailInput = {
  email: string;
  name?: string | null;
};

function smtpConfigReady() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function getTransporter() {
  if (!smtpConfigReady()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function sendRegistrationConfirmationEmail({ email, name }: RegistrationEmailInput) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn("REGISTRATION_EMAIL_SKIPPED", "SMTP env is not configured");
    return { sent: false, skipped: true };
  }

  const displayName = name?.trim() || email.split("@")[0];
  const academyName = "Nexus Talenta Indonesia Academy";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const fromAddress = process.env.EMAIL_FROM ?? "info@nexustalenta.com";
  const replyTo = process.env.EMAIL_REPLY_TO ?? "no-reply@nexustalenta.com";

  await transporter.sendMail({
    from: `"${academyName}" <${fromAddress}>`,
    to: email,
    replyTo,
    subject: "Registrasi Nexus Talenta Indonesia Academy berhasil",
    text: [
      `Halo ${displayName},`,
      "",
      `Registrasi akun ${academyName} kamu sudah berhasil.`,
      "Kamu sekarang bisa login ke platform, memilih program, dan mulai mengakses ruang belajar Nexus.",
      "",
      `Login: ${appUrl}/login`,
      "",
      "Email ini dikirim otomatis. Untuk bantuan, hubungi info@nexustalenta.com.",
      "",
      "Salam,",
      academyName,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;max-width:600px;margin:0 auto;padding:24px">
        <p style="font-size:14px;color:#2563eb;font-weight:700;margin:0 0 8px">${academyName}</p>
        <h1 style="font-size:24px;margin:0 0 16px">Registrasi berhasil</h1>
        <p>Halo <strong>${displayName}</strong>,</p>
        <p>Akun kamu sudah aktif. Kamu bisa login ke platform, memilih program, dan mulai mengakses ruang belajar Nexus.</p>
        <p style="margin:24px 0">
          <a href="${appUrl}/login" style="background:#2563eb;color:white;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;display:inline-block">Login ke Platform</a>
        </p>
        <p style="font-size:13px;color:#475569">Email ini dikirim otomatis. Untuk bantuan, hubungi <a href="mailto:info@nexustalenta.com">info@nexustalenta.com</a>.</p>
      </div>
    `,
  });

  return { sent: true, skipped: false };
}
