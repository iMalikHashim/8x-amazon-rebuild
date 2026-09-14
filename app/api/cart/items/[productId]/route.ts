import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { productId } = await params;

  const body = await req.json().catch(() => null);
  const update: Partial<{ quantity: number; savedForLater: boolean }> = {};
  if (typeof body?.quantity === "number" && body.quantity > 0) update.quantity = body.quantity;
  if (typeof body?.savedForLater === "boolean") update.savedForLater = body.savedForLater;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  await db
    .update(cartItems)
    .set(update)
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { productId } = await params;

  await db.delete(cartItems).where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)));
  return NextResponse.json({ ok: true });
}
