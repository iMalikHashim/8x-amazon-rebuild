import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "prime" | "deal" | "neutral";
}

const TONE_CLASSES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  prime: "text-link",
  deal: "bg-price text-white px-1.5 py-0.5 rounded-sm",
  neutral: "text-text-secondary",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`text-xs font-bold ${TONE_CLASSES[tone]}`}>{children}</span>;
}

export function PrimeBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 8L8 4L12 8L16 4L20 8V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V8Z" fill="#00A8E1" />
      </svg>
      prime
    </span>
  );
}
