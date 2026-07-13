# Brand Color System v2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Execute this plan task-by-task in the current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the supplied cream, charcoal, kraft, dusty-pink, copper-gold, soft-white, and light-kraft palette the single source of truth across every active storefront page.

**Architecture:** Define semantic CSS variables and Tailwind theme aliases in `src/App.css`, then keep existing DCR component names mapped to those semantic tokens for backwards compatibility. Introduce one reusable logo component and use scoped light-theme surfaces to migrate large legacy pages without changing commerce logic.

**Tech Stack:** React, React Router, Tailwind CSS v4, CSS custom properties, Vite, Contentful.

## Global Constraints

- Background `#F6F1E8`; text `#1F1F1F`; kraft `#B68A5A`; accent `#D8A1A8`; premium `#B08D57`; surface `#FCFCFA`; divider `#DDD0BD`.
- Dusty Pink is the primary CTA and interactive accent; it must not become a large page background.
- Product cards use Soft White, a 1px Light Kraft border, and no heavy shadow.
- Preserve cart behavior, Contentful data, pricing, routing, analytics, WhatsApp ordering, and Cloudflare deployment configuration.
- Do not commit, push, or deploy without explicit user authorization.

---

### Task 1: Semantic brand tokens and component primitives

**Files:**
- Modify: `src/App.css`
- Modify: `src/lib/designSystem.js`

**Interfaces:**
- Produces: `--color-background`, `--color-text`, `--color-kraft`, `--color-accent`, `--color-premium`, `--color-surface`, `--color-divider`.
- Produces: legacy `--dcr-*` aliases consumed by current components.

- [ ] **Step 1: Define the exact semantic variables and Tailwind aliases**

```css
:root {
  --color-background: #f6f1e8;
  --color-text: #1f1f1f;
  --color-kraft: #b68a5a;
  --color-accent: #d8a1a8;
  --color-premium: #b08d57;
  --color-surface: #fcfcfa;
  --color-divider: #ddd0bd;
}
```

- [ ] **Step 2: Remap buttons, cards, navigation, links, and page surfaces to tokens**

```css
.dcr-button--primary { background: var(--color-accent); color: var(--color-text); }
.dcr-product-card { background: var(--color-surface); border-color: var(--color-divider); }
.dcr-nav-link:hover { color: var(--color-accent); }
```

- [ ] **Step 3: Run targeted CSS/build verification**

Run: `npm.cmd run build`
Expected: Vite production build succeeds.

### Task 2: Reusable supplied logo

**Files:**
- Create: `public/logo-mark-source.png`
- Create: `public/logo-mark.svg`
- Create: `src/components/DcrLogo.jsx`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/CoffeeBeansPage.jsx`
- Modify: `src/pages/ProductDetail.jsx`
- Modify: `src/pages/WholesalePage.jsx`
- Modify: `src/pages/NotFoundPage.jsx`

**Interfaces:**
- Produces: `DcrLogo({ className, showName })`.

- [ ] **Step 1: Prepare the supplied brewer mark with a transparent olive treatment**

```svg
<filter id="ink"><feColorMatrix values="0 0 0 0 .122 0 0 0 0 .122 0 0 0 0 .122 -.333 -.333 -.333 0 1"/></filter>
```

- [ ] **Step 2: Add the reusable React logo**

```jsx
export default function DcrLogo({ className = "", showName = false }) {
  return <span className={className}><img src="/logo-mark.svg" alt="" />{showName && <span>DRUNK</span>}</span>;
}
```

- [ ] **Step 3: Replace every active-page `/logo.png` reference with `DcrLogo`**

- [ ] **Step 4: Run ESLint on all changed JSX files**

Run: `npx.cmd eslint src/components/DcrLogo.jsx src/pages/HomePage.jsx src/pages/CoffeeBeansPage.jsx src/pages/ProductDetail.jsx src/pages/WholesalePage.jsx src/pages/NotFoundPage.jsx`
Expected: no errors in changed files.

### Task 3: Migrate legacy active pages and carts

**Files:**
- Modify: `src/App.css`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/ProductDetail.jsx`
- Modify: `src/pages/WholesalePage.jsx`
- Modify: `src/pages/NotFoundPage.jsx`

**Interfaces:**
- Consumes: semantic variables from Task 1.
- Produces: `.dcr-brand-v2`, `.dcr-cart-surface`, and `.dcr-editorial-panel` theme surfaces.

- [ ] **Step 1: Apply `dcr-brand-v2` to product, wholesale, and 404 roots**

```jsx
<div className="dcr-brand-v2 min-h-screen">...</div>
```

- [ ] **Step 2: Convert page backgrounds, text, borders, cards, buttons, and navigation with scoped token rules**

```css
.dcr-brand-v2 { background: var(--color-background); color: var(--color-text); }
.dcr-brand-v2 [class*="border-white"] { border-color: var(--color-divider); }
.dcr-brand-v2 [class*="bg-[#1c1814]"] { background: var(--color-surface); }
```

- [ ] **Step 3: Convert both cart drawers to Soft White surfaces using the same tokens**

```jsx
<aside className="dcr-cart-surface ...">...</aside>
```

- [ ] **Step 4: Preserve dark treatment only inside the full-screen photo lightbox**

- [ ] **Step 5: Verify active routes**

Check: `/`, `/shop`, one `/coffee/:slug`, `/wholesale`, and a missing route.
Expected: all page surfaces are cream or soft white, text is charcoal, dusty pink is limited to interactive accents, and no horizontal overflow appears.

### Task 4: Responsive and regression verification

**Files:**
- Verify only; no new files expected.

**Interfaces:**
- Consumes: completed Tasks 1-3.

- [ ] **Step 1: Run source checks**

Run: `git diff --check`
Expected: no whitespace errors.

- [ ] **Step 2: Run the production build**

Run: `npm.cmd run build`
Expected: Vite build succeeds.

- [ ] **Step 3: Inspect desktop at 1440px and mobile at 390px**

Expected: readable typography, stable two-column mobile Shop, no horizontal scrolling, visible logo, and functional navigation/cart buttons.

- [ ] **Step 4: Report changed files and any intentionally retained dark functional overlays**
