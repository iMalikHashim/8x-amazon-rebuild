import { Star, StarHalf } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: number;
}

export function RatingStars({ rating, reviewCount, size = 14 }: RatingStarsProps) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const roundedUp = rating - full >= 0.75;
  const fullStars = roundedUp ? full + 1 : full;
  const empty = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      <div className="flex text-star">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`f${i}`} size={size} fill="currentColor" strokeWidth={0} />
        ))}
        {hasHalf && <StarHalf size={size} fill="currentColor" strokeWidth={0} />}
        {Array.from({ length: Math.max(empty, 0) }).map((_, i) => (
          <Star key={`e${i}`} size={size} fill="none" className="text-border-strong" />
        ))}
      </div>
      {typeof reviewCount === "number" && (
        <span className="text-link text-xs hover:text-link-hover hover:underline">
          {reviewCount.toLocaleString()}
        </span>
      )}
    </div>
  );
}
