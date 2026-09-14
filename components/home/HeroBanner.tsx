"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ICON_PHOTOS } from "@/lib/promo-photos";
import { unsplashUrl } from "@/lib/unsplash";
import type { ProductIconKey } from "@/lib/types";

interface Sticker {
  icon: ProductIconKey;
  size: number;
  top: string;
  left: string;
  rotate: number;
}

interface Slide {
  id: string;
  eyebrow: string;
  headline: string;
  bg: string;
  ctaLabel: string;
  ctaHref: string;
  stickers: Sticker[];
}

const SLIDES: Slide[] = [
  {
    id: "back-to-school",
    eyebrow: "Shop Back to School",
    headline: "School essentials at every price",
    bg: "linear-gradient(135deg, #7B4FB5 0%, #4E2679 100%)",
    ctaLabel: "Shop Back to School",
    ctaHref: "/search?category=Back+to+School",
    stickers: [
      { icon: "Backpack", size: 68, top: "14%", left: "56%", rotate: -8 },
      { icon: "Headphones", size: 50, top: "58%", left: "70%", rotate: 6 },
      { icon: "NotebookPen", size: 46, top: "10%", left: "78%", rotate: 10 },
      { icon: "Pencil", size: 40, top: "62%", left: "88%", rotate: -14 },
    ],
  },
  {
    id: "electronics",
    eyebrow: "Deals in Electronics",
    headline: "Upgrade your setup for less",
    bg: "linear-gradient(135deg, #1F4E79 0%, #14314D 100%)",
    ctaLabel: "Shop Electronics",
    ctaHref: "/search?category=Electronics",
    stickers: [
      { icon: "Headphones", size: 64, top: "16%", left: "58%", rotate: 6 },
      { icon: "Laptop", size: 54, top: "56%", left: "72%", rotate: -6 },
      { icon: "Speaker", size: 42, top: "12%", left: "82%", rotate: -10 },
      { icon: "Watch", size: 38, top: "64%", left: "90%", rotate: 12 },
    ],
  },
  {
    id: "gaming",
    eyebrow: "Level Up",
    headline: "Gaming gear for every player",
    bg: "linear-gradient(135deg, #1E7A85 0%, #114A52 100%)",
    ctaLabel: "Shop Gaming",
    ctaHref: "/search?category=Gaming",
    stickers: [
      { icon: "Gamepad2", size: 66, top: "14%", left: "58%", rotate: -6 },
      { icon: "Joystick", size: 48, top: "58%", left: "72%", rotate: 8 },
      { icon: "Monitor", size: 46, top: "10%", left: "80%", rotate: -10 },
      { icon: "Headphones", size: 38, top: "64%", left: "90%", rotate: 10 },
    ],
  },
];

export function HeroBanner() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  const go = (delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative overflow-hidden rounded-sm" style={{ background: slide.bg }}>
      <div className="relative h-[220px] sm:h-[300px] lg:h-[360px] px-6 sm:px-12 flex flex-col justify-center">
        <p className="text-white/90 font-medium text-sm sm:text-base">{slide.eyebrow}</p>
        <h1 className="text-white font-bold text-xl sm:text-4xl lg:text-5xl max-w-[260px] sm:max-w-sm leading-tight mt-1">
          {slide.headline}
        </h1>
        <Link
          href={slide.ctaHref}
          className="mt-4 inline-block bg-white text-text text-sm font-medium px-4 py-2 rounded-lg w-fit shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.97]"
        >
          {slide.ctaLabel}
        </Link>

        {slide.stickers.map(({ icon, size, top, left, rotate }, i) => {
          const photoId = ICON_PHOTOS[icon];
          if (!photoId) return null;
          return (
            <div
              key={i}
              className="hidden sm:block absolute rounded-2xl shadow-lg overflow-hidden border-4 border-white"
              style={{ width: size, height: size, top, left, transform: `rotate(${rotate}deg)` }}
              aria-hidden="true"
            >
              <Image src={unsplashUrl(photoId, size * 3)} alt="" fill sizes={`${size}px`} className="object-cover" />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5"
      >
        <ChevronRight size={22} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
