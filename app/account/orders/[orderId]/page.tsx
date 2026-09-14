import Link from "next/link";
import { eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { toClientOrder } from "@/lib/orders-db";
import { OrderSummaryCard } from "@/components/account/OrderSummaryCard";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const user = await getCurrentUser();

  const row = user
    ? await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } })
    : undefined;
  const owned = row && user && row.userId === user.id;

  return (
    <div className="max-w-[900px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <Link href="/account/orders" className="flex items-center gap-1 text-sm text-link hover:text-link-hover hover:underline w-fit">
        <ChevronLeft size={16} /> Back to orders
      </Link>

      {!row ? (
        <p className="text-text-secondary">We can&apos;t find that order.</p>
      ) : !owned ? (
        <p className="text-text-secondary">
          This order belongs to a different account. Sign in as that account to view it.
        </p>
      ) : (
        <>
          <h1 className="text-2xl text-text">Order {row.id}</h1>
          <OrderSummaryCard order={toClientOrder(row, user!.email)} />
        </>
      )}
    </div>
  );
}
