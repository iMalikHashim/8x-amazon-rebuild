import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "cta" | "secondary" | "buynow" | "link";
}

/**
 * Flat, solid-fill "Material"-style buttons: no gradient, a real elevation
 * shadow that grows on hover, and a slight press-down scale on click for
 * tactile feedback - replacing the earlier gradient-pill-with-border look.
 */
const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  cta: "bg-cta-to text-text shadow-sm hover:shadow-md hover:brightness-95",
  buynow: "bg-accent text-white shadow-sm hover:shadow-md hover:brightness-95",
  secondary: "bg-[#f0f2f2] text-text shadow-sm hover:shadow-md hover:bg-[#e3e6e6]",
  link: "text-link hover:text-link-hover hover:underline",
};

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  const base =
    variant === "link"
      ? "text-sm"
      : "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97]";
  return <button className={`${base} ${VARIANT_CLASSES[variant]} ${className}`} {...props} />;
}
