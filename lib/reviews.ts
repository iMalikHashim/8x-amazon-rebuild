import type { Product } from "@/lib/types";

export interface ReviewHistogramEntry {
  stars: number;
  percent: number;
}

export interface SyntheticReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
}

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

/** Deterministic shuffle so a product's reviews stay stable across renders. */
function shuffled<T>(arr: T[], rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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

export function getRatingHistogram(rating: number): ReviewHistogramEntry[] {
  const t = Math.max(0, Math.min(1, (rating - 1) / 4));
  const w5 = 5 + 60 * t ** 2;
  const w4 = 10 + 20 * t;
  const w3 = 30 - 20 * Math.abs(t - 0.5) * 2;
  const w2 = 10 + 15 * (1 - t);
  const w1 = 5 + 40 * (1 - t) ** 2;
  const total = w5 + w4 + w3 + w2 + w1;
  const pct = (w: number) => Math.round((w / total) * 100);
  return [
    { stars: 5, percent: pct(w5) },
    { stars: 4, percent: pct(w4) },
    { stars: 3, percent: pct(w3) },
    { stars: 2, percent: pct(w2) },
    { stars: 1, percent: pct(w1) },
  ];
}

export function getSyntheticReviews(product: Product, count = 5): SyntheticReview[] {
  const rand = seededRandom(hashString(product.id));
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

  const reviews: SyntheticReview[] = [];
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
    const date = new Date(Date.now() - daysAgo * 86400000);
    reviews.push({
      id: `${product.id}-r${i}`,
      author: authors[i % authors.length],
      rating,
      date: date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      title,
      body,
      verified: rand() > 0.2,
      helpful: Math.floor(rand() * 120),
    });
  }
  return reviews;
}
