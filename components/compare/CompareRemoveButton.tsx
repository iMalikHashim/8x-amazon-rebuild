"use client";

import { useRouter } from "next/navigation";
import { useCompare } from "@/lib/compare-context";
import { compareHref } from "@/lib/compare";

export function CompareRemoveButton({
  productId,
  remainingSlugs,
}: {
  productId: string;
  remainingSlugs: string[];
}) {
  const router = useRouter();
  const { remove } = useCompare();

  return (
    <button
      type="button"
      onClick={() => {
        remove(productId);
        router.push(remainingSlugs.length > 0 ? compareHref(remainingSlugs) : "/");
      }}
      className="text-xs text-link hover:text-link-hover hover:underline"
    >
      Remove
    </button>
  );
}
