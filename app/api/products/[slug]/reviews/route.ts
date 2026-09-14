import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, reviews } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { getProductReviews } from "@/lib/reviews-db";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const result = await getProductReviews(slug, user?.id ?? null);
  if (!result) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const { rating, reviewCount, histogram, reviews: reviewList } = result;
  return NextResponse.json({ rating, reviewCount, histogram, reviews: reviewList });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to write a review." }, { status: 401 });

  const { slug } = await params;
  const [product] = await db
    .select({ id: products.id, rating: products.rating, reviewCount: products.reviewCount })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a star rating from 1 to 5." }, { status: 400 });
  }
  if (!title) return NextResponse.json({ error: "Give your review a title." }, { status: 400 });
  if (!text) return NextResponse.json({ error: "Write a few words about the product." }, { status: 400 });

  const newAverage = (product.rating * product.reviewCount + rating) / (product.reviewCount + 1);
  const newCount = product.reviewCount + 1;

  await db.batch([
    db.insert(reviews).values({
      productId: product.id,
      userId: user.id,
      authorName: user.name,
      rating,
      title,
      body: text,
      verified: false,
      helpful: 0,
    }),
    db
      .update(products)
      .set({ rating: Math.round(newAverage * 10) / 10, reviewCount: newCount })
      .where(eq(products.id, product.id)),
  ]);

  return NextResponse.json({ ok: true });
}
