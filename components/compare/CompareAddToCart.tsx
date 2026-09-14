"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

export function CompareAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      variant="cta"
      onClick={() => {
        addItem(product, 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className="w-full py-1.5 text-sm font-medium"
    >
      {added ? "Added ✓" : "Add to Cart"}
    </Button>
  );
}
