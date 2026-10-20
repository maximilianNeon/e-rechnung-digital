/** Commercial rounding to 2 decimal places (EN 16931). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseMoneyInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace("€", "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function formatMoney(value: number, withCurrency = true): string {
  const formatted = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return withCurrency ? `${formatted} €` : formatted;
}

/** 12.00 or 12,00 → 12. Keeps real fractions. */
export function formatQuantity(raw: string): string {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) return raw.trim();
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 4 }).format(value);
}

export function formatDateDe(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/** YYYY-MM-DD → YYYYMMDD for CII */
export function toCiiDate(iso: string): string {
  return iso.replace(/-/g, "");
}
