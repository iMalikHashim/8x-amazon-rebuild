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
  return products.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
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
