# Contentful Bean Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Contentful the authoritative, validated source for the coffee catalog and use its collection metadata to drive product and series matching across the site.

**Architecture:** The browser continues to use Contentful's Delivery API for read-only catalog data. A local, explicitly-run management script will require a separate Content Management API token to create and update entries from a reviewed JSON catalog; it will never run in the browser. The client mapping will normalize slugs, enforce stable ordering, and derive related/series matches from a normalized `collection` field instead of matching arbitrary product text.

**Tech Stack:** React 19, Vite 7, Contentful Delivery API, Contentful Management API, Node.js.

## Global Constraints

- Never expose a Contentful token in client-side source, committed files, command output, or Git history.
- Keep `VITE_CONTENTFUL_DELIVERY_TOKEN` read-only and use `CONTENTFUL_MANAGEMENT_TOKEN` only from a local environment variable for management operations.
- Preserve currently published Contentful entries unless the reviewed catalog explicitly changes them.
- A bean requires: `name`, lowercase kebab-case `slug`, `category`, `price`, `size`, `notes`, `origin`, `process`, `roast`, `active`, and `sortOrder`.
- A multi-product series requires the same non-empty `collection` value on every member.

---

### Task 1: Define the reviewed catalog contract

**Files:**
- Create: `content/beans.json`
- Create: `content/beans.schema.json`
- Test: `scripts/validate-bean-catalog.mjs`

**Interfaces:**
- Consumes: a JSON array of Contentful bean field objects.
- Produces: a validated catalog where every `slug` matches `^[a-z0-9]+(?:-[a-z0-9]+)*$` and every `collection` is either an empty string or a shared series name.

- [ ] **Step 1: Add a JSON schema that requires the fields below and rejects unknown values for category**

```json
{
  "type": "object",
  "required": ["name", "slug", "category", "price", "size", "notes", "origin", "process", "roast", "active", "sortOrder", "collection"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "slug": { "type": "string", "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
    "category": { "enum": ["Filter", "Espresso"] },
    "price": { "type": "number", "exclusiveMinimum": 0 },
    "size": { "type": "string", "minLength": 1 },
    "notes": { "type": "array", "minItems": 1, "items": { "type": "string", "minLength": 1 } },
    "origin": { "type": "string", "minLength": 1 },
    "process": { "type": "string", "minLength": 1 },
    "roast": { "type": "string", "minLength": 1 },
    "collection": { "type": "string" },
    "active": { "type": "boolean" },
    "sortOrder": { "type": "integer", "minimum": 1 }
  }
}
```

- [ ] **Step 2: Add the active beans only after the owner has supplied or approved their names, prices, weights, tasting notes, and availability.**

- [ ] **Step 3: Run `node scripts/validate-bean-catalog.mjs` and require zero duplicate slugs and zero duplicate `sortOrder` values.**

### Task 2: Add an explicit Contentful management sync

**Files:**
- Modify: `package.json`
- Create: `scripts/sync-contentful-beans.mjs`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `CONTENTFUL_MANAGEMENT_TOKEN`, `VITE_CONTENTFUL_SPACE_ID`, `VITE_CONTENTFUL_ENVIRONMENT`, `VITE_CONTENTFUL_CONTENT_TYPE`, and `content/beans.json`.
- Produces: Contentful entries with the catalog's fields, then publishes only entries named in the reviewed catalog.

- [ ] **Step 1: Add `contentful-management` as a development dependency and add `"contentful:sync": "node scripts/sync-contentful-beans.mjs"` to `package.json`.**

- [ ] **Step 2: Make the sync script fail before all required variables are present and print only bean names, entry IDs, and action names (`created`, `updated`, `published`).**

- [ ] **Step 3: Implement an explicit `--dry-run` default. Require `--apply` before creating, updating, or publishing Contentful entries.**

- [ ] **Step 4: Run `npm run contentful:sync -- --dry-run`; review the action list; run `npm run contentful:sync -- --apply` only after the catalog is approved.**

### Task 3: Normalize client mapping and series matching

**Files:**
- Modify: `src/lib/coffeeStore.js`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/MonteblancoSeriesPage.jsx`
- Modify: `src/pages/ProductDetail.jsx`

**Interfaces:**
- Consumes: `collection`, `slug`, `sortOrder`, and `active` from Contentful entries.
- Produces: canonical product URLs, deterministic menu ordering, and collection-based related-product sections.

- [ ] **Step 1: Add a `normalizeSlug(value)` helper that lowercases, trims, replaces non-alphanumeric runs with one hyphen, and removes leading or trailing hyphens.**

- [ ] **Step 2: Map all Contentful slugs through `normalizeSlug`, then sort by `sortOrder`, followed by `name.localeCompare` when two entries share an order.**

- [ ] **Step 3: Add a `belongsToCollection(bean, collectionName)` helper that compares trimmed lowercase `collection` values.**

- [ ] **Step 4: Replace each current text-search series filter with `belongsToCollection(bean, "Monteblanco Series")`.**

- [ ] **Step 5: Run `npm run build`; confirm each active bean resolves at `/coffee/<canonical-slug>` and series sections contain only entries assigned to the intended collection.**

### Task 4: Remove insecure duplicate configuration and verify production behavior

**Files:**
- Modify: `src/lib/contentful.js`
- Modify: `.gitignore`
- Create: `.env.example`

**Interfaces:**
- Consumes: build-time Vite delivery configuration.
- Produces: one documented delivery configuration path and no hard-coded Contentful credential in source.

- [ ] **Step 1: Remove the unused hard-coded Contentful client from `src/lib/contentful.js`, or replace it with a configuration-only module that reads Vite environment variables.**

- [ ] **Step 2: Ensure `.env` is ignored and `.env.example` contains only blank variable names.**

- [ ] **Step 3: Run `npm run build` with valid local delivery configuration and verify the menu loads active Contentful entries rather than fallback data.**

## Self-Review

- Spec coverage: catalog validation is Task 1; Contentful creation/update is Task 2; page matching and canonical product URLs are Task 3; credential safety is Task 4.
- Placeholder scan: no implementation task relies on an unspecified code symbol; the catalog content itself remains intentionally owner-approved business data.
- Type consistency: Tasks 1 and 2 exchange JSON field objects; Task 3 consumes the mapped bean fields; Task 4 only changes configuration sources.
