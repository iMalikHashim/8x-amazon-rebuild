export const FREE_SHIPPING_THRESHOLD = 35;
export const FLAT_SHIPPING = 5.99;
export const TAX_RATE = 0.08;

export function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

export function computeTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function generateOrderId(): string {
  const rand = (digits: number) =>
    Math.floor(Math.random() * 10 ** digits)
      .toString()
      .padStart(digits, "0");
  return `${rand(3)}-${rand(7)}-${rand(7)}`;
}

export function formatDeliveryDate(daysFromNow: number): string {
  const date = new Date(Date.now() + daysFromNow * 86400000);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}
