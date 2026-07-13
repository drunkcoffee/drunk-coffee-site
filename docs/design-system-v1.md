# Drunk Coffee Roasters Design System v1.0

## Direction

Drunk Coffee Roasters should feel like an editorial coffee magazine: warm cream, quiet premium, packaging first, and easy to buy. The look is minimal and confident, not black-gold advertising, not loud, and not crowded.

Core words:
- Editorial coffee magazine
- Warm cream
- Quiet premium
- Packaging first
- Segamat specialty coffee
- Clean, confident, not loud

Core image principle:
- Packaging is the product.
- Photography builds emotion.
- Illustration explains flavour.

## Color Tokens

| Token | Hex | Use |
| --- | --- | --- |
| Primary Background | `#F6F0E6` | Page backgrounds, large editorial bands |
| Soft Cream | `#FFF9EF` | Cards, product surfaces, Canva bean-sheet panels |
| Dark Olive | `#263126` | Primary text, headers, primary buttons |
| Charcoal | `#1E1E1A` | Body text, strong labels |
| Muted Gold | `#B89B5E` | Accent lines, selected states, small highlights |
| Warm Brown | `#6E4B2E` | Secondary labels, origin/process metadata |
| Soft Border | `#DDD0BD` | Dividers, card borders, quiet UI structure |

## Type System

- Heading: editorial serif, `Cormorant Garamond`.
- Body: clean sans-serif, `Inter`.
- Product name: clean sans, slightly bold.
- Buttons: uppercase, small letter spacing, compact.
- Avoid negative letter spacing except large editorial headings where it is already established.

## Component Rules

Reusable website components:
- Announcement Bar
- Minimal Header
- Editorial Hero
- Taste Category Cards
- Packaging-first Product Card
- Featured Coffee Section
- Taste Story Section
- Brew Guidance Section
- WhatsApp CTA
- Footer

Cards use an 8px radius, quiet borders, warm cream surfaces, and no nested-card feeling.

## Product Card Rules

Use the real packaging image as the main visual. Do not use fruit/flavour visuals as the product cover.

Visible content only:
- Coffee Name
- Origin
- Process
- From RMxx
- Pour Over / Espresso Friendly badge

Do not place tasting notes on product cards. Tasting notes belong on product detail pages.

Image selection:
- Prefer real packaging photos for product cards, collection modules, and featured coffee sections.
- If Contentful `image` or `image2` is a fruit visual, flavour visual, AI illustration, or tasting-note image, do not use it as a product cover.
- If a coffee is missing a real packaging photo, use the shared packaging mockup placeholder.
- Flavour visuals and illustrations belong only in product-detail taste-story sections.

## Product Detail Order

The detail page content order should be:
1. Large packaging image
2. Coffee name + price
3. Short story
4. Taste notes
5. Best for
6. Skip this if
7. Brew guide
8. WhatsApp / Add to cart

## Homepage Order

1. Announcement bar
2. Minimal header
3. Editorial hero
4. Choose by taste
5. July Highlight: NIU
6. Current Coffees
7. Why Drunk Coffee
8. Journal / Brewing notes
9. WhatsApp order
10. Footer

## Image 2 Direction

Use Image 2 for supporting visuals:
- Hero lifestyle image
- Brewing scene
- Roasting scene
- Farm atmosphere
- Coffee flower / coffee cherry illustration
- Background texture
- Taste category image
- Packaging mockup
- Collection lineup

Prompt style:
- Natural light
- Warm beige
- Editorial
- Premium coffee brand
- Minimal
- Film photography
- Japanese / Scandinavian coffee shop feeling

Avoid:
- Cartoon
- 3D
- Overly saturated colors
- Fake fruit floating
- Generic stock image
- Aggressive advertisement style
- Heavy black-gold advertising
- Luxury perfume style
- Too many props
- Fake logo redesign

## Image Asset Structure

Project image assets live under `src/assets/dcr/`.

| Folder | Use |
| --- | --- |
| `packaging/` | Product cards, collection modules, featured coffee, fallback packaging mockups |
| `lifestyle/` | Hero, brand story, emotional editorial moments |
| `brewing/` | Journal, brewing notes, brew guide support visuals |
| `roasting/` | Why Drunk Coffee, roasting story, small-batch process |
| `origin/` | Origin story, limited release, farm atmosphere |
| `illustration/` | Taste story only; never as product-card covers |
| `texture/` | Subtle background texture only |

## Generated Asset Inventory

Image 2 assets for v1.0:
- `lifestyle/hero-lifestyle-editorial.jpg`
- `packaging/packaging-mockup-standing.png`
- `packaging/packaging-mockup-45angle.png`
- `packaging/collection-lineup.jpg`
- `brewing/brewing-scene.jpg`
- `roasting/roasting-scene.jpg`
- `illustration/coffee-flower-illustration.png`
- `illustration/coffee-leaf-illustration.png`
- `illustration/coffee-cherry-illustration.png`
- `texture/paper-texture.jpg`
