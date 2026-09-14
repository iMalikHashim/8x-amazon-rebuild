"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { Price } from "@/components/ui/Price";
import { PrimeBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

const QUANTITIES = Array.from({ length: 10 }, (_, i) => i + 1);

export function BuyBox({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const { addItem } = useCart();
  const router = useRouter();

  const deliveryDate = new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const handleAddToCart = () => {
    if (busy) return;
    setBusy("add");
    addItem(product, qty);
    setJustAdded(true);
    window.setTimeout(() => {
      setJustAdded(false);
      setBusy(null);
    }, 1200);
  };

  const handleBuyNow = () => {
    if (busy) return;
    setBusy("buy");
    addItem(product, qty);
    router.push("/checkout");
  };

  return (
    <div className="border border-border rounded-sm p-4 flex flex-col gap-3 w-full lg:w-[300px] shrink-0 h-fit">
      <Price price={product.price} listPrice={product.listPrice} size="lg" />
      {product.prime && <PrimeBadge />}

      <div className="text-sm border-t border-border pt-3">
        <p>
          <span className="font-bold">FREE delivery</span> {deliveryDate}
        </p>
        <p className="text-text-secondary mt-1">
          Or fastest delivery tomorrow. Order within 4 hrs 12 mins.
        </p>
      </div>

      <p className="text-success text-base font-medium">In Stock</p>

      <label className="flex items-center gap-2 text-sm">
        Qty:
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="border border-border-strong rounded-md px-2 py-1 bg-[#f0f2f2]"
        >
          {QUANTITIES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <Button
        type="button"
        variant="cta"
        onClick={handleAddToCart}
        disabled={busy !== null}
        aria-busy={busy === "add"}
        className="w-full py-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {justAdded ? "Added to Cart ✓" : busy === "add" ? "Adding…" : "Add to Cart"}
      </Button>
      <Button
        type="button"
        variant="buynow"
        onClick={handleBuyNow}
        disabled={busy !== null}
        aria-busy={busy === "buy"}
        className="w-full py-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {busy === "buy" ? "Processing…" : "Buy Now"}
      </Button>

      <p className="text-xs text-text-secondary border-t border-border pt-3">
        Ships from and sold by Amazon Rebuild.
      </p>
    </div>
  );
}
