/** Lives here (a plain module, not "use client") rather than in
 * compare-context.tsx, because a Server Component importing a plain
 * constant from a "use client" file does not reliably get its real value
 * across that boundary - found the hard way: it silently resolved to
 * something that made `.slice(0, MAX_COMPARE_ITEMS)` truncate to empty. */
export const MAX_COMPARE_ITEMS = 4;

/** Indices of the "best" value(s) in a row - all of them, in case of a tie. */
export function bestIndices(values: number[], mode: "min" | "max"): Set<number> {
  if (values.length === 0) return new Set();
  const target = mode === "min" ? Math.min(...values) : Math.max(...values);
  return new Set(values.map((v, i) => (v === target ? i : -1)).filter((i) => i >= 0));
}

/** True when a row's values aren't all the same - used to flag rows (brand,
 * category, Prime eligibility) where the products being compared actually differ. */
export function valuesDiffer<T>(values: T[]): boolean {
  return new Set(values).size > 1;
}

/** Builds the /compare URL for a given set of product slugs. */
export function compareHref(slugs: string[]): string {
  return `/compare?slugs=${encodeURIComponent(slugs.join(","))}`;
}

/** Every bullet in the catalog is written as "LABEL — detail" (a handful
 * use "--" instead of an em dash) - split on that to turn free-text
 * marketing copy into a real label/value pair for the compare page. */
export function splitBullet(bullet: string): { label: string; detail: string } {
  const separator = bullet.includes(" — ") ? " — " : bullet.includes(" -- ") ? " -- " : null;
  if (!separator) return { label: "", detail: bullet };
  const [label, ...rest] = bullet.split(separator);
  return { label, detail: rest.join(separator) };
}
