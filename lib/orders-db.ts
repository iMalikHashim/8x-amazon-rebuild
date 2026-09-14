import type { Category, Order, ProductIconKey } from "@/lib/types";

interface OrderRowWithItems {
  id: string;
  placedAt: Date;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  addressFullName: string;
  addressLine1: string;
  addressLine2: string | null;
  addressCity: string;
  addressState: string;
  addressZip: string;
  cardLast4: string;
  estimatedDelivery: string;
  items: {
    productId: string;
    slug: string;
    title: string;
    price: number;
    icon: string;
    category: string;
    photos: string[] | null;
    quantity: number;
  }[];
}

export function toClientOrder(row: OrderRowWithItems, userEmail: string): Order {
  return {
    id: row.id,
    userEmail,
    placedAt: row.placedAt.toISOString(),
    items: row.items.map((i) => ({
      productId: i.productId,
      slug: i.slug,
      title: i.title,
      price: i.price,
      icon: i.icon as ProductIconKey,
      category: i.category as Category,
      photos: i.photos ?? undefined,
      quantity: i.quantity,
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    tax: row.tax,
    total: row.total,
    address: {
      fullName: row.addressFullName,
      line1: row.addressLine1,
      line2: row.addressLine2 ?? undefined,
      city: row.addressCity,
      state: row.addressState,
      zip: row.addressZip,
    },
    cardLast4: row.cardLast4,
    estimatedDelivery: row.estimatedDelivery,
  };
}
