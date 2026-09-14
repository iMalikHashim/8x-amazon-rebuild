"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/orders-context";
import { formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders } = useOrders();

  if (!user) {
    return (
      <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-12 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl text-text">Sign in to see your orders</h1>
        <Link href="/sign-in?redirect=/account/orders">
          <Button variant="cta" className="px-6 py-2 font-medium">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <h1 className="text-2xl text-text">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-border rounded-sm p-10 text-center flex flex-col items-center gap-3">
          <p className="text-text-secondary">You haven&apos;t placed any orders yet.</p>
          <Link href="/">
            <Button variant="cta" className="px-6 py-2 font-medium">
              Start shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const placedDate = new Date(order.placedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="bg-white border border-border rounded-sm p-4 flex flex-wrap gap-4 justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-text-secondary text-xs">Order placed</p>
                  <p className="font-medium text-sm">{placedDate}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Total</p>
                  <p className="font-medium text-sm">{formatUsd(order.total)}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Order #</p>
                  <p className="font-medium text-sm">{order.id}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Status</p>
                  <p className="font-medium text-sm text-success">Order placed</p>
                </div>
                <div className="text-sm text-link self-center">View order &rsaquo;</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
