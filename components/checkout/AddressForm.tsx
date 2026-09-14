"use client";

import { useState } from "react";
import type { Address } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
  "VA", "WA", "WV", "WI", "WY",
];

export function AddressForm({
  initial,
  onSubmit,
}: {
  initial: Address | null;
  onSubmit: (address: Address) => void;
}) {
  const [values, setValues] = useState<Address>(
    initial ?? { fullName: "", line1: "", line2: "", city: "", state: "CA", zip: "" }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof Address, string>> = {};
    if (!values.fullName.trim()) nextErrors.fullName = "Enter a full name.";
    if (!values.line1.trim()) nextErrors.line1 = "Enter a street address.";
    if (!values.city.trim()) nextErrors.city = "Enter a city.";
    if (!/^\d{5}(-\d{4})?$/.test(values.zip.trim())) nextErrors.zip = "Enter a valid ZIP code.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Full name
        <input
          value={values.fullName}
          onChange={set("fullName")}
          className="border border-border-strong rounded-sm px-2 py-1.5"
        />
        {errors.fullName && <span className="text-price text-xs">{errors.fullName}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Address
        <input
          value={values.line1}
          onChange={set("line1")}
          placeholder="Street address"
          className="border border-border-strong rounded-sm px-2 py-1.5"
        />
        {errors.line1 && <span className="text-price text-xs">{errors.line1}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Apt, suite, etc. (optional)
        <input
          value={values.line2}
          onChange={set("line2")}
          className="border border-border-strong rounded-sm px-2 py-1.5"
        />
      </label>

      {/* min-w-0 on every flex child + w-full on the inputs: without both, a
          bare <input>'s default intrinsic width wins over flex-shrink and
          the ZIP field overflows past the row at narrow widths (confirmed
          via measurement: input right edge landed outside its own row's
          right edge at 390px). */}
      <div className="flex flex-wrap gap-3">
        <label className="flex-1 min-w-[120px] flex flex-col gap-1 text-sm">
          City
          <input
            value={values.city}
            onChange={set("city")}
            className="w-full min-w-0 border border-border-strong rounded-sm px-2 py-1.5"
          />
          {errors.city && <span className="text-price text-xs">{errors.city}</span>}
        </label>
        <label className="w-20 min-w-0 flex flex-col gap-1 text-sm">
          State
          <select
            value={values.state}
            onChange={set("state")}
            className="w-full min-w-0 border border-border-strong rounded-sm px-2 py-1.5"
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="w-24 min-w-0 flex flex-col gap-1 text-sm">
          ZIP
          <input
            value={values.zip}
            onChange={set("zip")}
            className="w-full min-w-0 border border-border-strong rounded-sm px-2 py-1.5"
          />
          {errors.zip && <span className="text-price text-xs whitespace-nowrap">{errors.zip}</span>}
        </label>
      </div>

      <Button type="submit" variant="cta" className="w-fit px-6 py-2 font-medium mt-2">
        Use this address
      </Button>
    </form>
  );
}
