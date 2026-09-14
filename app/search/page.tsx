import Link from "next/link";
import { getCategories, queryProducts, type SortOption } from "@/lib/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/search/SortSelect";
import { RatingStars } from "@/components/ui/RatingStars";

const RATING_OPTIONS = [4, 3, 2, 1];

type RawSearchParams = Record<string, string | string[] | undefined>;

function one(sp: RawSearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

function buildHref(current: Record<string, string | undefined>, overrides: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const s = params.toString();
  return `/search${s ? `?${s}` : ""}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;

  const q = one(sp, "q") ?? "";
  const category = one(sp, "category") ?? "";
  const minPrice = one(sp, "minPrice");
  const maxPrice = one(sp, "maxPrice");
  const minRating = one(sp, "minRating");
  const prime = one(sp, "prime");
  const sort = (one(sp, "sort") as SortOption | undefined) ?? "relevance";

  const [results, categories] = await Promise.all([
    queryProducts({
      q,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      primeOnly: prime === "1",
      sort,
    }),
    getCategories(),
  ]);

  const current = { q, category, minPrice, maxPrice, minRating, prime, sort };
  const hasActiveFilters = Boolean(minPrice || maxPrice || minRating || prime);

  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-4 flex flex-col lg:flex-row gap-4">
      <aside className="lg:w-[240px] shrink-0 bg-white border border-border rounded-sm p-4 h-fit">
        <h2 className="font-bold text-base mb-2 text-text">Department</h2>
        <ul className="space-y-1.5 mb-5">
          <li>
            <Link
              href={buildHref(current, { category: undefined })}
              className={`text-sm ${!category ? "font-bold text-link" : "hover:text-link hover:underline"}`}
            >
              All Departments
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <Link
                href={buildHref(current, { category: category === c ? undefined : c })}
                className={`text-sm ${category === c ? "font-bold text-link" : "hover:text-link hover:underline"}`}
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>

        <form action="/search" method="get" className="flex flex-col gap-5">
          <input type="hidden" name="q" value={q} />
          {category && <input type="hidden" name="category" value={category} />}
          <input type="hidden" name="sort" value={sort} />

          <div>
            <h2 className="font-bold text-base mb-2 text-text">Customer Review</h2>
            <ul className="space-y-1.5">
              {RATING_OPTIONS.map((r) => (
                <li key={r}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="minRating"
                      value={r}
                      defaultChecked={minRating === String(r)}
                      className="accent-accent"
                    />
                    <RatingStars rating={r} size={14} />
                    <span>&amp; Up</span>
                  </label>
                </li>
              ))}
              <li>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="minRating"
                    value=""
                    defaultChecked={!minRating}
                    className="accent-accent"
                  />
                  Any rating
                </label>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-base mb-2 text-text">Price</h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minPrice"
                placeholder="Min"
                min={0}
                defaultValue={minPrice ?? ""}
                className="w-20 border border-border-strong rounded-sm px-2 py-1 text-sm"
              />
              <span className="text-text-secondary">to</span>
              <input
                type="number"
                name="maxPrice"
                placeholder="Max"
                min={0}
                defaultValue={maxPrice ?? ""}
                className="w-20 border border-border-strong rounded-sm px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <h2 className="font-bold text-base mb-2 text-text">Prime</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="prime" value="1" defaultChecked={prime === "1"} className="accent-accent" />
              Prime only
            </label>
          </div>

          <button
            type="submit"
            className="bg-nav-secondary text-white text-sm rounded-sm py-2 hover:bg-nav-secondary-hover"
          >
            Apply Filters
          </button>
          {hasActiveFilters && (
            <Link href={buildHref({ q, category, sort }, {})} className="text-sm text-link hover:underline text-center">
              Clear filters
            </Link>
          )}
        </form>
      </aside>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="bg-white border border-border rounded-sm p-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-text-secondary">
            {results.length} result{results.length === 1 ? "" : "s"}
            {q && (
              <>
                {" "}
                for <span className="font-bold text-text">&quot;{q}&quot;</span>
              </>
            )}
            {category && (
              <>
                {" "}
                in <span className="font-bold text-text">{category}</span>
              </>
            )}
          </p>
          <SortSelect current={sort} />
        </div>

        {results.length === 0 ? (
          <div className="bg-white border border-border rounded-sm p-10 text-center text-text-secondary">
            No results. Try removing a filter or searching a different term.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
