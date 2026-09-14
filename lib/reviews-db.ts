import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, reviews } from "@/lib/db/schema";

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
  date: string;
  isMine: boolean;
}

export interface ReviewHistogramEntry {
  stars: number;
  percent: number;
}

export async function getProductReviews(slug: string, currentUserId: string | null) {
  const [product] = await db
    .select({ id: products.id, rating: products.rating, reviewCount: products.reviewCount })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) return null;

  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, product.id))
    .orderBy(desc(reviews.createdAt));

  const histogram: ReviewHistogramEntry[] = [5, 4, 3, 2, 1].map((stars) => {
    const count = rows.filter((r) => r.rating === stars).length;
    return { stars, percent: rows.length ? Math.round((count / rows.length) * 100) : 0 };
  });

  const clientReviews: ProductReview[] = rows.map((r) => ({
    id: r.id,
    author: r.authorName,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    helpful: r.helpful,
    date: r.createdAt.toISOString(),
    isMine: currentUserId ? r.userId === currentUserId : false,
  }));

  return {
    productId: product.id,
    rating: product.rating,
    reviewCount: product.reviewCount,
    histogram,
    reviews: clientReviews,
  };
}
