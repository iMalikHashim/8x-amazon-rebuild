import { categoryArt } from "@/lib/category-art";
import { productIcons } from "@/lib/product-icons";
import type { Category, ProductIconKey } from "@/lib/types";

interface ProductArtProps {
  icon: ProductIconKey;
  category: Category;
  className?: string;
}

/**
 * Generated product-tile art: a lucide icon composed onto a white
 * studio-photography-style tile with a soft category-tinted glow and a
 * grounding shadow. Stands in for real product photography, which isn't
 * available without scraping (see docs/architecture.md, section 5).
 */
export function ProductArt({ icon, category, className = "" }: ProductArtProps) {
  const Icon = productIcons[icon];
  const { accent, tint } = categoryArt[category];

  return (
    <div className={`relative aspect-square bg-white overflow-hidden ${className}`}>
      <div
        className="absolute inset-[8%] rounded-full blur-2xl opacity-70"
        style={{ backgroundColor: tint }}
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 bottom-[14%] h-[10%] w-[46%] -translate-x-1/2 rounded-full blur-md opacity-25"
        style={{ backgroundColor: "#0F1111" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          className="w-[42%] h-[42%] drop-shadow-sm"
          style={{ color: accent }}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
