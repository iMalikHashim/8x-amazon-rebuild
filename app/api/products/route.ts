import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

/** Full catalog, for client-side search autocomplete only (product/search
 * pages fetch straight from the DB server-side and never hit this). */
export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}
