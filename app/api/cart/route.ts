import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [], saved: [] });

  const rows = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      savedForLater: cartItems.savedForLater,
      slug: products.slug,
      title: products.title,
      price: products.price,
      listPrice: products.listPrice,
      icon: products.icon,
      category: products.category,
      photos: products.photos,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, user.id));

  const toClient = (r: (typeof rows)[number]) => ({
    productId: r.productId,
    slug: r.slug,
    title: r.title,
    price: r.price,
    listPrice: r.listPrice ?? undefined,
    icon: r.icon,
    category: r.category,
    photos: r.photos ?? undefined,
    quantity: r.quantity,
  });

  return NextResponse.json({
    items: rows.filter((r) => !r.savedForLater).map(toClient),
    saved: rows.filter((r) => r.savedForLater).map(toClient),
  });
}
