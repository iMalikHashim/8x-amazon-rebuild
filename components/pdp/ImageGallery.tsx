"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductArt, type ProductArtVariant } from "@/components/product/ProductArt";
import { unsplashUrl } from "@/lib/unsplash";
import type { Product } from "@/lib/types";

const ICON_VARIANTS: ProductArtVariant[] = ["default", "zoom", "flip", "mono"];

export function ImageGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [erroredIndexes, setErroredIndexes] = useState<Set<number>>(new Set());
  const photos = product.photos ?? [];

  const markErrored = (i: number) => setErroredIndexes((prev) => new Set(prev).add(i));

  // No verified real photos for this product - fall back to the
  // generated icon-art gallery (four stylistic variants of one icon).
  if (photos.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="flex sm:flex-col gap-2 order-2 sm:order-1">
          {ICON_VARIANTS.map((v, i) => (
            <button
              key={v}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${product.title}`}
              aria-pressed={active === i}
              className={`w-14 h-14 rounded-sm overflow-hidden ${
                active === i ? "border-2 border-accent" : "border border-border hover:border-border-strong"
              }`}
            >
              <ProductArt icon={product.icon} category={product.category} variant={v} />
            </button>
          ))}
        </div>
        <div className="order-1 sm:order-2 w-full sm:w-[380px] lg:w-[420px]">
          <ProductArt
            icon={product.icon}
            category={product.category}
            variant={ICON_VARIANTS[active]}
            className="rounded-sm border border-border"
          />
        </div>
      </div>
    );
  }

  const activePhotoId = photos[active];
  const activeErrored = erroredIndexes.has(active);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="flex sm:flex-col gap-2 order-2 sm:order-1">
        {photos.map((photoId, i) => (
          <button
            key={`${photoId}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1} of ${product.title}`}
            aria-pressed={active === i}
            className={`relative w-14 h-14 shrink-0 rounded-sm overflow-hidden bg-[#f0f2f2] ${
              active === i ? "border-2 border-accent" : "border border-border hover:border-border-strong"
            }`}
          >
            {erroredIndexes.has(i) ? (
              <ProductArt icon={product.icon} category={product.category} />
            ) : (
              <Image
                src={unsplashUrl(photoId, 112)}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                onError={() => markErrored(i)}
              />
            )}
          </button>
        ))}
      </div>

      <div className="order-1 sm:order-2 w-full sm:w-[380px] lg:w-[420px] relative aspect-square rounded-sm border border-border overflow-hidden bg-[#f0f2f2]">
        {activeErrored ? (
          <ProductArt icon={product.icon} category={product.category} />
        ) : (
          <Image
            key={activePhotoId}
            src={unsplashUrl(activePhotoId, 800)}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, 420px"
            priority
            className="object-cover"
            onError={() => markErrored(active)}
          />
        )}
      </div>
    </div>
  );
}
