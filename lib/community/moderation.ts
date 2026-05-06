const blockedKeywords = [
  "porn",
  "porno",
  "sex",
  "bokep",
  "casino",
  "judol",
  "slot gacor",
  "phishing",
  "malware",
  "scam",
  "sara",
  "rasis",
  "anjing",
  "ba" + "ngsat",
  "tolol",
  "goblok",
  "jualan murah",
  "promo besar",
  "klik sekarang",
];

const blockedDomains = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "cutt.ly",
  "shorturl.at",
  "casino",
  "porn",
  "xxx",
  "bet",
  "slot",
  "phish",
  "malware",
];

const trustedInternalHosts = ["localhost", "127.0.0.1", "nexus-platform-ai.vercel.app"];

export function moderateCommunityMessage(input: string): {
  allowed: boolean;
  reason?: string;
  blockedTerms?: string[];
} {
  const normalized = input.toLowerCase();
  const blockedTerms = blockedKeywords.filter((term) => normalized.includes(term));
  const urls = extractUrls(input);

  const externalUrls = urls.filter((url) => !isInternalRoomLink(url));
  if (externalUrls.length >= 3) {
    blockedTerms.push("repeated link spam");
  }

  for (const url of externalUrls) {
    const hostname = safeHostname(url);
    if (!hostname) {
      blockedTerms.push(url);
      continue;
    }

    if (blockedDomains.some((domain) => hostname.includes(domain))) {
      blockedTerms.push(hostname);
    }
  }

  if (blockedTerms.length) {
    return {
      allowed: false,
      reason: "Pesan mengandung konten atau link yang tidak sesuai aturan komunitas.",
      blockedTerms: Array.from(new Set(blockedTerms)),
    };
  }

  return { allowed: true };
}

export function extractInternalLinkedRoomId(input: string) {
  for (const url of extractUrls(input)) {
    if (!isInternalRoomLink(url)) continue;
    const parsed = parseUrl(url);
    const roomId = parsed?.searchParams.get("room");
    if (roomId) return roomId;
  }

  return null;
}

function extractUrls(input: string) {
  return input.match(/https?:\/\/[^\s]+|\/platform\/community\?room=[\w-]+/gi) ?? [];
}

function isInternalRoomLink(url: string) {
  if (url.startsWith("/platform/community?room=")) return true;

  const parsed = parseUrl(url);
  if (!parsed) return false;

  return trustedInternalHosts.includes(parsed.hostname) && parsed.pathname === "/platform/community" && parsed.searchParams.has("room");
}

function safeHostname(url: string) {
  return parseUrl(url)?.hostname.toLowerCase() ?? null;
}

function parseUrl(url: string) {
  try {
    return new URL(url, "http://localhost:3000");
  } catch {
    return null;
  }
}
