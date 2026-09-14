"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Backpack,
  Headphones,
  NotebookPen,
  Pencil,
  Laptop,
  Speaker,
  Watch,
  Gamepad2,
  Joystick,
  Monitor,
  type LucideIcon,
} from "lucide-react";

interface Sticker {
  Icon: LucideIcon;
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
      { Icon: Backpack, size: 68, top: "14%", left: "56%", rotate: -8 },
      { Icon: Headphones, size: 50, top: "58%", left: "70%", rotate: 6 },
      { Icon: NotebookPen, size: 46, top: "10%", left: "78%", rotate: 10 },
      { Icon: Pencil, size: 40, top: "62%", left: "88%", rotate: -14 },
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
      { Icon: Headphones, size: 64, top: "16%", left: "58%", rotate: 6 },
      { Icon: Laptop, size: 54, top: "56%", left: "72%", rotate: -6 },
      { Icon: Speaker, size: 42, top: "12%", left: "82%", rotate: -10 },
      { Icon: Watch, size: 38, top: "64%", left: "90%", rotate: 12 },
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
      { Icon: Gamepad2, size: 66, top: "14%", left: "58%", rotate: -6 },
      { Icon: Joystick, size: 48, top: "58%", left: "72%", rotate: 8 },
      { Icon: Monitor, size: 46, top: "10%", left: "80%", rotate: -10 },
      { Icon: Headphones, size: 38, top: "64%", left: "90%", rotate: 10 },
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
          className="mt-4 inline-block bg-white text-text text-sm font-medium px-4 py-2 rounded-full w-fit hover:bg-white/90"
        >
          {slide.ctaLabel}
        </Link>

        {slide.stickers.map(({ Icon, size, top, left, rotate }, i) => (
          <div
            key={i}
            className="hidden sm:flex absolute items-center justify-center bg-white rounded-2xl shadow-lg"
            style={{ width: size, height: size, top, left, transform: `rotate(${rotate}deg)` }}
            aria-hidden="true"
          >
            <Icon size={size * 0.55} className="text-text" strokeWidth={1.5} />
          </div>
        ))}
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
