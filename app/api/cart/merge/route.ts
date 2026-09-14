import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { addToCart } from "@/lib/cart-db";

/** Called once right after sign-in/sign-up with the guest's localStorage
 * cart, so it's added into the user's DB cart rather than lost. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];

  for (const item of items) {
    if (typeof item?.productId === "string" && typeof item?.quantity === "number" && item.quantity > 0) {
      await addToCart(user.id, item.productId, item.quantity);
    }
  }

  return NextResponse.json({ ok: true });
}
