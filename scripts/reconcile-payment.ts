import "dotenv/config";
import { prisma } from "@/lib/db/prisma";
import { activatePaidAccessForPayment } from "@/lib/platform/activate-subscription";
import { getMidtransBaseUrl, getMidtransServerKey } from "@/lib/platform/midtrans";

type MidtransStatusResponse = {
  order_id?: string;
  transaction_status?: string;
  fraud_status?: string;
  gross_amount?: string;
  payment_type?: string;
  settlement_time?: string;
  transaction_time?: string;
};

function readArg(name: string) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

function parseMidtransTime(value?: string | null) {
  if (!value) return new Date();
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}+07:00`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function getProviderStatus(orderId: string) {
  const requestedMode = readArg("--mode");
  const mode =
    requestedMode === "sandbox"
      ? "sandbox"
      : requestedMode === "production" || process.env.VERCEL_ENV === "production"
        ? "production"
        : "sandbox";
  const serverKey = getMidtransServerKey(mode);
  if (!serverKey) {
    throw new Error(`Midtrans ${mode} server key is not configured.`);
  }

  const response = await fetch(`${getMidtransBaseUrl(mode).replace("app.", "api.")}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
      Accept: "application/json",
    },
  });

  const payload = (await response.json().catch(() => null)) as MidtransStatusResponse | null;
  if (!response.ok || !payload) {
    throw new Error(`Midtrans status lookup failed with HTTP ${response.status}.`);
  }

  return payload;
}

async function main() {
  const orderId = readArg("--order-id");
  const apply = process.argv.includes("--apply");
  const dryRun = process.argv.includes("--dry-run") || !apply;

  if (!orderId) {
    throw new Error("Usage: npm run reconcile-payment -- --order-id <order-id> --dry-run|--apply");
  }

  const payment = await prisma.paymentTransaction.findUnique({
    where: {
      provider_providerRef: {
        provider: "MIDTRANS",
        providerRef: orderId,
      },
    },
    include: {
      user: { select: { id: true, email: true } },
      app: { select: { id: true, slug: true, name: true } },
      plan: { select: { id: true, code: true, name: true } },
    },
  });

  if (!payment) {
    throw new Error(`No local payment found for order ${orderId}.`);
  }

  const provider = await getProviderStatus(orderId);
  const localAmount = Math.round(payment.amountCents / 100);
  const providerAmount = Math.round(Number(provider.gross_amount ?? "0"));
  const providerSettled = provider.transaction_status === "settlement";

  const existingAccess = await prisma.appUserAccess.findUnique({
    where: {
      userId_appId: {
        userId: payment.userId,
        appId: payment.appId,
      },
    },
    select: {
      id: true,
      status: true,
      accessExpiresAt: true,
      sourcePaymentId: true,
    },
  });

  const summary = {
    orderId,
    dryRun,
    localPayment: {
      id: payment.id,
      status: payment.status,
      paidAt: payment.paidAt,
      amountCents: payment.amountCents,
      currency: payment.currency,
      userId: payment.userId,
      userEmail: maskEmail(payment.user.email),
      appSlug: payment.app.slug,
      appName: payment.app.name,
      planCode: payment.plan?.code ?? null,
    },
    provider: {
      transaction_status: provider.transaction_status,
      fraud_status: provider.fraud_status ?? null,
      gross_amount: provider.gross_amount ?? null,
      payment_type: provider.payment_type ?? null,
      settlement_time: provider.settlement_time ?? null,
    },
    checks: {
      providerSettled,
      amountMatches: localAmount === providerAmount,
      appIsNihongo: payment.app.slug === "nihongo",
    },
    existingAccess,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!providerSettled) {
    throw new Error("Provider status is not settlement; refusing to reconcile.");
  }
  if (localAmount !== providerAmount) {
    throw new Error("Provider amount does not match local payment amount; refusing to reconcile.");
  }
  if (payment.app.slug !== "nihongo") {
    throw new Error("Payment is not mapped to Nexus AI Nihongo; refusing to reconcile.");
  }

  if (dryRun) {
    console.log("Dry run only. Re-run with --apply to mutate local payment/access state.");
    return;
  }

  const paidAt = parseMidtransTime(provider.settlement_time ?? provider.transaction_time);

  await prisma.$transaction(async (tx) => {
    await tx.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        paidAt,
        rawPayload: JSON.stringify({
          reconciledAt: new Date().toISOString(),
          providerStatus: provider,
        }),
      },
    });

    await activatePaidAccessForPayment(tx, payment.id);
  });

  const finalAccess = await prisma.appUserAccess.findUnique({
    where: {
      userId_appId: {
        userId: payment.userId,
        appId: payment.appId,
      },
    },
    select: {
      id: true,
      status: true,
      accessExpiresAt: true,
      sourcePaymentId: true,
    },
  });

  console.log(JSON.stringify({ reconciled: true, finalAccess }, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
