"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCompare } from "@/lib/compare-context";
import { compareHref, MAX_COMPARE_ITEMS } from "@/lib/compare";
import { ProductImage } from "@/components/product/ProductImage";

const TRAY_HEIGHT = "h-[68px]";

export function CompareTray() {
  const { entries, count, remove, clear } = useCompare();

  if (count === 0) return null;

  const canCompare = count >= 2;

  return (
    <>
      {/* In-flow spacer so the fixed tray below never covers page/footer
          content - same fixed height as the tray itself, always in sync. */}
      <div aria-hidden="true" className={TRAY_HEIGHT} />
      <div
        role="region"
        aria-label="Product comparison tray"
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] ${TRAY_HEIGHT}`}
      >
        <div className="max-w-[1500px] mx-auto h-full px-2 sm:px-3 py-2 flex items-center gap-3">
          <span className="shrink-0 text-sm font-bold text-text hidden sm:inline">
            Compare ({count}/{MAX_COMPARE_ITEMS})
          </span>

          {/* Only this strip scrolls - the count label and the actions
              below stay pinned in view no matter how many items are
              selected, so "Compare now" is never scrolled off-screen
              (found via a real 390px check: with the whole row scrolling
              as one, the button's right edge landed off the viewport). */}
          <ul className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto">
            {entries.map((entry) => (
              <li key={entry.id} className="relative shrink-0">
                <ProductImage product={entry} className="w-11 h-11 rounded-sm" sizes="44px" />
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  aria-label={`Remove ${entry.title} from comparison`}
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-text text-white hover:bg-black"
                >
                  <X size={10} strokeWidth={3} />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3 shrink-0">
            <button type="button" onClick={clear} className="text-xs text-link hover:text-link-hover hover:underline">
              Clear all
            </button>
            {canCompare ? (
              <Link
                href={compareHref(entries.map((e) => e.slug))}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-cta-to text-text shadow-sm hover:shadow-md hover:brightness-95 transition-all duration-150 active:scale-[0.97]"
              >
                Compare now
              </Link>
            ) : (
              <span className="text-xs text-text-secondary" title="Add at least one more item to compare">
                Add 1 more to compare
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
