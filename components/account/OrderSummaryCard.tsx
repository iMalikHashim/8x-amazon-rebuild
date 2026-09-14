import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductArt } from "@/components/product/ProductArt";
import { formatUsd } from "@/lib/format";
import { products } from "@/data/products";
import type { Order } from "@/lib/types";

export function OrderSummaryCard({ order }: { order: Order }) {
  const placedDate = new Date(order.placedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-white border border-border rounded-sm">
      <div className="bg-[#f0f2f2] border-b border-border px-4 py-3 flex flex-wrap gap-4 justify-between text-sm">
        <div>
          <p className="text-text-secondary text-xs">Order placed</p>
          <p className="font-medium">{placedDate}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Total</p>
          <p className="font-medium">{formatUsd(order.total)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Ship to</p>
          <p className="font-medium">{order.address.fullName}</p>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-xs">Order # {order.id}</p>
          <p className="font-medium text-success">Estimated delivery {order.estimatedDelivery}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {order.items.map((item) => {
          const fullProduct = products.find((p) => p.id === item.productId);
          return (
            <Link
              key={item.productId}
              href={`/product/${item.slug}`}
              className="flex gap-3 items-center hover:bg-page-bg -mx-2 px-2 py-1 rounded-sm"
            >
              {fullProduct ? (
                <ProductImage product={fullProduct} className="w-16 h-16 rounded-sm shrink-0" sizes="64px" />
              ) : (
                <ProductArt icon={item.icon} category="Electronics" className="w-16 h-16 rounded-sm shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-1">{item.title}</p>
                <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium shrink-0">{formatUsd(item.price * item.quantity)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
