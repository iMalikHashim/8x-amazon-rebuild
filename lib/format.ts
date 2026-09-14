export function formatPrice(value: number): { dollars: string; cents: string } {
  const [dollars, cents] = value.toFixed(2).split(".");
  return { dollars, cents };
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function discountPercent(price: number, listPrice?: number): number | null {
  if (!listPrice || listPrice <= price) return null;
  return Math.round(((listPrice - price) / listPrice) * 100);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
