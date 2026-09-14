"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useOrders } from "@/lib/orders-context";
import { AddressForm } from "@/components/checkout/AddressForm";
import { PaymentForm, type PaymentInfo } from "@/components/checkout/PaymentForm";
import { OrderReview } from "@/components/checkout/OrderReview";
import { Button } from "@/components/ui/Button";
import { formatUsd } from "@/lib/format";
import type { Address, Order } from "@/lib/types";

const FREE_SHIPPING_THRESHOLD = 35;
const FLAT_SHIPPING = 5.99;
const TAX_RATE = 0.08;

function generateOrderId(): string {
  const rand = (digits: number) =>
    Math.floor(Math.random() * 10 ** digits)
      .toString()
      .padStart(digits, "0");
  return `${rand(3)}-${rand(7)}-${rand(7)}`;
}

function formatDeliveryDate(daysFromNow: number): string {
  const date = new Date(Date.now() + daysFromNow * 86400000);
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { placeOrder } = useOrders();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<Address | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [placing, setPlacing] = useState(false);

  if (!user) {
    return (
      <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-12 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl text-text">Sign in to check out</h1>
        <p className="text-text-secondary max-w-sm">
          We need an account (mocked - any email works) to attach an address and order history to.
        </p>
        <Link href="/sign-in?redirect=/checkout">
          <Button variant="cta" className="px-6 py-2 font-medium">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-12 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl text-text">Your cart is empty</h1>
        <p className="text-text-secondary max-w-sm">Add something to your cart before checking out.</p>
        <Link href="/">
          <Button variant="cta" className="px-6 py-2 font-medium">
            Continue shopping
          </Button>
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = () => {
    if (!address || !payment) return;
    setPlacing(true);
    const order: Order = {
      id: generateOrderId(),
      placedAt: new Date().toISOString(),
      items: items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        title: i.title,
        price: i.price,
        icon: i.icon,
        quantity: i.quantity,
      })),
      subtotal,
      shipping,
      tax,
      total,
      address,
      cardLast4: payment.last4,
      estimatedDelivery: formatDeliveryDate(3),
    };
    placeOrder(order);
    clear();
    router.push(`/checkout/confirmation/${order.id}`);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-2 sm:px-3 py-4 flex flex-col lg:flex-row gap-4 items-start">
      <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
        <h1 className="text-2xl text-text">Checkout</h1>

        <StepCard
          number={1}
          title="Shipping address"
          active={step === 1}
          done={step > 1}
          summary={address ? `${address.fullName}, ${address.line1}, ${address.city}, ${address.state} ${address.zip}` : ""}
          onEdit={() => setStep(1)}
        >
          <AddressForm
            initial={address}
            onSubmit={(a) => {
              setAddress(a);
              setStep(2);
            }}
          />
        </StepCard>

        <StepCard
          number={2}
          title="Payment method"
          active={step === 2}
          done={step > 2}
          summary={payment ? `${payment.cardName} - ending in ${payment.last4}` : ""}
          onEdit={() => setStep(2)}
          disabled={!address}
        >
          <PaymentForm
            onSubmit={(p) => {
              setPayment(p);
              setStep(3);
            }}
          />
        </StepCard>

        <StepCard number={3} title="Review your order" active={step === 3} done={false} disabled={!address || !payment}>
          {address && payment && (
            <OrderReview
              address={address}
              payment={payment}
              items={items.map((i) => ({
                productId: i.productId,
                slug: i.slug,
                title: i.title,
                price: i.price,
                icon: i.icon,
                quantity: i.quantity,
              }))}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              placing={placing}
            />
          )}
        </StepCard>
      </div>

      <div className="w-full lg:w-[280px] shrink-0 border border-border rounded-sm p-4 h-fit flex flex-col gap-2 text-sm">
        <h2 className="font-bold text-base mb-1">Order Summary</h2>
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
        <div className="flex justify-between font-bold text-price text-base border-t border-border pt-2 mt-1">
          <span>Order total:</span>
          <span>{formatUsd(total)}</span>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  active,
  done,
  summary,
  onEdit,
  disabled,
  children,
}: {
  number: number;
  title: string;
  active: boolean;
  done: boolean;
  summary?: string;
  onEdit?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white border rounded-sm p-4 sm:p-5 ${active ? "border-accent" : "border-border"} ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-lg text-text">
          {number}. {title}
        </h2>
        {done && onEdit && (
          <button type="button" onClick={onEdit} className="text-sm text-link hover:text-link-hover hover:underline">
            Change
          </button>
        )}
      </div>
      {done && summary ? (
        <p className="text-sm text-text-secondary">{summary}</p>
      ) : active && !disabled ? (
        <div className="mt-3">{children}</div>
      ) : null}
    </div>
  );
}
