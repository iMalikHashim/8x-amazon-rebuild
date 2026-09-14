# Amazon Rebuild

A from-scratch rebuild of the amazon.com shopping experience, built for the 8x take-home
assignment. Next.js 16 (App Router) + TypeScript + Tailwind v4.

**Live:** https://8x-amazon-rebuild.vercel.app
**Architecture / scope decisions:** [docs/architecture.md](docs/architecture.md)
**Agent capture setup:** [CAPTURE-TEST.md](CAPTURE-TEST.md)

## Running locally

```bash
npm install
npm run dev
```

## Auth is intentionally mocked

There is no backend, no real authentication server, and no password hashing. Sign-up and
sign-in are implemented entirely client-side:

- Accounts created via `/signup` are stored as plain JSON in `localStorage`
  (`8x-amazon-rebuild:users`), **passwords included and unhashed**.
- Sign-in checks the entered email/password against that same local list - it never leaves
  the browser.
- The active session is just an email string in `localStorage`
  (`8x-amazon-rebuild:session`).

This is a deliberate scope cut, not an oversight: building real authentication (a backend,
a database, password hashing, session tokens) would be disproportionate effort for a
project with no real backend anywhere else, and doesn't change what's being evaluated -
the shopping loop. It does mean:

- **Never enter a real password here.** Treat every account on this deployment as public.
- Clearing site data / using a different browser resets everything (accounts, cart,
  orders) - there is no server-side record of any of it.
- Orders are tagged with the email of whoever placed them, so signing in as a different
  (locally-created) account shows that account's own order history, not anyone else's -
  but only because both accounts live in the same browser's localStorage.

Cart, orders, and auth all persist across a refresh via localStorage for the same reason:
there's no backend session to persist them server-side.
