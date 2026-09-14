import { RatingStars } from "@/components/ui/RatingStars";
import { getRatingHistogram, getSyntheticReviews } from "@/lib/reviews";
import type { Product } from "@/lib/types";

export function ReviewsSection({ product }: { product: Product }) {
  const histogram = getRatingHistogram(product.rating);
  const reviews = getSyntheticReviews(product, 5);

  return (
    <section id="reviews" className="bg-white border border-border rounded-sm p-4 sm:p-5 scroll-mt-20">
      <h2 className="text-xl font-bold text-text mb-4">Customer reviews</h2>

      <div className="flex flex-col sm:flex-row gap-8">
        <div className="sm:w-[260px] shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-text-secondary">out of 5</span>
          </div>
          <RatingStars rating={product.rating} size={18} />
          <p className="text-sm text-text-secondary mt-1 mb-4">{product.reviewCount.toLocaleString()} global ratings</p>

          <ul className="flex flex-col gap-1.5">
            {histogram.map((row) => (
              <li key={row.stars} className="flex items-center gap-2 text-sm">
                <span className="w-14 text-link">{row.stars} star</span>
                <div className="flex-1 h-3.5 bg-[#f0f2f2] rounded-sm overflow-hidden border border-border">
                  <div className="h-full bg-star" style={{ width: `${row.percent}%` }} />
                </div>
                <span className="w-10 text-right text-text-secondary">{row.percent}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 flex flex-col divide-y divide-border">
          {reviews.map((review) => (
            <article key={review.id} className="py-4 first:pt-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-nav-secondary text-white text-xs font-bold flex items-center justify-center">
                  {review.author.charAt(0)}
                </div>
                <span className="text-sm font-medium">{review.author}</span>
              </div>
              <RatingStars rating={review.rating} size={13} />
              <h3 className="font-bold text-sm mt-1">{review.title}</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Reviewed in the United States on {review.date}
                {review.verified && <span className="ml-2 text-[#c45500] font-bold">Verified Purchase</span>}
              </p>
              <p className="text-sm mt-2">{review.body}</p>
              <p className="text-xs text-text-secondary mt-2">{review.helpful} people found this helpful</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
