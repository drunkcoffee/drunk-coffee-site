# Panama and ALO Home Highlights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the homepage into a premium editorial coffee landing page that gives Panama Gesha and the Ethiopia ALO collection dedicated, Contentful-driven product moments ahead of the general menu.

**Architecture:** Keep `useBeans()` as the single source of product data and derive collection highlights from slugs, collection names, and `featured` status inside `HomePage.jsx`. Add a reusable editorial highlight card that routes to the product detail page and preserves existing cart behavior. The general menu remains intact as the full catalog fallback.

**Tech Stack:** React 19, React Router, Tailwind CSS v4, Contentful Delivery API, Lucide React.

## Global Constraints

- Do not change Contentful product publication or `active` status in this UI task.
- Show a highlight only when its product is returned as active by Contentful; never fabricate availability.
- Retain the existing WhatsApp cart and product-detail routes.
- Use the existing dark background and amber `#c8922a` as the single interactive accent.

---

### Task 1: Derive highlighted collections from live beans

**Files:**
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `beans` returned by `useBeans()`.
- Produces: `panamaBean`, `aloBeans`, and `featuredBeans` memoized collections.

- [ ] **Step 1: Add collection selectors after existing bean filtering**

```js
const panamaBean = useMemo(
  () => beans.find((bean) => /panama|lamastus|gesha/i.test(`${bean.slug} ${bean.name} ${bean.collection}`)),
  [beans],
);
const aloBeans = useMemo(
  () => beans.filter((bean) => /\balo\b|ethiopia alo/i.test(`${bean.slug} ${bean.name} ${bean.collection}`)),
  [beans],
);
```

- [ ] **Step 2: Keep all selectors empty-safe**

Do not render the Panama or ALO sections when their derived arrays are empty; the existing coffee menu remains visible.

### Task 2: Add reusable editorial product modules

**Files:**
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `bean`, `onOpen`, and `onAdd`.
- Produces: `CollectionFeature` for a single hero product and `HighlightTile` for ALO products.

- [ ] **Step 1: Add `CollectionFeature`**

```jsx
function CollectionFeature({ bean, eyebrow, title, body, onOpen, onAdd }) {
  if (!bean) return null;
  return <section id="panama" className="bg-[#f1e7d7] text-[#17120d]">{/* image, notes, price and CTAs */}</section>;
}
```

- [ ] **Step 2: Add `HighlightTile`**

```jsx
function HighlightTile({ bean, index, onOpen, onAdd }) {
  return <article className="group overflow-hidden rounded-[22px] bg-[#1a1510]">{/* Contentful image, origin, notes, and add action */}</article>;
}
```

- [ ] **Step 3: Use image fallbacks intentionally**

Use `bean.image || bean.flavorImage` and show a quiet neutral placeholder when Contentful has no image.

### Task 3: Reorder homepage into an editorial product rhythm

**Files:**
- Modify: `src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: the selectors and two new visual components.
- Produces: an order of hero → Panama highlight → ALO series → general menu → existing brand/wholesale content.

- [ ] **Step 1: Insert Panama after the hero**

Use a warm light backdrop, restrained studio layout, Panama tasting notes, selected price, and `View coffee` / `Add to cart` actions.

- [ ] **Step 2: Insert ALO series before the general catalog**

Use a dark two-card grid with a series introduction and show each active ALO coffee from Contentful.

- [ ] **Step 3: Make the general menu secondary**

Rename its eyebrow to `The full menu`, preserve filters and list behavior, and keep the `#shop` anchor for existing navigation.

### Task 4: Validate responsive purchase flow

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Test: production build

- [ ] **Step 1: Verify mobile layout**

All highlight cards collapse to one column below `sm`; CTA buttons retain approximately 44px tap targets.

- [ ] **Step 2: Verify routing and cart actions**

`View coffee` routes to `/coffee/:slug`; `Add to cart` uses the existing `handleAdd` and opens the same drawer.

- [ ] **Step 3: Build**

Run: `npm.cmd run build`

Expected: `✓ built in` with no Vite errors.

## Self-Review

- Panama and ALO get dedicated hierarchy without hiding the full catalog.
- Empty Contentful data leaves the current homepage usable.
- No publication, pricing, or cart contract changes are introduced.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-22-panama-alo-home-highlights.md`. Proceed with inline execution in this session, as requested.
