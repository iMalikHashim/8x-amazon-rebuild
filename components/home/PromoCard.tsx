import Link from "next/link";
import { productIcons } from "@/lib/product-icons";
import { categoryArt } from "@/lib/category-art";
import type { Category, ProductIconKey } from "@/lib/types";

export interface PromoTile {
  label: string;
  icon: ProductIconKey;
  category: Category;
}

export interface PromoCardProps {
  title: string;
  tiles: PromoTile[];
  ctaLabel: string;
  ctaHref: string;
}

function Tile({ icon, category, label, big = false }: PromoTile & { big?: boolean }) {
  const Icon = productIcons[icon];
  const { accent, tint } = categoryArt[category];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="w-full aspect-square rounded-sm flex items-center justify-center"
        style={{ backgroundColor: tint }}
      >
        <Icon className={big ? "w-2/5 h-2/5" : "w-1/2 h-1/2"} style={{ color: accent }} strokeWidth={1.5} />
      </div>
      {label && <span className="text-xs text-text text-center">{label}</span>}
    </div>
  );
}

export function PromoCard({ title, tiles, ctaLabel, ctaHref }: PromoCardProps) {
  const isSingle = tiles.length === 1;

  return (
    <div className="bg-white border border-border rounded-sm p-4 flex flex-col">
      <h3 className="font-bold text-lg text-text mb-3">{title}</h3>

      {isSingle ? (
        <Tile {...tiles[0]} big />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <Tile key={t.label} {...t} />
          ))}
        </div>
      )}

      <Link href={ctaHref} className="mt-3 text-sm text-link hover:text-link-hover hover:underline">
        {ctaLabel}
      </Link>
    </div>
  );
}
