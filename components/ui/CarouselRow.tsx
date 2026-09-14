"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

interface CarouselRowProps {
  title: string;
  seeAllHref?: string;
  children: ReactNode;
}

export function CarouselRow({ title, seeAllHref, children }: CarouselRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="bg-white rounded-sm border border-border p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-text">{title}</h2>
        {seeAllHref && (
          <a href={seeAllHref} className="text-sm text-link hover:text-link-hover hover:underline">
            See more
          </a>
        )}
      </div>

      <div className="relative group">
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1"
        >
          {children}
        </div>

        <button
          type="button"
          aria-label={`Scroll ${title} left`}
          onClick={() => scrollBy(-600)}
          className="hidden sm:flex absolute left-0 top-0 bottom-0 w-9 items-center justify-center bg-white/90 border-r border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          onClick={() => scrollBy(600)}
          className="hidden sm:flex absolute right-0 top-0 bottom-0 w-9 items-center justify-center bg-white/90 border-l border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
