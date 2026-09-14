"use client";

import { useState } from "react";
import { ProductArt, type ProductArtVariant } from "@/components/product/ProductArt";
import type { Category, ProductIconKey } from "@/lib/types";

interface ImageGalleryProps {
  icon: ProductIconKey;
  category: Category;
  title: string;
}

const VARIANTS: ProductArtVariant[] = ["default", "zoom", "flip", "mono"];

export function ImageGallery({ icon, category, title }: ImageGalleryProps) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="flex sm:flex-col gap-2 order-2 sm:order-1">
        {VARIANTS.map((v, i) => (
          <button
            key={v}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of ${title}`}
            aria-pressed={active === i}
            className={`w-14 h-14 rounded-sm overflow-hidden ${
              active === i ? "border-2 border-accent" : "border border-border hover:border-border-strong"
            }`}
          >
            <ProductArt icon={icon} category={category} variant={v} />
          </button>
        ))}
      </div>
      <div className="order-1 sm:order-2 w-full sm:w-[380px] lg:w-[420px]">
        <ProductArt icon={icon} category={category} variant={VARIANTS[active]} className="rounded-sm border border-border" />
      </div>
    </div>
  );
}
