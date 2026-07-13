# Home and Shop Architecture Refresh Implementation Plan

> **For agentic workers:** Implement this plan inline in the current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shorten the Drunk Coffee Roasters homepage into a brand-led buying guide and move the complete active coffee list into a dedicated `/shop` route.

**Architecture:** Keep the existing React, Vite, Tailwind, Contentful, cart, product-detail, WhatsApp, and deployment architecture. Reuse `useBeans`, the current pricing helpers, and the packaging-led card system; only reorganize page composition, URL-driven filtering, and shared presentation.

**Tech Stack:** React 19, React Router 7, Tailwind CSS 4, Contentful, Vite 7.

## Global Constraints

- Preserve the current Contentful integration, product detail routes, persistent cart behavior, WhatsApp order messages, and Cloudflare-compatible Vite build.
- Show active products from lowest available numeric package price to highest price; ignore unavailable `null` package prices.
- Product cards show the lowest price as `From RMxx` and do not list every package price.
- Use buyer-friendly brew labels and never use Chemex.
- Keep the DCR visual direction warm cream, near-black, editorial, packaging-first, restrained, and easy to buy.
- Do not add a new dependency or duplicate the product data model.

---

### Task 1: Route the complete coffee list through `/shop`

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/CoffeeBeansPage.jsx`

**Interfaces:**
- Consumes: `useBeans()`, `getProductFilterMatches(bean, filter)`, and React Router search parameters.
- Produces: `/shop`, `/shop?category=filter`, `/shop?category=espresso`, `/shop?category=limited`, and `/shop?category=bundles`; `/beans` remains a compatibility alias.

- [ ] Add `/shop` without removing the existing `/beans` route.
- [ ] Map supported query values to the existing buyer-friendly filter helpers.
- [ ] Replace the dark list view with a warm editorial product grid: two columns on mobile, three on desktop, and four only on wide screens.
- [ ] Keep filters sticky on mobile and show a clear empty state.
- [ ] Run `npm.cmd run lint` and fix page-level issues.

### Task 2: Convert the homepage into a concise brand-and-navigation surface

**Files:**
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: active price-sorted beans from `useBeans()`, the existing persistent cart, the existing WhatsApp URL builders, and `PackagingProductCard`.
- Produces: a short homepage with announcement, simple navigation, NIU monthly highlight, two brew-style entrances, at most three featured coffees, short brand/awards content, WhatsApp CTA, and footer.

- [ ] Update the announcement and navigation copy, using real `/shop` links and `#about` for the existing on-page About destination.
- [ ] Build a packaging-first NIU hero with `Shop This Coffee` and `View All Coffee`; gracefully fall back when NIU is not active.
- [ ] Add Filter and Espresso entrances linked to URL-driven Shop filters.
- [ ] Select up to three `featured && active` coffees, filling any unused slots from the active sorted list without duplicates.
- [ ] Remove the full coffee menu, long taste guide, repeated brand education, journal, marquee, and other duplicate sections from Home.
- [ ] Preserve the existing cart drawer, add-to-cart behavior, analytics calls, and WhatsApp actions.
- [ ] Run `npm.cmd run lint` and fix page-level issues.

### Task 3: Simplify the shared coffee card and visual rhythm

**Files:**
- Modify: `src/components/DrunkDesignSystem.jsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: `formatBeanPrice`, tasting notes, origin/collection, and honest brew labels from the normalized coffee object.
- Produces: one reusable clean product card suitable for the three-card homepage feature and dense two-column mobile Shop grid.

- [ ] Keep packaging as the visual lead and show only name, origin or collection, two to three tasting notes, brew label, starting price, and `View coffee`.
- [ ] Make secondary add-to-cart behavior optional without changing its existing callback contract.
- [ ] Reduce heavy shadows, rounded pills, gradients, and boxed micro-sections in favor of thin borders and whitespace.
- [ ] Add keyboard-visible focus styles and guard against horizontal overflow.
- [ ] Verify that mobile typography remains readable at two columns.

### Task 4: Verify the finished buying paths

**Files:**
- Verify: `src/App.jsx`
- Verify: `src/pages/HomePage.jsx`
- Verify: `src/pages/CoffeeBeansPage.jsx`
- Verify: `src/components/DrunkDesignSystem.jsx`
- Verify: `src/App.css`

**Interfaces:**
- Consumes: the complete implementation.
- Produces: evidence that the homepage is short, Shop owns the full catalog, filtering works, and production compilation succeeds.

- [ ] Run `npm.cmd run lint`; expect exit code 0.
- [ ] Run `npm.cmd run build`; expect Vite to complete with generated assets.
- [ ] Start a local preview and inspect `/`, `/shop`, `/shop?category=filter`, and `/shop?category=espresso` at desktop and mobile widths.
- [ ] Confirm no horizontal scrolling, at most three homepage coffee cards, two Shop columns on mobile, and working product links.
- [ ] Review `git diff --check` and the final file diff without staging, committing, pushing, or deploying.

## Self-Review

- The plan covers Home, Shop, filters, cards, routing, mobile behavior, data ownership, build verification, and protected integrations.
- No new product schema, dependency, or checkout flow is introduced.
- All route names and helper contracts match the current codebase.

## Execution Notes

- Implemented inline on 2026-07-13 without staging, committing, pushing, or deploying.
- Targeted ESLint passed for `src/App.jsx`, `src/pages/HomePage.jsx`, `src/pages/CoffeeBeansPage.jsx`, and `src/components/DrunkDesignSystem.jsx`.
- The production build passed with Vite after running outside the restricted filesystem sandbox.
- Browser checks passed at desktop and 375px mobile widths: no horizontal overflow, three homepage coffee cards, five homepage sections, two Shop columns on mobile, URL-driven Filter state, and a working Shop-to-product-detail path.
- Full-repository ESLint remains blocked by 19 pre-existing errors in unrelated files including `BlurImage.jsx`, `Lightbox.jsx`, `PageTransition.jsx`, `Toast.jsx`, `NotFoundPage.jsx`, `ProductDetail.jsx`, and `WholesalePage.jsx`.
