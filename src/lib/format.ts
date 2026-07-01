/**
 * Format a whole-ruble price for display, e.g. 12990 → "12 990 ₽".
 * Products imported from 1C have no price yet (0) → shown as «Цена по запросу».
 */
export function formatPrice(rubles: number): string {
  if (!rubles) return "Цена по запросу";
  return `${new Intl.NumberFormat("ru-RU").format(rubles)} ₽`;
}
