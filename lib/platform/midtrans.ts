import crypto from "node:crypto";

export type MidtransMode = "sandbox" | "production";

type MidtransSnapRequest = {
  orderId: string;
  grossAmount: number;
  customer: {
    firstName?: string | null;
    email: string;
  };
  item: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  };
};

export function isMidtransEnabled(settingValue?: string | null) {
  return settingValue === "true";
}

export function getMidtransMode(settingValue?: string | null): MidtransMode {
  return settingValue === "production" ? "production" : "sandbox";
}

export function getMidtransRuntimeMode(_settingValue?: string | null): MidtransMode {
  if (process.env.VERCEL_ENV === "production") return "production";
  return "sandbox";
}

export function isMidtransCheckoutOpen(mode: MidtransMode, settingValue?: string | null) {
  return mode === "production" || isMidtransEnabled(settingValue);
}

export function isMidtransModeAvailable(mode: MidtransMode, settingValue?: string | null) {
  if (mode === "production") return getMidtransRuntimeMode() === "production";
  return isMidtransEnabled(settingValue);
}

export function resolveMidtransCheckoutMode(
  requestedMode: string | null | undefined,
  settingValue?: string | null
): MidtransMode | null {
  const mode = requestedMode === "sandbox" ? "sandbox" : getMidtransRuntimeMode();
  return isMidtransModeAvailable(mode, settingValue) ? mode : null;
}

export function getMidtransBaseUrl(mode: string) {
  return mode === "production"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

export function getMidtransApiBaseUrl(mode: string) {
  return mode === "production"
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
}

export function getMidtransServerKey(mode: string) {
  return mode === "production"
    ? process.env.MIDTRANS_PRODUCTION_SERVER_KEY
    : process.env.MIDTRANS_SANDBOX_SERVER_KEY;
}

export function getMidtransClientKey(mode: string) {
  return mode === "production"
    ? process.env.NEXT_PUBLIC_MIDTRANS_PRODUCTION_CLIENT_KEY
    : process.env.NEXT_PUBLIC_MIDTRANS_SANDBOX_CLIENT_KEY;
}

export function validateMidtransEnvironmentKeys(mode: string) {
  const serverKey = getMidtransServerKey(mode);
  const clientKey = getMidtransClientKey(mode);

  if (!serverKey) {
    return {
      ok: false,
      message: `MIDTRANS_${mode.toUpperCase()}_SERVER_KEY is not configured`,
    };
  }

  return { ok: true, message: null };
}

export async function createMidtransSnapTransaction(
  mode: string,
  request: MidtransSnapRequest
) {
  const validation = validateMidtransEnvironmentKeys(mode);
  if (!validation.ok) {
    throw new Error(validation.message ?? "Midtrans key is not configured");
  }

  const serverKey = getMidtransServerKey(mode);

  const response = await fetch(`${getMidtransBaseUrl(mode)}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: request.orderId,
        gross_amount: request.grossAmount,
      },
      customer_details: {
        first_name: request.customer.firstName ?? request.customer.email.split("@")[0],
        email: request.customer.email,
      },
      item_details: [
        {
          id: request.item.id,
          price: request.item.price,
          quantity: request.item.quantity,
          name: request.item.name.slice(0, 50),
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/payment/finish`,
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  } | null;

  if (!response.ok || !payload?.token || !payload.redirect_url) {
    const detail = payload?.error_messages?.join("; ") ?? `HTTP ${response.status}`;
    throw new Error(`Midtrans Snap failed: ${detail}`);
  }

  return payload;
}

export async function getMidtransTransactionStatus(mode: string, orderId: string) {
  const serverKey = getMidtransServerKey(mode);
  if (!serverKey) {
    throw new Error(`MIDTRANS_${mode.toUpperCase()}_SERVER_KEY is not configured`);
  }

  const response = await fetch(
    `${getMidtransApiBaseUrl(mode)}/v2/${encodeURIComponent(orderId)}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok || !payload) {
    throw new Error(`Midtrans status inquiry failed with HTTP ${response.status}`);
  }

  return payload;
}

export function verifyMidtransSignature({
  orderId,
  statusCode,
  grossAmount,
  signatureKey,
  serverKey,
}: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  serverKey: string;
}) {
  const digest = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");

  return digest === signatureKey;
}

export function mapMidtransStatus(transactionStatus: string, fraudStatus?: string) {
  if (transactionStatus === "settlement" || transactionStatus === "capture") {
    return fraudStatus === "challenge" ? "WAITING_VERIFICATION" : "PAID";
  }
  if (transactionStatus === "pending") return "PENDING";
  if (transactionStatus === "expire") return "EXPIRED";
  if (transactionStatus === "deny" || transactionStatus === "cancel") return "REJECTED";
  return "PENDING";
}
