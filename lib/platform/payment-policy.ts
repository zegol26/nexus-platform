export type ManualPaymentStatus = "PENDING" | "WAITING_VERIFICATION" | "PAID" | "REJECTED" | "EXPIRED";
export type PaymentVerificationAction = "PAID" | "REJECTED";

export function normalizePaymentVerificationAction(action: unknown): PaymentVerificationAction {
  return String(action ?? "PAID") === "REJECTED" ? "REJECTED" : "PAID";
}

export function canActOnPayment(paymentStatus: string) {
  return paymentStatus !== "REJECTED";
}
