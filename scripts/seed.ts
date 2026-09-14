/**
 * Seeds the Neon database from data/products.ts. Safe to re-run: clears
 * products/reviews first (cart_items/order_items/orders cascade-delete
 * off products, so this also wipes any test orders - fine for a seed
 * script, never run this against data you want to keep).
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { db } from "../lib/db";
import { products, reviews } from "../lib/db/schema";
import { products as fixtureProducts } from "../data/products";

const REVIEWERS = [
  "Alex M.", "Jordan P.", "Sam K.", "Taylor R.", "Morgan B.",
  "Casey L.", "Jamie T.", "Riley S.", "Drew H.", "Quinn A.",
];
const TITLES_POSITIVE = [
  "Exactly as described", "Great value", "Highly recommend", "Works perfectly",
  "Better than expected", "Would buy again", "Very happy with this",
];
const TITLES_MIXED = ["Does the job", "Good, with a caveat", "Mostly satisfied", "Fine for the price"];
const TITLES_NEGATIVE = ["Not what I expected", "Had some issues"];

const BODIES_POSITIVE = [
  "This has been solid since day one. Setup was quick and it works exactly as advertised.",
  "Great build quality for the price. Would buy again without hesitation.",
  "Exceeded my expectations. Shipped fast and arrived well packaged.",
  "Been using this for a few weeks now and it's held up well. No complaints.",
  "Does exactly what the listing says. Easy to set up, feels well made.",
];
const BODIES_MIXED = [
  "Does what it's supposed to, though I wish a couple of details were different.",
  "Good overall, but it took a little longer to arrive than expected.",
  "Solid for the price, just don't expect premium extras.",
];
const BODIES_NEGATIVE = [
  "It's okay, but I expected a bit more given the price point.",
  "Had to exchange the first unit; the replacement has been fine so far.",
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function seededRandom(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function shuffled<T>(arr: T[], rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function syntheticReviewsFor(productId: string, count = 5) {
  const rand = seededRandom(hashString(productId));
  const authors = shuffled(REVIEWERS, rand);
  const posTitles = shuffled(TITLES_POSITIVE, rand);
  const posBodies = shuffled(BODIES_POSITIVE, rand);
  const mixedTitles = shuffled(TITLES_MIXED, rand);
  const mixedBodies = shuffled(BODIES_MIXED, rand);
  const negTitles = shuffled(TITLES_NEGATIVE, rand);
  const negBodies = shuffled(BODIES_NEGATIVE, rand);

  let posCursor = 0;
  let mixedCursor = 0;
  let negCursor = 0;

  const out = [];
  for (let i = 0; i < count; i++) {
    const roll = rand();
    let rating: number;
    let title: string;
    let body: string;
    if (roll < 0.65) {
      rating = 5;
      title = posTitles[posCursor % posTitles.length];
      body = posBodies[posCursor % posBodies.length];
      posCursor++;
    } else if (roll < 0.88) {
      rating = 4;
      title = posTitles[posCursor % posTitles.length];
      body = posBodies[posCursor % posBodies.length];
      posCursor++;
    } else if (roll < 0.96) {
      rating = 3;
      title = mixedTitles[mixedCursor % mixedTitles.length];
      body = mixedBodies[mixedCursor % mixedBodies.length];
      mixedCursor++;
    } else {
      rating = 2;
      title = negTitles[negCursor % negTitles.length];
      body = negBodies[negCursor % negBodies.length];
      negCursor++;
    }
    const daysAgo = 3 + Math.floor(rand() * 340);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);
    out.push({
      authorName: authors[i % authors.length],
      rating,
      title,
      body,
      verified: rand() > 0.2,
      helpful: Math.floor(rand() * 120),
      createdAt,
    });
  }
  return out;
}

async function main() {
  console.log(`Seeding ${fixtureProducts.length} products...`);

  await db.delete(reviews);
  await db.delete(products);

  await db.insert(products).values(
    fixtureProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      category: p.category,
      price: p.price,
      listPrice: p.listPrice ?? null,
      rating: p.rating,
      reviewCount: p.reviewCount,
      prime: p.prime,
      bullets: p.bullets,
      description: p.description,
      icon: p.icon,
      photos: p.photos ?? null,
    }))
  );
  console.log("Products inserted.");

  const reviewRows = fixtureProducts.flatMap((p) =>
    syntheticReviewsFor(p.id, 5).map((r) => ({
      productId: p.id,
      userId: null,
      ...r,
    }))
  );
  await db.insert(reviews).values(reviewRows);
  console.log(`Inserted ${reviewRows.length} seed reviews.`);

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
