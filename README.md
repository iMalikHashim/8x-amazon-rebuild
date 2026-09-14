# Amazon Rebuild

A from-scratch rebuild of the amazon.com shopping experience, built for the 8x take-home
assignment. Next.js 16 (App Router) + TypeScript + Tailwind v4 + Neon Postgres (Drizzle ORM).

**Live:** https://8x-amazon-rebuild.vercel.app
**Architecture / scope decisions:** [docs/architecture.md](docs/architecture.md)
**Agent capture setup:** [CAPTURE-TEST.md](CAPTURE-TEST.md)

## Running locally

```bash
npm install
```

Requires a Postgres connection string in `.env.local`:

```
DATABASE_URL=postgres://...
```

Then push the schema and seed the catalog:

```bash
npm run db:push
npm run db:seed
npm run dev
```

## What's real vs. what's mocked

Auth, persistence, and the database are real:

- Passwords are hashed with bcrypt before ever touching the database - never stored or
  logged in plain text.
- Sessions are opaque random tokens stored server-side in Postgres and set as an httpOnly,
  secure cookie - never readable from client JS, never stored in `localStorage`.
- Accounts, orders, order line items, and reviews are all persisted in Postgres and scoped
  to the signed-in user, so they survive across browsers and devices, not just a refresh in
  the same tab.
- The product catalog itself lives in Postgres too (seeded from a fixture list) - search,
  the PDP, and the homepage all read live from the database.

Cart is the one deliberately hybrid piece: it stays in `localStorage` for signed-out
visitors (so browsing/adding to cart before creating an account doesn't require a round
trip), and merges into that user's database-backed cart the moment they sign in or sign up.

**Checkout/payment is still simulated** - there is no real payment processor. Card details
entered at checkout are never sent to the server or stored anywhere; only the last 4 digits
are persisted with the order, purely for display on the order history/confirmation pages.
