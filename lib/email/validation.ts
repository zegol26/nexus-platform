const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(value: string) {
  if (!value || value.length > 254) return false;
  if (!emailPattern.test(value)) return false;

  const [localPart, domain] = value.split("@");
  if (!localPart || !domain || localPart.length > 64) return false;
  if (domain.includes("..")) return false;

  return domain
    .split(".")
    .every((part) => part.length > 0 && /^[a-z0-9-]+$/i.test(part) && !part.startsWith("-") && !part.endsWith("-"));
}
