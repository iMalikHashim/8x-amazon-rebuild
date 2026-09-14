"use client";

import { useState } from "react";
import { isValidCardNumber, isValidExpiry, isValidCvc } from "@/lib/validation";
import { Button } from "@/components/ui/Button";

export interface PaymentInfo {
  cardName: string;
  last4: string;
}

export function PaymentForm({ onSubmit }: { onSubmit: (payment: PaymentInfo) => void }) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!cardName.trim()) nextErrors.cardName = "Enter the name on the card.";
    if (!isValidCardNumber(cardNumber)) nextErrors.cardNumber = "Enter a valid card number.";
    if (!isValidExpiry(expiry)) nextErrors.expiry = "Enter a valid, unexpired MM/YY date.";
    if (!isValidCvc(cvc)) nextErrors.cvc = "Enter a valid security code.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const digits = cardNumber.replace(/\D/g, "");
    onSubmit({ cardName, last4: digits.slice(-4) });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <p className="text-xs text-text-secondary -mt-1">
        No real payment is processed. Use any number that passes a Luhn check, e.g.
        4242 4242 4242 4242.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Name on card
        <input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="border border-border-strong rounded-sm px-2 py-1.5"
        />
        {errors.cardName && <span className="text-price text-xs">{errors.cardName}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Card number
        <input
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          className="border border-border-strong rounded-sm px-2 py-1.5"
        />
        {errors.cardNumber && <span className="text-price text-xs">{errors.cardNumber}</span>}
      </label>

      <div className="flex gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Expiry (MM/YY)
          <input
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder="08/28"
            className="border border-border-strong rounded-sm px-2 py-1.5 w-28"
          />
          {errors.expiry && <span className="text-price text-xs">{errors.expiry}</span>}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          CVC
          <input
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            inputMode="numeric"
            placeholder="123"
            className="border border-border-strong rounded-sm px-2 py-1.5 w-20"
          />
          {errors.cvc && <span className="text-price text-xs">{errors.cvc}</span>}
        </label>
      </div>

      <Button type="submit" variant="cta" className="w-fit px-6 py-2 font-medium mt-2">
        Use this payment method
      </Button>
    </form>
  );
}
