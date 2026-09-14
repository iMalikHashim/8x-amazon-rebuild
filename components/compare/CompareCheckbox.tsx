"use client";

import { useCompare } from "@/lib/compare-context";
import { MAX_COMPARE_ITEMS } from "@/lib/compare";
import type { Product } from "@/lib/types";

interface CompareCheckboxProps {
  product: Pick<Product, "id" | "slug" | "title" | "icon" | "category" | "photos" | "price">;
  className?: string;
}

/**
 * Product cards render this inside a whole-card <Link> to the PDP, so every
 * handler stops propagation - otherwise toggling the checkbox also
 * navigates away, since the click still bubbles to the enclosing anchor.
 */
export function CompareCheckbox({ product, className = "" }: CompareCheckboxProps) {
  const { isComparing, canAddMore, toggle } = useCompare();
  const checked = isComparing(product.id);
  const disabled = !checked && !canAddMore;

  return (
    <label
      className={`inline-flex items-center gap-1.5 text-xs font-normal text-text-secondary ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-text"
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
      title={disabled ? `You can compare up to ${MAX_COMPARE_ITEMS} items at a time` : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          if (disabled) return;
          toggle({
            id: product.id,
            slug: product.slug,
            title: product.title,
            icon: product.icon,
            category: product.category,
            photos: product.photos,
            price: product.price,
          });
        }}
        className="h-3.5 w-3.5 accent-accent"
      />
      Compare
    </label>
  );
}
