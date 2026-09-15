import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products as productsTable } from "@/lib/db/schema";
import type { Category, Product, ProductIconKey } from "@/lib/types";

function rowToProduct(row: typeof productsTable.$inferSelect): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    category: row.category as Category,
    price: row.price,
    listPrice: row.listPrice ?? undefined,
    rating: row.rating,
    reviewCount: row.reviewCount,
    prime: row.prime,
    bullets: row.bullets,
    description: row.description,
    icon: row.icon as ProductIconKey,
    photos: row.photos ?? undefined,
  };
}

/** Categories that exist as real product rows (so cart/orders/checkout work
 * normally for them) but are deliberately kept out of search, home rows,
 * and the category filter list - they're reachable only through their own
 * dedicated page, not the general shopping flow. */
const CATALOG_EXCLUDED_CATEGORIES: Category[] = ["Gift Cards"];

/**
 * The whole catalog is ~40 rows, so every query here fetches the full
 * table once and filters/sorts in JS - the same relevance-scoring and
 * sort logic as before the DB migration, just backed by Postgres instead
 * of the static array. This keeps the query surface small and behavior
 * identical; hand-written SQL per filter combination would be more
 * "proper" at real scale but is unwarranted complexity here.
 */
async function fetchAllProducts(): Promise<Product[]> {
  const rows = await db.select().from(productsTable);
  return rows.map(rowToProduct).filter((p) => !CATALOG_EXCLUDED_CATEGORIES.includes(p.category));
}

/** Gift card products specifically - the one place CATALOG_EXCLUDED_CATEGORIES
 * is bypassed, since /gift-cards is their dedicated page. */
export async function getGiftCardProducts(): Promise<Product[]> {
  const rows = await db.select().from(productsTable).where(eq(productsTable.category, "Gift Cards"));
  return rows.map(rowToProduct);
}

export async function getProducts(): Promise<Product[]> {
  return fetchAllProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await db.select().from(productsTable).where(eq(productsTable.slug, slug)).limit(1);
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const all = await fetchAllProducts();
  return all.filter((p) => p.category === category);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const all = await fetchAllProducts();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((p) => relevanceScore(p, q) > 0);
}

function relevanceScore(p: Product, q: string): number {
  let score = 0;
  if (p.title.toLowerCase().includes(q)) score += 4;
  if (p.brand.toLowerCase().includes(q)) score += 3;
  if (p.category.toLowerCase().includes(q)) score += 2;
  if (p.bullets.some((b) => b.toLowerCase().includes(q))) score += 1;
  return score;
}

export type SortOption = "relevance" | "price_asc" | "price_desc" | "rating" | "newest";

export interface SearchQuery {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  primeOnly?: boolean;
  sort?: SortOption;
}

export async function queryProducts(query: SearchQuery): Promise<Product[]> {
  let results = await fetchAllProducts();
  const q = query.q?.trim().toLowerCase();

  if (q) {
    results = results.filter((p) => relevanceScore(p, q) > 0);
  }
  if (query.category) {
    results = results.filter((p) => p.category === query.category);
  }
  if (typeof query.minPrice === "number" && !Number.isNaN(query.minPrice)) {
    results = results.filter((p) => p.price >= query.minPrice!);
  }
  if (typeof query.maxPrice === "number" && !Number.isNaN(query.maxPrice)) {
    results = results.filter((p) => p.price <= query.maxPrice!);
  }
  if (typeof query.minRating === "number" && !Number.isNaN(query.minRating)) {
    results = results.filter((p) => p.rating >= query.minRating!);
  }
  if (query.primeOnly) {
    results = results.filter((p) => p.prime);
  }

  switch (query.sort) {
    case "price_asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      results.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "newest":
      results.sort((a, b) => b.id.localeCompare(a.id));
      break;
    case "relevance":
    default:
      if (q) {
        results.sort((a, b) => relevanceScore(b, q) - relevanceScore(a, q) || b.rating - a.rating);
      }
      break;
  }

  return results;
}

export async function getCategories(): Promise<Category[]> {
  const all = await fetchAllProducts();
  return Array.from(new Set(all.map((p) => p.category)));
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const all = await fetchAllProducts();
  return all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

/** Rows of products for the homepage, one per department. */
export async function getHomeRows(): Promise<{ title: string; products: Product[] }[]> {
  const all = await fetchAllProducts();
  const categories = Array.from(new Set(all.map((p) => p.category)));
  return categories.map((category) => ({
    title: category,
    products: all.filter((p) => p.category === category),
  }));
}
