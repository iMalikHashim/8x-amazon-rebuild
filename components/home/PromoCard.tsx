import Link from "next/link";
import Image from "next/image";
import { productIcons, DEFAULT_PRODUCT_ICON } from "@/lib/product-icons";
import { getCategoryArt } from "@/lib/category-art";
import { ICON_PHOTOS } from "@/lib/promo-photos";
import { unsplashUrl } from "@/lib/unsplash";
import type { Category, ProductIconKey } from "@/lib/types";

export interface PromoTile {
  label: string;
  icon: ProductIconKey;
  category: Category;
  /** Where this specific tile links - every tile is clickable, not just
   * the card's own "Explore all..." link at the bottom. */
  href: string;
}

export interface PromoCardProps {
  title: string;
  tiles: PromoTile[];
  ctaLabel: string;
  ctaHref: string;
}

function Tile({ icon, category, label, href, big = false }: PromoTile & { big?: boolean }) {
  const photoId = ICON_PHOTOS[icon];
  const Icon = productIcons[icon] || DEFAULT_PRODUCT_ICON;
  const { accent, tint } = getCategoryArt(category);

  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 group">
      <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-[#f0f2f2]">
        {photoId ? (
          <Image
            src={unsplashUrl(photoId, 400)}
            alt={label || category}
            fill
            sizes={big ? "260px" : "150px"}
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: tint }}>
            <Icon className={big ? "w-2/5 h-2/5" : "w-1/2 h-1/2"} style={{ color: accent }} strokeWidth={1.5} />
          </div>
        )}
      </div>
      {label && <span className="text-xs text-text text-center group-hover:text-link">{label}</span>}
    </Link>
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
