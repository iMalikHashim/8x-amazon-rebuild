import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems, products, orders, orderItems } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { computeShipping, computeTax, generateOrderId, formatDeliveryDate } from "@/lib/pricing";
import { toClientOrder } from "@/lib/orders-db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ orders: [] }, { status: 401 });

  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, user.id),
    orderBy: desc(orders.placedAt),
    with: { items: true },
  });

  return NextResponse.json({ orders: rows.map((r) => toClientOrder(r, user.email)) });
}

interface AddressInput {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const address: AddressInput = body?.address ?? {};
  const cardLast4 = typeof body?.cardLast4 === "string" ? body.cardLast4 : "";

  if (!address.fullName || !address.line1 || !address.city || !address.state || !address.zip || !cardLast4) {
    return NextResponse.json({ error: "Missing address or payment info." }, { status: 400 });
  }

  const cartRows = await db
    .select({
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      slug: products.slug,
      title: products.title,
      price: products.price,
      icon: products.icon,
      category: products.category,
      photos: products.photos,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.savedForLater, false)));

  if (cartRows.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const subtotal = cartRows.reduce((sum, r) => sum + r.price * r.quantity, 0);
  const shipping = computeShipping(subtotal);
  const tax = computeTax(subtotal);
  const total = subtotal + shipping + tax;
  const orderId = generateOrderId();
  const estimatedDelivery = formatDeliveryDate(3);

  await db.batch([
    db.insert(orders).values({
      id: orderId,
      userId: user.id,
      subtotal,
      shipping,
      tax,
      total,
      addressFullName: address.fullName,
      addressLine1: address.line1,
      addressLine2: address.line2 || null,
      addressCity: address.city,
      addressState: address.state,
      addressZip: address.zip,
      cardLast4,
      estimatedDelivery,
    }),
    db.insert(orderItems).values(
      cartRows.map((r) => ({
        orderId,
        productId: r.productId,
        slug: r.slug,
        title: r.title,
        price: r.price,
        icon: r.icon,
        category: r.category,
        photos: r.photos,
        quantity: r.quantity,
      }))
    ),
    db.delete(cartItems).where(and(eq(cartItems.userId, user.id), eq(cartItems.savedForLater, false))),
  ]);

  return NextResponse.json({ orderId });
}
