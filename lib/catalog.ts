import { products } from "@/data/products";
import type { Category, Product } from "@/lib/types";

export async function getProducts(): Promise<Product[]> {
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  return products.filter((p) => p.category === category);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((p) => relevanceScore(p, q) > 0);
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
  let results = [...products];
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
  return Array.from(new Set(products.map((p) => p.category)));
}

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

/** Rows of products for the homepage, one per department. */
export async function getHomeRows(): Promise<{ title: string; products: Product[] }[]> {
  const categories = await getCategories();
  return categories.map((category) => ({
    title: category,
    products: products.filter((p) => p.category === category),
  }));
}
