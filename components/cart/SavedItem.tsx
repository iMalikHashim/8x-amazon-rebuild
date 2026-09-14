"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductArt } from "@/components/product/ProductArt";
import { formatUsd } from "@/lib/format";
import { useCart, type CartItem } from "@/lib/cart-context";
import { products } from "@/data/products";

export function SavedItem({ item }: { item: CartItem }) {
  const { moveToCart, removeSaved } = useCart();
  const fullProduct = products.find((p) => p.id === item.productId);

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-b-0">
      <Link href={`/product/${item.slug}`} className="w-20 sm:w-24 shrink-0">
        {fullProduct ? (
          <ProductImage product={fullProduct} className="rounded-sm" sizes="96px" />
        ) : (
          <ProductArt icon={item.icon} category="Electronics" className="rounded-sm" />
        )}
      </Link>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <Link href={`/product/${item.slug}`} className="text-sm hover:text-link line-clamp-2">
          {item.title}
        </Link>
        <p className="font-medium text-text text-sm">{formatUsd(item.price)}</p>
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={() => moveToCart(item.productId)}
            className="text-sm text-link hover:text-link-hover hover:underline"
          >
            Move to Cart
          </button>
          <span className="text-border-strong" aria-hidden="true">|</span>
          <button
            type="button"
            onClick={() => removeSaved(item.productId)}
            className="text-sm text-link hover:text-link-hover hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
