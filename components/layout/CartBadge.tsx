"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartBadge() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="flex items-end gap-1 h-full px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70 rounded-xs"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <span className="relative">
        <ShoppingCart size={28} className="text-white" />
        <span className="absolute -top-1 left-3 min-w-[18px] h-[18px] px-0.5 rounded-full bg-accent text-header text-xs font-bold flex items-center justify-center">
          {count}
        </span>
      </span>
      <span className="hidden sm:inline text-sm font-bold text-white">Cart</span>
    </Link>
  );
}
