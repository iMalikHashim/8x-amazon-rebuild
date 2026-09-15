"use client";

import { useMemo, useState } from "react";
import { Gift, PartyPopper, Heart, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

const DESIGNS = [
  { key: "Classic", icon: Gift, gradient: "from-[#1F2933] to-[#3E4C59]" },
  { key: "Birthday", icon: PartyPopper, gradient: "from-[#C13584] to-[#833AB4]" },
  { key: "Thank You", icon: Heart, gradient: "from-[#C4452E] to-[#E08B3E]" },
] as const;

const AMOUNTS = [25, 50, 100] as const;

export function GiftCardPicker({ giftCards }: { giftCards: Product[] }) {
  const { addItem } = useCart();
  const [design, setDesign] = useState<(typeof DESIGNS)[number]["key"]>("Classic");
  const [amount, setAmount] = useState<(typeof AMOUNTS)[number]>(50);
  const [added, setAdded] = useState(false);

  const selectedDesign = DESIGNS.find((d) => d.key === design)!;
  const matchingProduct = useMemo(
    () => giftCards.find((p) => p.title.includes(design) && p.price === amount),
    [giftCards, design, amount]
  );

  const handleAddToCart = () => {
    if (!matchingProduct) return;
    addItem(matchingProduct, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div
        className={`shrink-0 w-full lg:w-[360px] aspect-[16/10] rounded-lg bg-linear-to-br ${selectedDesign.gradient} text-white p-6 flex flex-col justify-between shadow-md`}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">amazon</span>
          <selectedDesign.icon size={28} />
        </div>
        <div>
          <p className="text-sm text-white/80">Gift Card</p>
          <p className="text-3xl font-bold">${amount}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h2 className="font-bold text-base text-text mb-2">Choose a design</h2>
          <div className="flex gap-3">
            {DESIGNS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDesign(d.key)}
                aria-pressed={design === d.key}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border-2 transition-colors ${
                  design === d.key ? "border-accent" : "border-border hover:border-border-strong"
                }`}
              >
                {design === d.key && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <d.icon size={22} className="text-text" />
                <span className="text-xs font-medium text-text">{d.key}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-base text-text mb-2">Choose an amount</h2>
          <div className="flex gap-3">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(a)}
                aria-pressed={amount === a}
                className={`px-5 py-2.5 rounded-lg border-2 font-bold text-text transition-colors ${
                  amount === a ? "border-accent bg-[#fff8ef]" : "border-border hover:border-border-strong"
                }`}
              >
                ${a}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="cta"
          onClick={handleAddToCart}
          disabled={!matchingProduct}
          className="w-fit px-6 py-2.5 font-medium"
        >
          {added ? "Added to Cart ✓" : `Add $${amount} ${design} Gift Card to Cart`}
        </Button>

        <p className="text-xs text-text-secondary max-w-md">
          Digital delivery, redeemable toward anything in the catalog, never expires. No real
          payment is processed anywhere on this rebuild - see the README for details.
        </p>
      </div>
    </div>
  );
}
