import Link from "next/link";
import Image from "next/image";
import { productIcons } from "@/lib/product-icons";
import { categoryArt } from "@/lib/category-art";
import { ICON_PHOTOS } from "@/lib/promo-photos";
import { unsplashUrl } from "@/lib/unsplash";
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
  const photoId = ICON_PHOTOS[icon];
  const Icon = productIcons[icon];
  const { accent, tint } = categoryArt[category];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-[#f0f2f2]">
        {photoId ? (
          <Image
            src={unsplashUrl(photoId, 400)}
            alt={label || category}
            fill
            sizes={big ? "260px" : "150px"}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: tint }}>
            <Icon className={big ? "w-2/5 h-2/5" : "w-1/2 h-1/2"} style={{ color: accent }} strokeWidth={1.5} />
          </div>
        )}
      </div>
      {label && <span className="text-xs text-text text-center">{label}</span>}
    </div>
  );
}

export function PromoCard({ title, tiles, ctaLabel, ctaHref }: PromoCardProps) {
  const isSingle = tiles.length === 1;

  return (
    <div className="bg-white p-4 flex flex-col">
      <h2 className="font-bold text-lg text-text mb-3">{title}</h2>

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
