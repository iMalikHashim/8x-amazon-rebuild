import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

/** Lazily creates the client so importing this module never throws - only
 * actually running a query without DATABASE_URL set does. This lets `next
 * build` collect page data (which imports every route module) without a
 * live database, e.g. for a first local build before DATABASE_URL exists. */
function getDb(): Db {
  if (cached) return cached;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. See README.md for the Neon setup steps.");
  }
  cached = drizzle(neon(process.env.DATABASE_URL), { schema });
  return cached;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
