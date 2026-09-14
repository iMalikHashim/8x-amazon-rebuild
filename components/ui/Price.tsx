import { discountPercent, formatPrice } from "@/lib/format";

interface PriceProps {
  price: number;
  listPrice?: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<PriceProps["size"]>, { symbol: string; dollars: string; cents: string }> = {
  sm: { symbol: "text-xs", dollars: "text-lg", cents: "text-xs" },
  md: { symbol: "text-sm", dollars: "text-2xl", cents: "text-sm" },
  lg: { symbol: "text-base", dollars: "text-3xl", cents: "text-base" },
};

export function Price({ price, listPrice, size = "md" }: PriceProps) {
  const { dollars, cents } = formatPrice(price);
  const discount = discountPercent(price, listPrice);
  const cls = SIZE_CLASSES[size];

  return (
    <div className="flex flex-col gap-0.5">
      {discount !== null && (
        <div className="flex items-baseline gap-2">
          <span className="text-price font-medium text-sm">-{discount}%</span>
        </div>
      )}
      <div className="flex items-baseline text-text">
        <span className={`${cls.symbol} relative top-[-0.5em] mr-0.5`}>$</span>
        <span className={`${cls.dollars} font-medium leading-none`}>{dollars}</span>
        <span className={`${cls.cents} relative top-[-0.5em] ml-0.5`}>{cents}</span>
      </div>
      {listPrice && discount !== null && (
        <span className="text-xs text-text-secondary">
          List: <span className="line-through">${listPrice.toFixed(2)}</span>
        </span>
      )}
    </div>
  );
}
