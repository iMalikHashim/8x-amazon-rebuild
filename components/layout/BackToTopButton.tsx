"use client";

export function BackToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="w-full bg-[#37475a] hover:bg-[#485769] text-center text-sm py-3"
    >
      Back to top
    </button>
  );
}
