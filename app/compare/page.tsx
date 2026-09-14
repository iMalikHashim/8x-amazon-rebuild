import Link from "next/link";
import { getProductBySlug } from "@/lib/catalog";
import { bestIndices, valuesDiffer, splitBullet, MAX_COMPARE_ITEMS } from "@/lib/compare";
import { ProductImage } from "@/components/product/ProductImage";
import { RatingStars } from "@/components/ui/RatingStars";
import { PrimeBadge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { CompareRemoveButton } from "@/components/compare/CompareRemoveButton";
import { CompareAddToCart } from "@/components/compare/CompareAddToCart";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

/** A cell whose row's values differ across the compared products gets a
 * subtle tint, and the single best value (lowest price, highest rating)
 * gets a badge on top of that - "differences highlighted" applies to
 * every row, not just the two with an objective winner. */
function rowCellClass(isBest: boolean, isDifferent: boolean): string {
  if (isBest) return "bg-[#f0fdf4]";
  if (isDifferent) return "bg-[#fefce8]";
  return "";
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>;
}) {
  const { slugs: slugsParam } = await searchParams;
  const requestedSlugs = Array.from(
    new Set((slugsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean))
  ).slice(0, MAX_COMPARE_ITEMS);

  const products = (await Promise.all(requestedSlugs.map((slug) => getProductBySlug(slug)))).filter(
    (p): p is Product => Boolean(p)
  );

  if (products.length < 2) {
    return (
      <div className="max-w-[700px] mx-auto px-2 sm:px-3 py-16 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl text-text">Nothing to compare yet</h1>
        <p className="text-text-secondary">
          Check the <span className="font-bold">Compare</span> box on 2 to {MAX_COMPARE_ITEMS} products from any
          product card or product page, then come back here.
        </p>
        <Link href="/">
          <Button variant="cta" className="px-6 py-2 font-medium">
            Start browsing
          </Button>
        </Link>
      </div>
    );
  }

  const prices = products.map((p) => p.price);
  const ratings = products.map((p) => p.rating);
  const bestPrice = bestIndices(prices, "min");
  const bestRating = bestIndices(ratings, "max");
  const primeDiffers = valuesDiffer(products.map((p) => p.prime));
  const brandDiffers = valuesDiffer(products.map((p) => p.brand));
  const categoryDiffers = valuesDiffer(products.map((p) => p.category));

  const slugs = products.map((p) => p.slug);

  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <h1 className="text-2xl text-text">
        Comparing {products.length} product{products.length === 1 ? "" : "s"}
      </h1>

      <div className="overflow-x-auto bg-white border border-border rounded-sm">
        <table className="border-collapse w-full" style={{ minWidth: `calc(160px + ${products.length} * 190px)` }}>
          <caption className="sr-only">
            Side-by-side comparison of {products.map((p) => p.title).join(", ")} on price, rating, and features
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="sticky left-0 bg-white z-10 p-3 w-[160px] min-w-[160px] text-left align-bottom">
                <span className="sr-only">Product</span>
              </th>
              {products.map((product) => (
                <th key={product.id} scope="col" className="p-3 align-bottom text-left font-normal min-w-[190px]">
                  <div className="flex flex-col gap-2">
                    <Link href={`/product/${product.slug}`} className="w-fit">
                      <ProductImage product={product} className="w-24 h-24 rounded-sm" sizes="96px" />
                    </Link>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-medium text-text hover:text-link line-clamp-3"
                    >
                      {product.title}
                    </Link>
                    <CompareRemoveButton
                      productId={product.id}
                      remainingSlugs={slugs.filter((s) => s !== product.slug)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <th scope="row" className="sticky left-0 bg-white z-10 p-3 text-left text-sm font-bold text-text">
                Brand
              </th>
              {products.map((product) => (
                <td key={product.id} className={`p-3 text-sm text-text ${rowCellClass(false, brandDiffers)}`}>
                  {product.brand}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th scope="row" className="sticky left-0 bg-white z-10 p-3 text-left text-sm font-bold text-text">
                Category
              </th>
              {products.map((product) => (
                <td key={product.id} className={`p-3 text-sm text-text ${rowCellClass(false, categoryDiffers)}`}>
                  {product.category}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th scope="row" className="sticky left-0 bg-white z-10 p-3 text-left text-sm font-bold text-text">
                Price
              </th>
              {products.map((product, i) => (
                <td key={product.id} className={`p-3 ${rowCellClass(bestPrice.has(i), false)}`}>
                  <Price price={product.price} listPrice={product.listPrice} size="sm" />
                  {bestPrice.has(i) && bestPrice.size < products.length && (
                    <span className="block text-xs font-bold text-success mt-1">Lowest price</span>
                  )}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th scope="row" className="sticky left-0 bg-white z-10 p-3 text-left text-sm font-bold text-text">
                Rating
              </th>
              {products.map((product, i) => (
                <td key={product.id} className={`p-3 ${rowCellClass(bestRating.has(i), false)}`}>
                  <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={14} />
                  {bestRating.has(i) && bestRating.size < products.length && (
                    <span className="block text-xs font-bold text-success mt-1">Highest rated</span>
                  )}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border">
              <th scope="row" className="sticky left-0 bg-white z-10 p-3 text-left text-sm font-bold text-text">
                Prime
              </th>
              {products.map((product) => (
                <td key={product.id} className={`p-3 ${rowCellClass(false, primeDiffers)}`}>
                  {product.prime ? <PrimeBadge /> : <span className="text-sm text-text-secondary">&mdash;</span>}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border align-top">
              <th scope="row" className="sticky left-0 bg-white z-10 p-3 text-left text-sm font-bold text-text">
                Key features
              </th>
              {products.map((product) => (
                <td key={product.id} className="p-3 align-top">
                  <ul className="flex flex-col gap-2">
                    {product.bullets.map((bullet, i) => {
                      const { label, detail } = splitBullet(bullet);
                      return (
                        <li key={i} className="text-xs text-text">
                          {label && <span className="font-bold block">{label}</span>}
                          <span className="text-text-secondary">{detail}</span>
                        </li>
                      );
                    })}
                  </ul>
                </td>
              ))}
            </tr>

            <tr>
              <th scope="row" className="sticky left-0 bg-white z-10 p-3">
                <span className="sr-only">Actions</span>
              </th>
              {products.map((product) => (
                <td key={product.id} className="p-3">
                  <CompareAddToCart product={product} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
