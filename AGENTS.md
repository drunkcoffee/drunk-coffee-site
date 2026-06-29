# Collaboration preferences

- The user prefers Codex-made VS Code changes to be visually distinguishable. When presenting or summarizing edits, mark Codex-owned changes with the blue-square marker `🟦 Codex change`.
- Do not add ownership comments, decorative color codes, or other markers to production source files solely to identify Codex edits; preserve the codebase's style. VS Code's built-in Git diff gutter remains the source of truth for exact changed lines.

# Drunk Coffee Roasters product pricing rules

## Product packaging rules

- Standard coffee package sizes are 100g, 200g, and 1kg.
- Use customer-facing package labels:
  - 100g Trial Pack
  - 200g Daily Bag
  - 1kg Value Bag
- Product cards should show the lowest available price as `From RMxx`.
- Product cards should stay clean and should not show every package price.
- Full package pricing belongs on the product detail page.

## Pricing strategy

- Do not force all coffees into the same price.
- Use tier-based pricing based on green coffee cost.
- Daily coffees can publicly show 1kg pricing.
- Rare, Gesha, competition, and ultra-rare coffees should use `Ask for availability` for 1kg unless explicitly approved.

## Product listing order

- Active coffee products should generally be displayed from lowest price to highest price.
- Use the lowest available numeric package price from `packageOptions` when available.
- Ignore `null` prices such as `Ask for availability` when calculating the lowest price.
- If `packageOptions` is missing, fall back to the existing `price` field.
- Inactive products must never appear on public product listings, homepage product sections, featured sections, related product sections, or WhatsApp product selection flow.
- Do not let outdated manual `sortOrder` override the cheapest-to-most-expensive order unless a section is intentionally curated as a featured section.

## Collection / Series rules

- When multiple coffees share the same producer, origin, processing concept, or release theme, prefer creating a clear customer-facing Series or Collection instead of listing them as unrelated products.
- Series pages or sections should help customers choose between coffees, not overwhelm them.
- A good Series structure should include:
  - Series title
  - Short customer-friendly description
  - Included coffees
  - Simple comparison
  - Best option for undecided customers
  - Bundle highlight if a bundle exists
- Use clear names such as "Finca Milan Series", "Monteblanco Series", or "Gesha Series".
- Avoid overly technical collection names.
- Bundle products should remain separate Contentful products and should not overwrite individual coffee products.
- Use image2 as the preferred product image source where suitable.
- Supplier screenshots must not be used as final customer-facing images.
- Series copy should stay approachable, premium, and easy to buy.

## Contentful rules

- Prefer `packageOptions` as a JSON field when available.
- `packageOptions` should support:
  - `size`
  - `label`
  - `price`
- If `price` is `null`, display `Ask for availability`.
- If `packageOptions` is missing, safely fall back to existing `price` and `size` fields.
- Never break product pages because of missing optional Contentful fields.

## Customer language

- Keep product labels simple and buyer-friendly.
- Avoid overly technical brew labels.
- Do not use Chemex as a Best For label.
- Prefer Pour Over, Espresso Friendly, Milk Coffee, French Press, Daily Brew, and Limited Release.

## Brew label rules

- Do not label every coffee as suitable for espresso.
- Use `Espresso Friendly` only for coffees that are genuinely suitable for espresso or milk coffee.
- Filter-focused, rare, Gesha, and highly processed coffees should usually be labeled as Pour Over, Daily Brew, or Limited Release instead of Espresso.
- If a filter coffee can technically be brewed as espresso but may taste bright, use language like `Possible but bright` instead of `Espresso Friendly`.
- Keep customer-facing brew labels simple and honest.
- Avoid Chemex as a brew label.
- Preferred labels: Pour Over, Espresso Friendly, Milk Coffee, French Press, Daily Brew, Limited Release.

## Brand direction

- Drunk Coffee Roasters should feel approachable, premium, and easy to buy.
- Use 100g as the low-friction entry point.
- Use 200g as the main home-brewing size.
- Use 1kg as the best-value option for repeat drinkers, offices, and espresso users.
