# Coffee Size Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a shopper choose a coffee bag size, have its selected price flow through the product page, cart, WhatsApp order, and analytics, and let Contentful own the available choices.

**Architecture:** Add an optional `variants` JSON field to the existing Contentful content type. The client normalizes it into an ordered `variants` array while maintaining the existing `price` and `size` fields as the default variant for old products. A small pure helper creates a selected purchasable product object; cart lines use a deterministic product-and-variant id so different sizes remain separate.

**Tech Stack:** React 19, Vite 7, Contentful Delivery API, localStorage cart, Google Analytics event bridge.

## Global Constraints

- Existing Contentful entries without `variants` must continue to work exactly as a single-size product.
- Prices are RM whole numbers and product choices must be visible before a shopper adds to cart or opens WhatsApp.
- Never place a Contentful Management token in the client bundle or Cloudflare `VITE_` variables.
- Do not publish the three draft products in this change; their prices, activation, and publishing remain a separate business decision.

---

### Task 1: Normalize variants from Contentful

**Files:**
- Modify: `src/lib/coffeeStore.js`
- Test: manual module-level checks through the production build (no automated test runner exists in this repository)

**Interfaces:**
- Consumes: Contentful `fields.variants`, a JSON array such as `[{"size":"100g","price":59},{"size":"200g","price":89}]`.
- Produces: `normalizeVariants(value, fallback)` and `selectBeanVariant(bean, variant)`; every mapped bean has `{ variants, price, size }`.

- [ ] **Step 1: Add `normalizeVariants`**

```js
export function normalizeVariants(value, fallback = {}) {
  const source = Array.isArray(value) ? value : safeJsonArray(value);
  const variants = source
    .map((item) => ({ size: String(item?.size || "").trim(), price: Number(item?.price) }))
    .filter((item) => item.size && Number.isFinite(item.price) && item.price >= 0);
  return variants.length ? variants : [{ size: fallback.size || "200g", price: Number(fallback.price || 0) }];
}
```

- [ ] **Step 2: Map the first variant to legacy fields**

```js
const variants = normalizeVariants(fields.variants, { size: fields.size, price: fields.price });
return { ...mappedFields, variants, price: variants[0].price, size: variants[0].size };
```

- [ ] **Step 3: Add a selected-product helper**

```js
export function selectBeanVariant(bean, variant) {
  const selected = variant || bean.variants?.[0] || { size: bean.size, price: bean.price };
  return { ...bean, size: selected.size, price: selected.price, variantId: `${bean.id}:${selected.size}` };
}
```

- [ ] **Step 4: Run build**

Run: `npm.cmd run build`

Expected: `✓ built in` with no Vite errors.

### Task 2: Keep cart lines separate by product and size

**Files:**
- Modify: `src/lib/coffeeStore.js`
- Modify: `src/lib/analytics.js`

**Interfaces:**
- Consumes: selected bean returned by `selectBeanVariant`.
- Produces: cart records keyed by `variantId`, WhatsApp line items with their selected size, and `variant` in analytics.

- [ ] **Step 1: Change the cart identity**

```js
const cartId = bean.variantId || `${bean.id}:${bean.size}`;
const existing = current.find((item) => item.id === cartId);
```

- [ ] **Step 2: Store the deterministic cart id**

```js
{ id: cartId, productId: bean.id, name: bean.name, price: bean.price, size: bean.size, category: bean.category, quantity: 1 }
```

- [ ] **Step 3: Add size metadata to add-to-cart tracking**

```js
variant: bean.size,
```

- [ ] **Step 4: Verify manually**

Add the same coffee once at 100g and once at 200g. Expected: two cart lines, separate quantities, correct total and WhatsApp text.

### Task 3: Add the product-page size selector

**Files:**
- Modify: `src/pages/ProductDetail.jsx`

**Interfaces:**
- Consumes: `bean.variants`, `selectBeanVariant`.
- Produces: `selectedBean` used by price, WhatsApp order, add-to-cart, JSON-LD offer, and mobile sticky CTA.

- [ ] **Step 1: Establish selection state that resets when the product changes**

```js
const variants = bean?.variants || [];
const [selectedSize, setSelectedSize] = useState("");
useEffect(() => setSelectedSize(variants[0]?.size || ""), [bean?.id]);
const selectedVariant = variants.find((variant) => variant.size === selectedSize) || variants[0];
const selectedBean = bean ? selectBeanVariant(bean, selectedVariant) : null;
```

- [ ] **Step 2: Render a semantic size choice control when multiple variants exist**

```jsx
<fieldset aria-label="Bag size" className="mt-5">
  <legend className="text-[11px] uppercase tracking-[0.16em] text-white/32">Choose size</legend>
  <div className="mt-2 flex gap-2">
    {variants.map((variant) => <button key={variant.size} type="button" aria-pressed={selectedSize === variant.size} onClick={() => setSelectedSize(variant.size)}>{variant.size}<span>RM {variant.price}</span></button>)}
  </div>
</fieldset>
```

- [ ] **Step 3: Replace purchase-flow uses of `bean` with `selectedBean`**

Use `selectedBean` for the visible price, `buildSingleOrderUrl`, `trackAddToCart`, `addToCart`, mobile CTA, and JSON-LD `offers.price`; retain `bean` for descriptive fields and routing.

- [ ] **Step 4: Run build and visual check**

Run: `npm.cmd run build`

Expected: Vite build passes. In the browser, one-size coffees retain their clean single-price layout; a multi-size product shows both selected state and exact price.

### Task 4: Add the Contentful authoring field and product values

**Files:**
- Contentful content type: `drunkCoffeeRoasters` (browser UI)
- Contentful entries: the three existing draft entries

**Interfaces:**
- Consumes: JSON field `variants`.
- Produces: values suitable for the frontend mapper.

- [ ] **Step 1: Add a non-required JSON Object field**

Name: `Variants`; field id: `variants`; validation: JSON array; leave it optional to protect existing entries.

- [ ] **Step 2: Enter exact draft values**

```json
[{"size":"100g","price":59},{"size":"200g","price":89}]
```

Use this on both ALO drafts. Use the following on Panama Lamastus:

```json
[{"size":"100g","price":89}]
```

- [ ] **Step 3: Leave drafts unpublished**

Do not set `active` true or publish as part of variant setup.

## Self-Review

- Spec coverage: Contentful authoring, product choice, cart identity, WhatsApp output, and analytics are all covered.
- Placeholder scan: no implementation placeholders remain.
- Type consistency: `variants` is always an array of `{ size, price }`; `selectedBean` always retains legacy `size` and `price` for existing UI helpers.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-21-coffee-size-variants.md`. The user asked to proceed, so use inline execution in this session, keeping Contentful changes as a separately confirmed browser action.
