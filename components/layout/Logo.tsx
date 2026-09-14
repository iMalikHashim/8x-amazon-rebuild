import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Amazon Rebuild home"
      className="inline-flex flex-col items-start px-2 py-1 hover:outline hover:outline-1 hover:outline-white/70 rounded-xs shrink-0"
    >
      <span className="text-2xl font-bold text-white tracking-tight leading-none">amazon</span>
      <svg width="62" height="12" viewBox="0 0 62 12" fill="none" className="-mt-0.5" aria-hidden="true">
        <path
          d="M2 3C14 12 46 12 58 3"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M53 1.5L59 3L55.5 8" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </Link>
  );
}
