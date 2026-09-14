"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { categories } from "@/data/categories";
import { getSuggestions, suggestionHref, suggestionKey, type Suggestion } from "@/lib/suggestions";
import { HighlightMatch } from "@/components/ui/HighlightMatch";
import { ProductImage } from "@/components/product/ProductImage";
import type { Category } from "@/lib/types";

const DEBOUNCE_MS = 150;

export function SearchBar() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = getSuggestions(query, category);
      setSuggestions(next);
      setActiveIndex(-1);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query, category]);

  const listboxId = "search-suggestions";
  const activeId = useMemo(
    () => (activeIndex >= 0 && suggestions[activeIndex] ? `suggestion-${suggestionKey(suggestions[activeIndex])}` : undefined),
    [activeIndex, suggestions]
  );

  const go = (s: Suggestion) => {
    setOpen(false);
    router.push(suggestionHref(s));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        go(suggestions[activeIndex]);
      } else {
        setOpen(false);
      }
    }
  };

  return (
    <form
      ref={formRef}
      action="/search"
      method="get"
      className="relative flex-1"
      role="search"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      {/* Corner rounding lives on this inner wrapper, not the form itself -
          overflow-hidden here would otherwise clip the suggestions dropdown
          below, which is a sibling positioned relative to the form. Found
          by testing: computed style on the dropdown reported
          display/visibility/opacity all correct with the right geometry,
          yet nothing painted - the form's own overflow-hidden was clipping
          it silently. */}
      <div className="flex h-10 rounded-md overflow-hidden">
        <select
          name="category"
          aria-label="Search category"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "")}
          className="hidden md:block bg-[#f3f3f3] text-text text-sm px-2 border-r border-border-strong focus:outline-none max-w-[110px] truncate"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="q"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search Amazon"
          aria-label="Search Amazon"
          autoComplete="off"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          className="flex-1 min-w-0 px-3 text-sm text-text placeholder:text-text-secondary bg-white focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="bg-accent hover:bg-[#e88a00] px-4 flex items-center justify-center shrink-0"
        >
          <Search size={20} className="text-text" strokeWidth={2.5} />
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 bg-white text-text border border-border-strong rounded-sm shadow-lg overflow-hidden z-40"
        >
          {suggestions.map((s, i) => {
            const key = suggestionKey(s);
            const active = i === activeIndex;
            return (
              <li key={key} id={`suggestion-${key}`} role="option" aria-selected={active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(s)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm ${active ? "bg-page-bg" : "hover:bg-page-bg"}`}
                >
                  {s.type === "category" ? (
                    <>
                      <Search size={16} className="text-text-secondary shrink-0" aria-hidden="true" />
                      <span>
                        {query} in <HighlightMatch text={s.category} query={query} />
                      </span>
                    </>
                  ) : (
                    <>
                      <ProductImage product={s.product} className="w-8 h-8 rounded-sm shrink-0" sizes="32px" />
                      <span className="line-clamp-1">
                        <HighlightMatch text={s.product.title} query={query} />
                      </span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
}
