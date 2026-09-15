import { getProducts } from "@/lib/catalog";
import { discountPercent } from "@/lib/format";
import { ProductCard } from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const products = await getProducts();

  const deals = products
    .map((p) => ({ product: p, pct: discountPercent(p.price, p.listPrice) }))
    .filter((d): d is { product: (typeof products)[number]; pct: number } => d.pct !== null)
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <div className="bg-linear-to-r from-[#8a1f11] to-[#c62c1a] text-white rounded-sm px-4 sm:px-6 py-6 flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Today&apos;s Deals</h1>
        <p className="text-white/90 text-sm sm:text-base">
          {deals.length} deal{deals.length === 1 ? "" : "s"} right now, sorted by biggest discount first.
        </p>
      </div>

      {deals.length === 0 ? (
        <p className="text-text-secondary py-8 text-center">No deals available right now - check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {deals.map(({ product, pct }) => (
            <div key={product.id} className="relative">
              <span className="absolute top-2 left-2 z-10 bg-price text-white text-xs font-bold px-2 py-1 rounded-sm shadow-md">
                -{pct}%
              </span>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
