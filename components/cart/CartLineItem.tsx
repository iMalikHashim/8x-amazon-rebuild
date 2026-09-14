"use client";

import Link from "next/link";
import { ProductArt } from "@/components/product/ProductArt";
import { formatUsd } from "@/lib/format";
import { useCart, type CartItem } from "@/lib/cart-context";
import { products } from "@/data/products";

const QUANTITIES = Array.from({ length: 10 }, (_, i) => i + 1);

export function CartLineItem({ item }: { item: CartItem }) {
  const { setQuantity, removeItem, saveForLater } = useCart();
  const category = products.find((p) => p.id === item.productId)?.category ?? "Electronics";

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-b-0">
      <Link href={`/product/${item.slug}`} className="w-24 sm:w-32 shrink-0">
        <ProductArt icon={item.icon} category={category} className="rounded-sm" />
      </Link>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <Link href={`/product/${item.slug}`} className="text-sm sm:text-base hover:text-link line-clamp-2">
          {item.title}
        </Link>
        <p className="text-success text-xs font-medium">In Stock</p>

        <div className="flex flex-wrap items-center gap-3 mt-1">
          <label className="flex items-center gap-1.5 text-sm">
            Qty:
            <select
              value={item.quantity}
              onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
              className="border border-border-strong rounded-md px-1.5 py-1 bg-[#f0f2f2]"
            >
              {QUANTITIES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="text-border-strong">|</span>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="text-sm text-link hover:text-link-hover hover:underline"
          >
            Delete
          </button>
          <span className="text-border-strong">|</span>
          <button
            type="button"
            onClick={() => saveForLater(item.productId)}
            className="text-sm text-link hover:text-link-hover hover:underline"
          >
            Save for later
          </button>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-medium text-text">{formatUsd(item.price * item.quantity)}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-text-secondary">{formatUsd(item.price)} each</p>
        )}
      </div>
    </div>
  );
}
