import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { Price } from "@/components/ui/Price";
import { RatingStars } from "@/components/ui/RatingStars";
import { PrimeBadge } from "@/components/ui/Badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** Fixed width, used inside horizontally-scrolling carousels. */
  fixedWidth?: boolean;
}

export function ProductCard({ product, fixedWidth = false }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group flex flex-col bg-white border border-border rounded-sm p-3 hover:shadow-md transition-shadow ${
        fixedWidth ? "w-[180px] sm:w-[200px] shrink-0" : ""
      }`}
    >
      <ProductImage
        product={product}
        className="rounded-sm mb-3"
        sizes={fixedWidth ? "200px" : "(max-width: 640px) 45vw, 220px"}
      />
      <span className="text-sm text-text line-clamp-2 group-hover:text-link">{product.title}</span>
      <div className="mt-1">
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={12} />
      </div>
      <div className="mt-1">
        <Price price={product.price} listPrice={product.listPrice} size="sm" />
      </div>
      {product.prime && (
        <div className="mt-1">
          <PrimeBadge />
        </div>
      )}
    </Link>
  );
}
