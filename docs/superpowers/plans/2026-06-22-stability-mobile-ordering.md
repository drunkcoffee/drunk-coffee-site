# Drunk Coffee Stability and Mobile Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Contentful-backed coffee catalogue reliably hide inactive products, tolerate incomplete entries, preserve bean names in WhatsApp orders, and remain usable on mobile without redesigning the site.

**Architecture:** Keep Contentful normalization as the single boundary for untrusted CMS fields. Product pages consume only normalized beans and render an explicit unavailable state when a slug cannot be resolved. Preserve existing visual design; apply only responsive sizing, wrapping, and fixed-overlay corrections needed for small screens.

**Tech Stack:** React 19, React Router 7, Vite 7, Tailwind utility classes, Contentful Content Delivery API.

## Global Constraints

- Do not redesign the whole website.
- Fix only Contentful loading, inactive product visibility, missing-field resilience, WhatsApp ordering flow, and mobile layout.
- Preserve existing user changes in `src/pages/ProductDetail.jsx` and unrelated untracked files.
- Verify with `npm run lint`, `npm run build`, and manual mobile-width browser checks.

---

## File Structure

- Modify `src/lib/coffeeStore.js`: validate Contentful responses, normalize missing fields, filter inactive fallback and CMS beans, and build quantity-aware single-product WhatsApp URLs.
- Modify `src/pages/ProductDetail.jsx`: avoid dereferencing an absent selected bean, pass selected quantities into WhatsApp orders, make the cart overlay truly fixed, and protect narrow mobile layout.
- Modify `src/pages/HomePage.jsx`: make the cart overlay truly fixed and retain mobile-safe cart presentation.
- Modify `src/pages/CoffeeBeansPage.jsx`: ensure menu rows retain readable mobile layout when optional CMS fields are missing.

### Task 1: Harden Contentful bean normalization and loading

**Files:**
- Modify: `src/lib/coffeeStore.js`
- Test: browser/manual verification against the configured Contentful environment

**Interfaces:**
- Consumes: Contentful Delivery API payload `{ items, includes }`.
- Produces: `fetchBeansFromContentful(): Promise<{ beans: Bean[], warning: string }>` where every bean has a non-empty `id`, `slug`, `name`, `category`, `variants`, `size`, `price`, and `active` boolean.

- [ ] **Step 1: Add a defensive active predicate and fallback filter**

```js
function isActiveBean(bean) {
  return bean?.active !== false;
}

const visibleFallbackBeans = FALLBACK_BEANS.filter(isActiveBean);
```

- [ ] **Step 2: Make `mapContentfulEntries` accept malformed response shapes without throwing**

```js
export function mapContentfulEntries(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const includes = Array.isArray(data?.includes?.Asset) ? data.includes.Asset : [];
  // Keep existing field defaults and asset mapping below these declarations.
}
```

- [ ] **Step 3: Filter inactive beans before exposing either CMS or fallback data**

```js
const mapped = mapContentfulEntries(data)
  .filter(isActiveBean)
  .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

return {
  beans: mapped.length ? mapped : visibleFallbackBeans,
  warning: mapped.length ? "" : "Contentful returned no active coffee entries. Showing fallback coffee list.",
};
```

- [ ] **Step 4: Use the same visible fallback list on request failure and initial render**

```js
const [beans, setBeans] = useState(visibleFallbackBeans);
// In both missing-config and catch branches, use visibleFallbackBeans.
```

- [ ] **Step 5: Verify data behavior**

Run: `npm run build`

Expected: successful production build. In the running site, entries whose Contentful `active` field is `false` do not appear on home, `/beans`, related products, or direct detail routes.

### Task 2: Make product details and single-item ordering safe for incomplete entries

**Files:**
- Modify: `src/lib/coffeeStore.js`
- Modify: `src/pages/ProductDetail.jsx`
- Test: browser/manual verification using a Contentful entry missing image, notes, optional details, and variants

**Interfaces:**
- Consumes: `selectBeanVariant(bean, variant)` and optional normalized Bean fields.
- Produces: `buildSingleOrderUrl(bean, quantity)` that always creates a valid WhatsApp URL and includes the bean name when one is available.

- [ ] **Step 1: Guard selection and WhatsApp message construction**

```js
export function buildSingleOrderUrl(bean, quantity = 1) {
  const name = String(bean?.name || "Coffee").trim() || "Coffee";
  const size = String(bean?.size || "Standard size").trim() || "Standard size";
  const category = String(bean?.category || "Coffee").trim() || "Coffee";
  const price = Number.isFinite(Number(bean?.price)) ? Number(bean.price) : 0;
  const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const message = `Hi Drunk Coffee Roasters,\n\nI would like to order:\n\n${name} (${size}) x${qty}\nCategory: ${category}\nPrice: RM ${price * qty}\n\nPlease share availability and roasting lead time.\nThank you.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 2: Pass the selected quantity to every single-product order button**

```jsx
<a href={buildSingleOrderUrl(selectedBean, qty)} target="_blank" rel="noreferrer">
  Order on WhatsApp
</a>
```

- [ ] **Step 3: Remove unguarded selected-bean dereferences in click analytics**

```jsx
onClick={() => trackWhatsappClick("product_detail_order", selectedBean?.slug || bean.slug)}
```

- [ ] **Step 4: Verify missing-field rendering**

Run: `npm run dev -- --host 127.0.0.1`

Expected: an entry missing any combination of image, flavour image, description, notes, origin, process, roast, variety, or variants renders either the corresponding fallback UI or omits that optional section; it never throws or creates an invalid order URL.

### Task 3: Correct mobile overlays and narrow product/menu layout

**Files:**
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/ProductDetail.jsx`
- Modify: `src/pages/CoffeeBeansPage.jsx`
- Test: manual browser checks at 320 px, 375 px, and 768 px viewport widths

**Interfaces:**
- Consumes: existing cart state and bean display components.
- Produces: fixed cart panels that cover the viewport and rows/CTAs with no horizontal clipping on small screens.

- [ ] **Step 1: Remove the invalid sticky override from cart overlays**

```jsx
<div className="fixed inset-0 z-[70] flex justify-end">
```

Apply this replacement in both `CartDrawer` implementations. The existing `fixed` utility must remain effective so the backdrop and drawer cover the viewport on mobile.

- [ ] **Step 2: Keep the product detail content clear of the sticky mobile order bar**

```jsx
<main className="mx-auto max-w-6xl px-4 pb-32 pt-10 md:px-6 md:pb-16 md:pt-14">
```

- [ ] **Step 3: Make compact product/menu row content shrink and wrap safely**

```jsx
<div className="min-w-0 flex-1">
  <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">{bean.name}</span>
</div>
```

Retain `min-w-0` on text columns, `shrink-0` only on icons/prices, and use smaller mobile gaps/padding only where a row overflows. Do not change desktop composition.

- [ ] **Step 4: Verify responsive routes and interactions**

Run: `npm run lint; npm run build`

Expected: both commands exit successfully. At 320 px, 375 px, and 768 px: home cards, `/beans` rows, `/coffee/:slug` options, mobile sticky order bar, cart drawer, and WhatsApp CTAs remain readable, clickable, and free of horizontal page overflow.

### Task 4: Final regression audit

**Files:**
- Modify: only files identified by prior tasks

**Interfaces:**
- Consumes: production build output and configured Contentful environment.
- Produces: verified stable user flows.

- [ ] **Step 1: Start the app and inspect home, menu, and one product detail route**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite starts without runtime errors; beans load from Contentful when credentials are present.

- [ ] **Step 2: Confirm ordering content**

Open a single-product WhatsApp link and a cart WhatsApp link.

Expected: each message names the selected bean; the single-product message includes its selected size and quantity.

- [ ] **Step 3: Commit intentional changes**

```bash
git add src/lib/coffeeStore.js src/pages/ProductDetail.jsx src/pages/HomePage.jsx src/pages/CoffeeBeansPage.jsx
git commit -m "fix: harden coffee catalog and mobile ordering"
```

Do not add unrelated existing modifications, assets, scripts, or plans to this commit.
