import Link from "next/link";
import { eq } from "drizzle-orm";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { toClientOrder } from "@/lib/orders-db";
import { Button } from "@/components/ui/Button";
import { OrderSummaryCard } from "@/components/account/OrderSummaryCard";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getCurrentUser();

  const row = user
    ? await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } })
    : undefined;
  const owned = row && user && row.userId === user.id;

  if (!row || !owned) {
    return (
      <div className="max-w-[800px] mx-auto px-2 sm:px-3 py-12 text-center flex flex-col items-center gap-4">
        <h1 className="text-2xl text-text">We can&apos;t find that order</h1>
        <p className="text-text-secondary">It may belong to a different account.</p>
        <Link href="/account/orders">
          <Button variant="cta" className="px-6 py-2 font-medium">
            View order history
          </Button>
        </Link>
      </div>
    );
  }

  const order = toClientOrder(row, user!.email);

  return (
    <div className="max-w-[800px] mx-auto px-2 sm:px-3 py-8 flex flex-col gap-5">
      <div className="flex flex-col items-center text-center gap-2">
        <CheckCircle2 size={48} className="text-success" />
        <h1 className="text-2xl text-text">Order placed, thanks!</h1>
        <p className="text-text-secondary">
          Confirmation will be sent to your email. Estimated delivery{" "}
          <span className="font-bold text-text">{order.estimatedDelivery}</span>.
        </p>
      </div>

      <OrderSummaryCard order={order} />

      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/account/orders">
          <Button variant="secondary" className="px-6 py-2 font-medium">
            View order
          </Button>
        </Link>
        <Link href="/">
          <Button variant="cta" className="px-6 py-2 font-medium">
            Continue shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
