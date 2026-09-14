import { formatUsd } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import type { Address, OrderItem } from "@/lib/types";
import type { PaymentInfo } from "@/components/checkout/PaymentForm";

interface OrderReviewProps {
  address: Address;
  payment: PaymentInfo;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onPlaceOrder: () => void;
  placing: boolean;
}

export function OrderReview({
  address,
  payment,
  items,
  subtotal,
  shipping,
  tax,
  total,
  onPlaceOrder,
  placing,
}: OrderReviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-sm mb-1">Items ({items.length})</h3>
        <ul className="flex flex-col gap-1 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-4">
              <span className="line-clamp-1">
                {item.title} {item.quantity > 1 && <span className="text-text-secondary">x{item.quantity}</span>}
              </span>
              <span className="shrink-0">{formatUsd(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border pt-3 text-sm flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Items:</span>
          <span>{formatUsd(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping:</span>
          <span>{shipping === 0 ? "FREE" : formatUsd(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated tax:</span>
          <span>{formatUsd(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-base text-price border-t border-border pt-1 mt-1">
          <span>Order total:</span>
          <span>{formatUsd(total)}</span>
        </div>
      </div>

      <div className="border-t border-border pt-3 text-sm">
        <p className="font-bold mb-1">Shipping to</p>
        <p>{address.fullName}</p>
        <p>
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
        </p>
        <p>
          {address.city}, {address.state} {address.zip}
        </p>
      </div>

      <div className="border-t border-border pt-3 text-sm">
        <p className="font-bold mb-1">Payment method</p>
        <p>
          {payment.cardName} - card ending in {payment.last4}
        </p>
      </div>

      <Button
        type="button"
        variant="cta"
        onClick={onPlaceOrder}
        disabled={placing}
        aria-busy={placing}
        className="w-full py-2.5 font-medium text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {placing ? "Placing your order..." : "Place your order"}
      </Button>
    </div>
  );
}
