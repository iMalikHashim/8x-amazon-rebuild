import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "cta" | "secondary" | "buynow" | "link";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  cta:
    "bg-linear-to-b from-cta-from to-cta-to border border-cta-border text-text " +
    "hover:brightness-95 active:brightness-90 shadow-sm",
  buynow:
    "bg-linear-to-b from-[#f0a952] to-accent border border-[#a05a00] text-text " +
    "hover:brightness-95 active:brightness-90 shadow-sm",
  secondary:
    "bg-linear-to-b from-white to-[#e7e9ec] border border-border-strong text-text " +
    "hover:brightness-95 active:brightness-90 shadow-sm",
  link: "text-link hover:text-link-hover hover:underline",
};

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  const base =
    variant === "link"
      ? "text-sm"
      : "rounded-full px-4 py-1.5 text-sm font-normal";
  return <button className={`${base} ${VARIANT_CLASSES[variant]} ${className}`} {...props} />;
}
