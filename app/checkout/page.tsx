"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { AddressForm } from "@/components/checkout/AddressForm";
import { PaymentForm, type PaymentInfo } from "@/components/checkout/PaymentForm";
import { OrderReview } from "@/components/checkout/OrderReview";
import { Button } from "@/components/ui/Button";
import { formatUsd } from "@/lib/format";
import { computeShipping, computeTax } from "@/lib/pricing";
import type { Address } from "@/lib/types";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<Address | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  if (!user) {
    return (
      <div className="max-w-[1100px] mx-auto px-2 sm:px-3 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div className="bg-white border border-border rounded-sm p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[360px]">
          <h1 className="text-2xl text-text">Sign in to check out</h1>
          <p className="text-text-secondary max-w-sm">
            We need an account to attach an address and order history to.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-1">
            <Link href="/sign-in?redirect=/checkout">
              <Button variant="cta" className="px-6 py-2 font-medium w-full">
                Sign in
              </Button>
            </Link>
            <Link href="/signup?redirect=/checkout">
              <Button variant="secondary" className="px-6 py-2 font-medium w-full">
                Create account
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-border rounded-sm p-4 h-fit">
          <h2 className="font-bold text-base text-text mb-3">
            Your cart {items.length > 0 ? `(${items.reduce((n, i) => n + i.quantity, 0)} item${items.length === 1 ? "" : "s"})` : ""}
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-text-secondary">Your cart is empty.</p>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-border">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-3 py-2 text-sm">
                    <span className="line-clamp-1">
                      {item.title}
                      {item.quantity > 1 && <span className="text-text-secondary"> x{item.quantity}</span>}
                    </span>
                    <span className="shrink-0">{formatUsd(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border mt-1 pt-2 flex justify-between font-bold text-sm text-text">
                <span>Subtotal</span>
                <span>{formatUsd(subtotal)}</span>
              </div>
            </>
          )}
        </div>
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

  const shipping = computeShipping(subtotal);
  const tax = computeTax(subtotal);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!address || !payment || placing) return;
    setPlacing(true);
    setPlaceError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, cardLast4: payment.last4 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPlaceError(data.error ?? "Something went wrong placing your order. Try again.");
        setPlacing(false);
        return;
      }
      clear();
      router.push(`/checkout/confirmation/${data.orderId}`);
    } catch {
      setPlaceError("Something went wrong placing your order. Try again.");
      setPlacing(false);
    }
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
            <>
              <OrderReview
                address={address}
                payment={payment}
                items={items.map((i) => ({
                  productId: i.productId,
                  slug: i.slug,
                  title: i.title,
                  price: i.price,
                  icon: i.icon,
                  category: i.category,
                  photos: i.photos,
                  quantity: i.quantity,
                }))}
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
                onPlaceOrder={handlePlaceOrder}
                placing={placing}
              />
              {placeError && <p className="text-price text-sm mt-2">{placeError}</p>}
            </>
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
