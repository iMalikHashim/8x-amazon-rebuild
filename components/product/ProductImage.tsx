"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductArt } from "@/components/product/ProductArt";
import { unsplashUrl } from "@/lib/unsplash";
import type { Product } from "@/lib/types";

interface ProductImageProps {
  product: Product;
  /** Which entry in product.photos to show - defaults to the primary photo. */
  index?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * A single product visual: a real Unsplash photo when one is available
 * for this product, the generated SVG ProductArt otherwise - and ProductArt
 * again if the real photo fails to load at runtime (broken link, revoked
 * asset, offline). Never renders a broken-image icon.
 */
export function ProductImage({ product, index = 0, className = "", sizes = "200px", priority = false }: ProductImageProps) {
  const photoId = product.photos?.[index];
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!photoId || errored) {
    return <ProductArt icon={product.icon} category={product.category} className={className} />;
  }

  return (
    <div className={`relative aspect-square overflow-hidden bg-[#f0f2f2] ${loaded ? "" : "animate-pulse"} ${className}`}>
      <Image
        src={unsplashUrl(photoId, 800)}
        alt={product.title}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
      />
    </div>
  );
}
