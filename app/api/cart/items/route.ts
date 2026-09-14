import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { addToCart } from "@/lib/cart-db";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : null;
  const quantity = typeof body?.quantity === "number" && body.quantity > 0 ? body.quantity : 1;
  if (!productId) return NextResponse.json({ error: "productId is required." }, { status: 400 });

  await addToCart(user.id, productId, quantity);
  return NextResponse.json({ ok: true });
}
