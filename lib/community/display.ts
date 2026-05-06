export function getOnigiriBadge(total: number, role?: string | null) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "🍜";
  if (total > 1000) return "🍜";
  if (total >= 1000) return "🍙🍙🍙🍙🍙";
  if (total >= 500) return "🍙🍙🍙🍙";
  if (total >= 100) return "🍙🍙🍙";
  if (total >= 50) return "🍙🍙";
  if (total >= 10) return "🍙";
  return "";
}

export function getLearningBadgeLabel(profile?: { flashcardCorrectCount?: number | null } | null) {
  if ((profile?.flashcardCorrectCount ?? 0) >= 25) return "Flashcard Spark";
  return "Learner Baru";
}
