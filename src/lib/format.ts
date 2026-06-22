/** Format a whole-ruble price for display, e.g. 12990 → "12 990 ₽". */
export function formatPrice(rubles: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(rubles)} ₽`;
}
