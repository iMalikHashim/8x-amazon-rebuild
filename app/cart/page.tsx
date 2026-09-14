"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { SavedItem } from "@/components/cart/SavedItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/Button";

export default function CartPage() {
  const { items, saved, subtotal, count } = useCart();

  if (items.length === 0 && saved.length === 0) {
    return (
      <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-12 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-medium text-text">Your Amazon Rebuild Cart is empty</h1>
        <p className="text-text-secondary max-w-sm">
          Browse the catalog and add something you like - it'll show up here.
        </p>
        <Link href="/">
          <Button variant="cta" className="px-6 py-2 font-medium">
            Continue shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-4 flex flex-col lg:flex-row gap-4 items-start">
      <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
        <div className="bg-white border border-border rounded-sm p-4 sm:p-5">
          <div className="flex items-baseline justify-between border-b border-border pb-3 mb-1">
            <h1 className="text-2xl text-text">Shopping Cart</h1>
            <span className="text-text-secondary text-sm hidden sm:inline">Price</span>
          </div>
          {items.length === 0 ? (
            <p className="text-text-secondary py-6 text-center">
              Your cart is empty. Everything's in Saved for later below.
            </p>
          ) : (
            items.map((item) => <CartLineItem key={item.productId} item={item} />)
          )}
        </div>

        {saved.length > 0 && (
          <div className="bg-white border border-border rounded-sm p-4 sm:p-5">
            <h2 className="text-lg font-bold text-text border-b border-border pb-3 mb-1">
              Saved for later ({saved.length})
            </h2>
            {saved.map((item) => (
              <SavedItem key={item.productId} item={item} />
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && <CartSummary subtotal={subtotal} itemCount={count} />}
    </div>
  );
}
