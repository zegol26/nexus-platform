/**
 * Lightweight multilingual keyword extraction for AI Tutor chat
 * analytics. Splits Indonesian / Japanese / English text on whitespace
 * and punctuation, then for Japanese strings (no spaces) walks the
 * text and splits by character class transition (kanji vs hiragana vs
 * katakana vs latin) so that a sentence like
 * `日本語を勉強します` becomes the tokens `日本語`, `を`, `勉強`, `します`.
 *
 * No external dependency on a morphological analyser like kuromoji —
 * this is intentionally a v1 keyword counter sized for an admin panel,
 * not a search engine. It's good enough to surface "what topics are
 * learners asking the tutor about?" within minutes.
 */

const STOPWORDS = new Set<string>([
  // Indonesian
  "yang", "dan", "di", "ke", "dari", "untuk", "pada", "dengan", "ini",
  "itu", "saya", "kamu", "anda", "kita", "kami", "mereka", "dia",
  "tidak", "bukan", "atau", "juga", "akan", "sudah", "belum", "bisa",
  "ada", "tapi", "tetapi", "kalau", "jika", "ketika", "saat", "agar",
  "supaya", "karena", "sebab", "oleh", "telah", "lebih", "kurang",
  "sangat", "paling", "harus", "perlu", "mau", "ingin", "boleh",
  "apakah", "apa", "siapa", "kapan", "dimana", "mengapa", "bagaimana",
  "kah", "lah", "dong", "sih", "kok", "deh", "ya", "yaa", "yah",
  "nya", "saja", "hanya", "cuma", "pun", "se", "ter", "di",
  // Japanese particles & filler
  "は", "が", "を", "に", "で", "へ", "と", "も", "の", "や", "か",
  "ね", "よ", "な", "から", "まで", "より", "けど", "けれど", "けれども",
  "ても", "でも", "なら", "ば", "たら", "って", "という",
  "です", "ます", "した", "して", "する", "した", "ある", "いる",
  "ない", "なる", "なった", "だ", "だった", "だから", "そして",
  "この", "その", "あの", "どの", "ここ", "そこ", "あそこ", "どこ",
  "これ", "それ", "あれ", "どれ", "そう", "こう", "ああ", "どう",
  "ね", "よ", "な", "わ", "ぞ", "ぜ", "なあ", "なの",
  // English
  "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on",
  "at", "by", "for", "with", "as", "is", "are", "was", "were", "be",
  "been", "being", "do", "does", "did", "have", "has", "had", "this",
  "that", "these", "those", "i", "you", "he", "she", "it", "we",
  "they", "me", "him", "her", "us", "them", "my", "your", "his",
  "its", "our", "their", "mine", "yours", "hers", "ours", "theirs",
  "what", "which", "who", "whom", "whose", "when", "where", "why",
  "how", "not", "no", "yes", "so", "very", "more", "less", "much",
  "many", "few", "some", "any", "all", "can", "could", "may", "might",
  "must", "shall", "should", "will", "would", "let", "lets",
  // Common chat noise
  "halo", "hai", "hi", "hello", "tolong", "mohon", "minta", "coba",
  "ok", "oke", "okay", "thanks", "makasih", "terima", "kasih",
]);

const HIRAGANA = /^[぀-ゟ]+$/;
const KATAKANA = /^[゠-ヿ]+$/;
const KANJI = /^[一-鿿]+$/;
const LATIN = /^[a-zA-Z]+$/;

function classOf(ch: string): "kanji" | "hiragana" | "katakana" | "latin" | "other" {
  const code = ch.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) return "kanji";
  if (code >= 0x3040 && code <= 0x309f) return "hiragana";
  if (code >= 0x30a0 && code <= 0x30ff) return "katakana";
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) return "latin";
  return "other";
}

function splitByJapaneseClass(token: string): string[] {
  if (!token) return [];
  const parts: string[] = [];
  let buffer = "";
  let bufferClass: ReturnType<typeof classOf> | null = null;

  for (const ch of token) {
    const cls = classOf(ch);
    if (cls === "other") {
      if (buffer) parts.push(buffer);
      buffer = "";
      bufferClass = null;
      continue;
    }
    if (bufferClass === null || bufferClass === cls) {
      buffer += ch;
      bufferClass = cls;
    } else {
      parts.push(buffer);
      buffer = ch;
      bufferClass = cls;
    }
  }
  if (buffer) parts.push(buffer);
  return parts;
}

export function tokenize(text: string): string[] {
  if (!text) return [];
  // First split on whitespace + common punctuation.
  const rough = text
    .toLowerCase()
    .split(/[\s.,;:!?。、！？「」『』（）()【】\[\]"'`<>/\\|*&^%$#@~+=_-]+/u)
    .filter(Boolean);

  const tokens: string[] = [];
  for (const piece of rough) {
    // Pure latin — keep as-is.
    if (LATIN.test(piece)) {
      tokens.push(piece);
      continue;
    }
    // Pure hiragana / katakana / kanji block — keep whole.
    if (HIRAGANA.test(piece) || KATAKANA.test(piece) || KANJI.test(piece)) {
      tokens.push(piece);
      continue;
    }
    // Mixed — split by character class transition.
    tokens.push(...splitByJapaneseClass(piece));
  }
  return tokens.filter(Boolean);
}

export type KeywordCount = {
  keyword: string;
  count: number;
  /** True if the token contains Japanese characters; useful to render
   *  with a Japanese font on the admin panel. */
  isJapanese: boolean;
};

export function extractKeywords(
  texts: string[],
  options: { topN?: number; minLength?: number } = {}
): KeywordCount[] {
  const topN = options.topN ?? 30;
  const minLength = options.minLength ?? 2;

  const counts = new Map<string, number>();

  for (const text of texts) {
    if (!text) continue;
    const tokens = tokenize(text);
    for (const token of tokens) {
      if (token.length < minLength) continue;
      // Drop pure-numeric tokens.
      if (/^\d+$/.test(token)) continue;
      if (STOPWORDS.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([keyword, count]) => ({
      keyword,
      count,
      isJapanese:
        HIRAGANA.test(keyword) ||
        KATAKANA.test(keyword) ||
        KANJI.test(keyword) ||
        /[぀-ヿ一-鿿]/.test(keyword),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
