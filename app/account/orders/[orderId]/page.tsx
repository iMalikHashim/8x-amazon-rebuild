"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useOrders } from "@/lib/orders-context";
import { OrderSummaryCard } from "@/components/account/OrderSummaryCard";

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { getOrder } = useOrders();
  const order = getOrder(orderId);

  return (
    <div className="max-w-[900px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <Link href="/account/orders" className="flex items-center gap-1 text-sm text-link hover:text-link-hover hover:underline w-fit">
        <ChevronLeft size={16} /> Back to orders
      </Link>

      {!order ? (
        <p className="text-text-secondary">We can&apos;t find that order in this browser.</p>
      ) : (
        <>
          <h1 className="text-2xl text-text">Order {order.id}</h1>
          <OrderSummaryCard order={order} />
        </>
      )}
    </div>
  );
}
