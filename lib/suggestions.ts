import { products } from "@/data/products";
import { categories } from "@/data/categories";
import type { Category, Product } from "@/lib/types";

export type Suggestion =
  | { type: "category"; category: Category }
  | { type: "product"; product: Product };

/**
 * Client-side suggestion matching against the fixture catalog. Category
 * suggestions rank first (only when not already scoped to one department),
 * then products ranked by where the match landed: title-prefix > brand-
 * prefix > title-substring > brand-substring, ties broken by review count
 * so popular items surface first - the same instinct real autocomplete
 * ranking uses.
 */
export function getSuggestions(query: string, categoryFilter: Category | "", limit = 8): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const pool = categoryFilter ? products.filter((p) => p.category === categoryFilter) : products;
  const results: Suggestion[] = [];

  if (!categoryFilter) {
    const matchedCategories = categories.filter((c) => c.toLowerCase().includes(q));
    for (const c of matchedCategories.slice(0, 2)) {
      results.push({ type: "category", category: c });
    }
  }

  const scored = pool
    .map((p) => {
      const title = p.title.toLowerCase();
      const brand = p.brand.toLowerCase();
      let score = 0;
      if (title.startsWith(q)) score = 4;
      else if (brand.startsWith(q)) score = 3;
      else if (title.includes(q)) score = 2;
      else if (brand.includes(q)) score = 1;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.reviewCount - a.p.reviewCount);

  const remaining = Math.max(0, limit - results.length);
  for (const { p } of scored.slice(0, remaining)) {
    results.push({ type: "product", product: p });
  }

  return results;
}

export function suggestionKey(s: Suggestion): string {
  return s.type === "category" ? `cat:${s.category}` : `prod:${s.product.id}`;
}

export function suggestionHref(s: Suggestion): string {
  return s.type === "category"
    ? `/search?category=${encodeURIComponent(s.category)}`
    : `/product/${s.product.slug}`;
}
