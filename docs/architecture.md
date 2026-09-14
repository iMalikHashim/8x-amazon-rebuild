# Amazon Rebuild — Architecture Spec

Status: proposed, pending sign-off. No application code written yet.
Reference material: `screenshots/amazon-screenshot-{1,2,3}.png` (logged-out
homepage, department mega-menu, account flyout) plus general knowledge of
amazon.com's structure.

---

## 1. Experience to reproduce

Amazon.com is too large to rebuild in full in 24 hours, so the scope is a
deliberate cut: **the core browse → decide → buy loop for a logged-out or
freshly-registered retail customer**, plus enough account surface to make
the loop feel complete.

**In scope:**
- Homepage with personalized-looking promo modules
- Global header/nav (search, department menu, account, cart) — this is the
  one area with direct screenshot reference
- Search results / category listing with filters and sort
- Product detail page (PDP): gallery, buybox, variants, reviews, related items
- Cart
- Checkout (address → payment → review → confirmation), fully mocked, no
  real payment processing
- Minimal account area: mock sign-in, order history, addresses
- Responsive behavior down to ~360px

**Explicitly out of scope** (this is the product-judgment call, stated up
front so it can be argued with):
- Prime Video, Amazon Music, Kindle, Alexa/devices ecosystem
- Seller Central / "Sell on Amazon" / business accounts
- Live shopping, Q&A on products, writing/submitting reviews
- Real payments, real auth/password security, multi-currency/i18n
- Gift cards purchase flow, Subscribe & Save, coupons/deals infrastructure

Cutting these is the right call for a 24-hour window: they're peripheral to
"is this a good Amazon shopping experience," and building any one of them
properly would eat a disproportionate share of the budget.

## 2. Page structure & major sections

| Page | Sections |
|---|---|
| Home | Header, hero carousel, promo card grid (4-up), category rows (horizontal product carousels), footer |
| Search/Category | Header, breadcrumb, filter sidebar (category, price, rating, brand), sort dropdown, result grid, pagination |
| PDP | Breadcrumb, image gallery, title/rating/price block, buybox (variants, qty, add-to-cart/buy-now, delivery estimate), product info tabs (details/specs), reviews list, related-products carousel |
| Cart | Line items (image, title, variant, qty stepper, remove/save-for-later), order summary, proceed-to-checkout CTA |
| Checkout | Step indicator, address form → payment form (mock) → review step → confirmation page with mock order number |
| Account | Sidebar nav, profile page, order history (list → order detail), addresses |
| Sign in | Single form, mocked — any email/password "succeeds" |

## 3. Static vs. interactive

**Static (content-driven, no client JS needed to render):** hero banner,
promo cards, category tiles, footer links, breadcrumbs, product info/specs
tab content, most of the PDP text block.

**Interactive (needs client state):** search bar + autosuggest, department
mega-menu (screenshot 2), account flyout (screenshot 3), image gallery
(thumbnail → main image swap, zoom-on-hover), variant selector, quantity
stepper, cart add/remove/update (with header badge updating live), filter
sidebar (checkboxes update the result set), sort dropdown, checkout
multi-step form, mobile hamburger nav, sticky mobile "Add to Cart" bar.

## 4. Responsive behavior (inferred)

Screenshot 2 already shows the department menu as a full-height slide-in
panel with a dimmed backdrop — that pattern works unchanged from mobile to
desktop, so it's a low-risk one-component win. Beyond that, standard Amazon
patterns to reproduce:

- **Header:** single row (logo, search, account, cart) on desktop; on
  mobile it splits into logo+icons row, then a full-width search row below.
- **Account flyout:** hover/click dropdown on desktop; full-screen sheet on
  mobile (screenshot 3's content works well as a bottom-sheet/drawer at
  small widths).
- **Home:** promo grid 4-col → 2-col → 1-col; category rows become
  horizontally swipeable rather than wrapping.
- **Search results:** filter sidebar → collapsible "Filters" drawer;
  product grid 4→3→2→1 columns.
- **PDP:** gallery beside buybox (desktop) → gallery stacked above buybox
  (mobile), with a sticky bottom Add-to-Cart bar on small screens.
- **Cart/Checkout:** summary panel beside form (desktop) → summary
  collapses to an accordion above/below the form (mobile).

## 5. Assets available vs. needed from scratch

**Available:** homepage layout/copy tone, exact header structure, department
mega-menu structure and copy, account flyout structure and copy, a
consistent color/type starting point extracted from the screenshots.

**Needed from scratch (no reference, and can't legally scrape real Amazon
listings/photography):**
- Entire product catalog: names, prices, descriptions, specs, reviews —
  original fixture data, thematically matching the screenshots' Back-to-
  School / electronics / kitchen / fashion categories for visual coherence
- Product photography — a curated set of free-license stock images (not
  Amazon's), organized to match the fixture catalog
- PDP, search results, cart, checkout, account layouts — built from general
  knowledge of amazon.com, not a captured reference
- The wordmark — recreated as text/SVG in Amazon's font/color, not copied
  as an image asset

## 6. Minimum technical architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | File-based routing maps directly to the page list above; Server Components for data-heavy pages (home, search, PDP) with Client Components only where interaction requires it; trivial one-command deploy to Vercel — solves the "live link" requirement immediately. |
| Styling | **Tailwind CSS** | Amazon's UI is dense and bespoke — utility classes give pixel-level control faster than any component-kit's defaults would, without hand-rolling a CSS architecture. |
| Accessible primitives | **Radix UI primitives** (`react-popover`, `react-dialog`, `react-tabs`) — nothing else | The department mega-menu, account flyout, mobile drawer, and PDP tabs all need real focus-trap/keyboard/ARIA behavior. Hand-rolling that correctly under a 24h clock is a bad trade; Radix's primitives are unstyled, so Tailwind still does 100% of the visual work. This is the one dependency beyond the framework itself. |
| Icons | **lucide-react** | Small, tree-shakeable, covers search/cart/star/chevron/etc. Hand-drawing 15+ icons is wasted time; a shared icon set is standard practice, not over-engineering. |
| Cart state | React Context + `useReducer`, persisted to `localStorage` | Needs to be readable from the header badge, mini-cart, cart page, and checkout — genuinely global. Small and simple enough that Redux/Zustand would be unjustified overhead. |
| Auth state | Mocked `AuthContext`, a flag in `localStorage` | No real backend exists or is warranted for this scope. Sign-in accepts any credentials and sets the flag; account/orders pages just check it. This is a disclosed shortcut, not a hidden gap. |
| Search/filter/sort state | **URL search params**, not component state | Makes results shareable/bookmarkable and back-button-correct, and lets the Search page be a Server Component that reads `searchParams` directly — the technically correct choice, not just the convenient one. |
| Product data | `lib/catalog.ts` — typed async functions (`getProducts()`, `getProductBySlug()`, `searchProducts()`) reading local fixtures | Presents a DB-shaped async API today, backed by static data. Swapping in a real database later touches only this file. A real backend/DB for this exercise would be over-engineering. |
| Mock checkout | One Route Handler (`app/api/checkout/route.ts`) that accepts the order and returns a fake order id | Keeps the "server does something on submit" feel without building real payment/order infrastructure. |
| Deployment | **Vercel** | Zero-config for Next.js, free tier, instant public HTTPS URL. |
| Testing | None as a separate suite; TypeScript strict mode + manual browser verification per page | Given the 24h budget and the fact this is graded on visual/UX quality, time is better spent on the product than on test scaffolding. Revisit only if time is left over. |

## 7. Project structure

```
app/
  layout.tsx                    Root layout: Header, Footer, context providers
  page.tsx                      Home
  search/page.tsx               Search/category results (reads searchParams)
  product/[slug]/page.tsx       PDP
  cart/page.tsx
  checkout/
    page.tsx                    Step 1: address
    payment/page.tsx            Step 2: payment (mock)
    review/page.tsx             Step 3: review
    confirmation/page.tsx       Order placed
  account/
    layout.tsx                  Auth-gated shell + sidebar nav
    page.tsx                    Profile
    orders/page.tsx
    orders/[id]/page.tsx
    addresses/page.tsx
  sign-in/page.tsx
  api/
    checkout/route.ts

components/
  layout/
    Header.tsx
    DepartmentMenu.tsx           "All" hamburger mega-menu (screenshot 2)
    AccountFlyout.tsx            "Hello, sign in" flyout (screenshot 3)
    SearchBar.tsx
    MobileNav.tsx
    Footer.tsx
  ui/                            Generic, reusable, presentational only
    Button.tsx
    Price.tsx
    RatingStars.tsx
    Badge.tsx
    QuantitySelector.tsx
    Breadcrumbs.tsx
    CarouselRow.tsx
  product/
    ProductCard.tsx              Used on Home, Search, and "related products"
    ProductGrid.tsx
  home/
    HeroBanner.tsx
    PromoCard.tsx
  pdp/                           Local to the product page
    ImageGallery.tsx
    BuyBox.tsx
    VariantSelector.tsx
    ProductTabs.tsx
    ReviewsSection.tsx
  cart/
    CartLineItem.tsx
    CartSummary.tsx
  checkout/
    AddressForm.tsx
    PaymentForm.tsx
    OrderReview.tsx
  account/
    AccountNav.tsx
    OrderListItem.tsx

lib/
  types.ts                       Product, Order, User, CartItem, Address
  catalog.ts                     Data access layer (async, DB-shaped)
  cart-context.tsx
  auth-context.tsx
  format.ts                      Currency/date helpers

data/
  products.ts                    Fixture catalog
  categories.ts

public/
  products/*.jpg
  hero/*.jpg
```

## 8. Component hierarchy

```
RootLayout
├─ AuthProvider
│  └─ CartProvider
│     ├─ Header
│     │  ├─ DepartmentMenu (drawer)
│     │  ├─ SearchBar
│     │  ├─ AccountFlyout (popover)
│     │  └─ CartBadge
│     ├─ {page}
│     │  ├─ Home
│     │  │  ├─ HeroBanner
│     │  │  └─ CarouselRow × N
│     │  │     └─ ProductCard × N   (or PromoCard for the 4-up grid)
│     │  ├─ Search
│     │  │  ├─ FilterSidebar
│     │  │  └─ ProductGrid
│     │  │     └─ ProductCard × N
│     │  ├─ PDP
│     │  │  ├─ Breadcrumbs
│     │  │  ├─ ImageGallery
│     │  │  ├─ BuyBox
│     │  │  │  └─ VariantSelector, QuantitySelector
│     │  │  ├─ ProductTabs
│     │  │  ├─ ReviewsSection
│     │  │  └─ CarouselRow (related) → ProductCard × N
│     │  ├─ Cart
│     │  │  ├─ CartLineItem × N
│     │  │  └─ CartSummary
│     │  ├─ Checkout/*
│     │  │  └─ AddressForm | PaymentForm | OrderReview
│     │  └─ Account/*
│     │     ├─ AccountNav
│     │     └─ OrderListItem × N
│     └─ Footer
```

`ProductCard`, `Price`, `RatingStars`, `Badge`, `Button`, `Breadcrumbs`,
`CarouselRow`, and `QuantitySelector` are the reusable set — each used on 2+
pages. Everything under `pdp/`, `cart/`, `checkout/`, `account/`, `home/` is
local to its one page and shouldn't be pulled into `components/ui/` even if
it looks generic, until a second real usage appears (YAGNI).

## 9. Data/state approach (summary)

- **Server state (product catalog):** fetched in Server Components via
  `lib/catalog.ts`, no client-side fetching library needed.
- **Global client state:** Cart (Context + reducer + localStorage), Auth
  (Context + localStorage flag). Two providers, nothing heavier.
- **URL state:** search query, filters, sort, pagination — all in
  `searchParams`, never duplicated into component state.
- **Local state:** everything else (form fields, gallery index, menu
  open/closed, variant selection before add-to-cart).

## 10. Responsive strategy

Mobile-first Tailwind, standard breakpoints (`sm` 640 / `md` 768 / `lg` 1024
/ `xl` 1280). No separate mobile codepath — every component renders at every
width; layout changes are breakpoint utility classes, not conditional
component trees, except where the interaction pattern genuinely differs
(department menu already unifies as a drawer at all sizes; PDP buybox gets
an additional sticky-bottom-bar variant on mobile via `md:hidden`).

## 11. Implementation phases

| Phase | Scope | Est. |
|---|---|---|
| 0 | Scaffold (Next.js/TS/Tailwind), design tokens from screenshots, empty Header/Footer, deploy skeleton to Vercel | 1h |
| 1 | Header, DepartmentMenu, AccountFlyout, Footer, Home page — the area with direct screenshot reference | 2–3h |
| 2 | Fixture catalog + Search/category page with working filters/sort | 2–3h |
| 3 | PDP (gallery, buybox, variants, tabs, reviews, related) | 3–4h |
| 4 | Cart (add/remove/update, persisted, header badge) | 2h |
| 5 | Checkout (mocked) + confirmation | 2–3h |
| 6 | Account (mock sign-in, orders, addresses) — first thing cut if time runs short | 1–2h |
| 7 | Responsive QA, accessibility pass, empty/loading/error states, perf | 2–3h |
| 8 | Deployment hardening, walkthrough recording | 1h |

Phases 0–4 (browse → search → PDP → cart) are the must-ship core loop.
Phase 5 (checkout) is important for "feels complete." Phase 6 (account) is
the first thing to drop if the clock runs out.

## 12. Main technical/visual risks

- **Recon gap:** PDP/search/cart/checkout have no screenshot reference, so
  their fidelity rests on general knowledge, not this project's captured
  material. Mitigation: grab a few more real screenshots before Phase 3 if
  close visual matching matters.
- **No real product imagery:** stock photos will read as "stock" next to
  Amazon's actual studio photography. Mitigation: keep the fixture catalog
  tightly themed (matching the Back-to-School campaign in screenshot 1) so
  it reads as a coherent store rather than a random grab-bag.
- **Density fatigue:** Amazon's UI packs a lot of small elements (badges,
  star ratings, Prime-style delivery callouts, price formatting) — getting
  each one visually right is slow, detail-heavy work. Mitigation: nail the
  design tokens and the 3-4 shared primitives (`Price`, `RatingStars`,
  `Badge`, `ProductCard`) early so polish compounds across every page that
  reuses them, instead of re-solving typography per page.
- **Mocked checkout/auth reading as "unfinished":** mitigated by letting the
  user complete the full motion end-to-end to a real confirmation screen —
  it should feel finished even though nothing real happens behind it.
- **Image-heavy pages hurting load time:** mitigated by `next/image` with
  lazy loading and Next's automatic route-level code splitting — no extra
  work required, just don't bypass `next/image`.

## Assumptions (no reference for these, so a call was made)

- No real payment processing — checkout ends in a mocked confirmation.
- No real backend/auth — account features are gated by a mocked local
  session; sign-in accepts any credentials.
- Product catalog, copy, and imagery are original fixtures, not scraped
  from amazon.com (legal/ToS, and no real data exists to scrape from).
- Single locale/currency (en-US, USD) despite the screenshot showing
  "Deliver to Pakistan" — no multi-region logic.
- Reviews/ratings are seeded fixture data; no review-writing flow.
- Amazon-style branding (wordmark, "Prime"-style badge wording, color
  palette) is recreated in code, not copied as binary image assets — this
  is an eval/portfolio clone, consistent with what the brief asks for.
