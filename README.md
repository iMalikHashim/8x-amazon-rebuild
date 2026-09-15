# Amazon Rebuild

A from-scratch rebuild of the amazon.com shopping experience, built for the 8x take-home
assignment in a 24-hour window.

**Live:** https://8x-amazon-rebuild.vercel.app
**Repo:** https://github.com/iMalikHashim/8x-amazon-rebuild

## The scope decision

Amazon.com is too large to rebuild in full in a day, so this went deep on one thing instead
of shallow on many: **the complete purchase loop, end to end, with a real backend** — browse,
search, product detail, cart, checkout, account, orders, and reviews all actually work and
actually persist, rather than a wider set of surfaces that only look right until you click
them. A grader can sign up, buy something, sign out, sign back in on a different browser, and
their order is still there.

## What's cut, and why

- **Prime Video, Amazon Music, Kindle, Amazon Appstore, Amazon Live** — different Amazon
  products entirely, not shopping.
- **Sell / Seller Central** — the seller side of the marketplace is a different product from
  the buyer side this rebuild is about.
- **Coupons, Registry, Lists, Recommendations, Browsing History, Watchlist, Content &
  Devices, Memberships, International Shopping, Amazon Second Chance** — all real Amazon
  features, all peripheral to "does the shopping loop work." Every one of these routes to an
  honest, on-brand page that says so and points back to shopping, instead of a dead link.
- **Real payment processing** — checkout is fully real as a *flow* (address → payment form →
  review → server-computed total → order), but no money moves anywhere. Card details are
  validated client-side (Luhn check) and never sent to the server; only the last 4 digits are
  stored, purely for display on the order history/confirmation pages.
- **Multi-currency / i18n** — single currency, single locale.

Cutting these was the right call for the time budget: none of them change whether the actual
shopping loop is any good, and building even one of them to a non-fake standard would have
eaten a disproportionate share of 24 hours.

## What's real

- **Auth** — bcrypt-hashed passwords, opaque session tokens stored server-side in Postgres,
  set as an httpOnly/secure/sameSite cookie. Never localStorage, never a JWT.
- **Catalog, orders, and reviews** — all persisted in Postgres, all scoped to the signed-in
  user, all survive across browsers and devices.
- **Order totals are computed server-side** from the user's actual current cart at the moment
  of purchase — the checkout route never trusts a client-submitted price.
- **Cart is deliberately hybrid**: `localStorage` for signed-out visitors (so browsing before
  creating an account doesn't require a round trip), merging into that user's database-backed
  cart the instant they sign in or sign up.
- **Deals, Gift Cards, and Help are real, working pages** — not core to the assignment, but
  built to close out dead header/footer links honestly rather than leaving them as `href="#"`.
  Deals filters the real catalog by actual discount and sorts by it; Gift Cards is wired to
  the real cart, not a mockup.

## Stack, and why each piece

| Piece | Why |
|---|---|
| **Next.js 16 (App Router) + TypeScript** | File-based routing, Server Components for data-heavy pages (home, search, PDP) with Client Components only where interaction needs them, one-command deploy to Vercel. |
| **Neon Postgres + Drizzle ORM** | A real relational database for a project whose whole point is "does data actually persist," without hand-writing SQL. Neon's HTTP driver (`neon-http`) over the `ws`/`Pool` alternative because it needs no persistent connection — the right fit for Vercel's serverless functions. |
| **bcryptjs** | Password hashing with no native bindings to compile — avoids native-module build issues in serverless functions. |
| **Tailwind v4** | Amazon's UI is dense and bespoke; utility classes give pixel-level control faster than a component kit's defaults. |
| **Radix UI** (`react-dialog`, `react-popover`) | The department mega-menu and account flyout need real focus-trap/keyboard/ARIA behavior. Unstyled primitives — Tailwind still does all the visual work. The only UI dependency beyond the framework. |
| **lucide-react** | One consistent, tree-shakeable icon set instead of hand-drawing icons. |
| **Vercel** | Zero-config Next.js hosting, instant public HTTPS URL. |

## Architecture

- **Sessions, not JWTs.** Signing in creates a random 32-byte token, stored in a `sessions`
  table with an expiry, set as the cookie value. Every request re-checks the DB. This was
  chosen specifically to avoid needing a `SESSION_SECRET` — the only environment variable
  this project needs at all is `DATABASE_URL`.
- **Passwords never touch anything but bcrypt.** Hashed at signup with a cost factor of 10;
  the plaintext is never logged, stored, or held longer than the request that hashes it.
- **Route handlers for mutations, Server Components for reads.** Anything that changes server
  state or needs to be called from a Client Component — sign up/in/out, cart mutations,
  placing an order, posting a review — is a route handler under `app/api/`. Anything that's
  just rendering a page a Server Component already owns queries Postgres directly, no API
  round trip.
- **Snapshot-at-write-time for orders.** `order_items` copy the product's title/price/image at
  the moment of purchase, so a later price or catalog change never rewrites history — an
  order placed for $40 still reads $40 a year later even if the product's price changes.
- **Cart items stay live.** Unlike orders, `cart_items` join against the current product row,
  so a price change is reflected before checkout, not after.
- **The product catalog itself lives in Postgres**, seeded from a fixture list
  (`data/products.ts`) — search, the PDP, and the homepage all read live from the database,
  not a static array.

## The one thing built beyond the original brief: a compare tray

Amazon's own comparison UX is weak, so this rebuild adds one it doesn't have: a **Compare**
checkbox on every product card and the PDP, a persistent bottom tray showing what's selected
(up to 4, guest-only via `localStorage` — comparison state has no reason to touch the
database), and a `/compare` page that puts them side by side on brand, category, price,
rating, Prime eligibility, and their real bullet points — with the best price/rating and any
row that isn't unanimous across the selection visually highlighted, not just implied.

## Running locally

```bash
npm install
```

Requires a Postgres connection string. Create a Neon project (or point at any Postgres) and
put the connection string in a `.env` file at the project root (not `.env.local` -
`drizzle-kit` and the seed script only auto-load `.env`):

```
DATABASE_URL=postgres://...
```

Then push the schema and seed the catalog:

```bash
npm run db:push
npm run db:seed
npm run dev
```

No other environment variables are required.

## The build process

- `docs/architecture.md` — the original scope/architecture spec, written before any code.
- `.agent-logs/` — every prompt and response, captured automatically by a Claude Code hook
  for the full 24-hour build, unedited except for one documented hand-edit and one documented
  metadata correction (see `CAPTURE-TEST.md`).
- `CAPTURE-TEST.md` — how the capture hook works, how it was verified, and a full, honest
  account of everything that went wrong along the way, including a credential leak, its
  rotation, and the fix that stops it from happening again.
