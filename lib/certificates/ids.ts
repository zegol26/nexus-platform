import crypto from "node:crypto";
import { getCertificateProgram } from "@/lib/certificates/policy";

export function createCertificateId(appSlug: string, issuedAt = new Date()) {
  const program = getCertificateProgram(appSlug);
  const appCode = program?.appCode ?? appSlug.slice(0, 3).toUpperCase();
  const yyyy = issuedAt.getFullYear();
  const mm = String(issuedAt.getMonth() + 1).padStart(2, "0");
  const dd = String(issuedAt.getDate()).padStart(2, "0");
  const shortId = crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();

  return `NTIA-${appCode}-${yyyy}${mm}${dd}-${shortId}`;
}
