import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { toClientOrder } from "@/lib/orders-db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) return NextResponse.json({ order: null }, { status: 401 });

  const row = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  });

  if (!row || row.userId !== user.id) {
    return NextResponse.json({ order: null }, { status: 404 });
  }

  return NextResponse.json({ order: toClientOrder(row, user.email) });
}
