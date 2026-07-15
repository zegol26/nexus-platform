export const STORYARC_JOHN_DAILY_LIMIT = 5;

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function storyArcJohnDayWindow(now = new Date()) {
  const wib = new Date(now.getTime() + WIB_OFFSET_MS);
  const periodStart = new Date(
    Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()) - WIB_OFFSET_MS
  );
  return { periodStart, periodEnd: new Date(periodStart.getTime() + DAY_MS) };
}
