import Link from "next/link";
import { formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/Button";

const FREE_SHIPPING_THRESHOLD = 35;

export function CartSummary({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const qualifies = remaining <= 0;

  return (
    <div className="border border-border rounded-sm p-4 flex flex-col gap-3 w-full lg:w-[300px] shrink-0 h-fit">
      {qualifies ? (
        <p className="text-sm text-success">Your order qualifies for FREE Shipping.</p>
      ) : (
        <p className="text-sm">
          Add <span className="font-bold">{formatUsd(remaining)}</span> more to your order to qualify
          for FREE Shipping.
        </p>
      )}

      <p className="text-lg">
        Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"}):{" "}
        <span className="font-bold">{formatUsd(subtotal)}</span>
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" defaultChecked className="accent-accent" />
        This order contains a gift
      </label>

      <Link href="/checkout" className="w-full">
        <Button variant="cta" className="w-full py-2 font-medium" disabled={itemCount === 0}>
          Proceed to Checkout
        </Button>
      </Link>
    </div>
  );
}
