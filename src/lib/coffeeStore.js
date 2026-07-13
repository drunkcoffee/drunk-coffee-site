import { useEffect, useMemo, useState } from "react";

export const WHATSAPP_NUMBER = "601127060012";
export const INSTAGRAM_URL = "https://instagram.com/drunkcoffeeroasters";
export const XHS_LABEL = "Drunkcoffeeroasters";
export const FILTERS = ["All Coffee", "Espresso Friendly", "Pour Over", "Bundles", "Limited Release"];

export const LIGHT_BUTTON_STYLE = { color: "#151515" };
export const APP_BG = "bg-[#0d0d0b] text-[#f3eee3]";
export const PANEL =
  "rounded-[24px] border border-white/10 bg-white/[0.035] backdrop-blur-sm shadow-[0_18px_50px_rgba(0,0,0,0.22)]";
export const SOFT_PANEL =
  "rounded-[22px] border border-white/8 bg-white/[0.025] backdrop-blur-sm";
export const LIGHT_BUTTON =
  "inline-flex items-center justify-center rounded-full bg-[#efe8db] px-5 py-3 text-sm font-semibold tracking-[0.01em] transition duration-200 hover:bg-[#f6f0e6] active:scale-[0.98]";
export const DARK_BUTTON =
  "inline-flex items-center justify-center rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-medium text-white/80 transition duration-200 hover:border-white/20 hover:bg-white/[0.05] hover:text-white active:scale-[0.98]";
export const EYEBROW =
  "font-body text-[10px] uppercase tracking-[0.28em] text-white/34";

export const HOW_TO_ORDER_STEPS = [
  {
    step: "01",
    title: "Browse the menu",
    body: "Pick your coffees - filter, espresso, or both. Check tasting notes and roast profiles.",
  },
  {
    step: "02",
    title: "Add to cart",
    body: "Combine multiple bags into one order. Quantities adjust right inside the cart.",
  },
  {
    step: "03",
    title: "Send on WhatsApp",
    body: "Your full order is pre-formatted. Hit send and we confirm roasting lead time.",
  },
];

export const NAV_LINKS = [
  ["Shop", "#shop"],
  ["Wholesale", "#wholesale"],
  ["Story", "#story"],
  ["About", "#about"],
];

export const FALLBACK_BEANS = [
  {
    id: "spring-bloom-blend",
    slug: "spring-bloom-blend",
    name: "Spring Bloom Blend",
    category: "Filter",
    collection: "Seasonal Highlight",
    price: 49,
    size: "200g",
    variants: [{ size: "200g", price: 49 }],
    notes: ["Floral", "Citrus", "Silky Body"],
    tagline: "Floral, silky, and easy to love.",
    description:
      "A clean and expressive blend that feels festive, floral, and easy to enjoy.",
    roast: "Light",
    origin: "Ethiopia Hambella Guji Goro / China Yunnan Lan Chang",
    process: "Washed + Anaerobic Natural Blend",
    variety: "",
    brewguide: `15g coffee\n240g water\n2:30 - 2:45\nMedium grind\n92-93 C`,
    featured: true,
    badge: "Seasonal",
    bestFor: "Clean filter",
    wholesaleAvailable: true,
    sortOrder: 1,
    active: true,
    image: "",
    flavorImage: "",
  },
  {
    id: "lan-chang",
    slug: "lan-chang",
    name: "Lan Chang",
    category: "Filter",
    collection: "Experimental Fruit",
    price: 59,
    size: "200g",
    variants: [{ size: "200g", price: 59 }],
    notes: ["Red Wine", "Raisin", "Wine Chocolate"],
    tagline: "Winey fruit with a deeper, expressive finish.",
    description:
      "A bold anaerobic natural from Baoshan, Yunnan. Expect red wine aromatics, raisin sweetness, and a smooth wine-chocolate finish.",
    roast: "Medium Light",
    origin: "China Yunnan",
    process: "Anaerobic Natural",
    variety: "",
    brewguide: `15g coffee\n240g water\n2:30 - 2:45\nMedium grind\n92-93 C`,
    featured: true,
    badge: "Limited",
    bestFor: "Fruity filter / adventurous cup",
    wholesaleAvailable: true,
    sortOrder: 2,
    active: true,
    image: "",
    flavorImage: "",
  },
  {
    id: "south-blend",
    slug: "south-blend",
    name: "South Blend",
    category: "Espresso",
    collection: "Espresso Lovers",
    price: 49,
    size: "200g",
    variants: [{ size: "200g", price: 49 }],
    notes: ["Mix Nut", "Chocolate", "Cherry"],
    tagline: "Comforting chocolate sweetness for daily espresso.",
    description:
      "Comforting espresso blend built for daily milk drinks and approachable black coffee.",
    roast: "Medium",
    origin: "Brazil Fazendal Pinhal / Colombia Supremo",
    process: "Washed + Natural Blend",
    variety: "",
    brewguide: `18g in\n36-40g out\n28-32 seconds\n92-93 C`,
    featured: false,
    badge: "Best Seller",
    bestFor: "Espresso Friendly / Milk Coffee / Daily Brew",
    espressoUse: "Espresso Friendly",
    wholesaleAvailable: true,
    sortOrder: 3,
    active: true,
    image: "",
    flavorImage: "",
  },
];

const STANDARD_PACKAGE_OPTIONS = [
  { size: "100g", label: "Trial Pack" },
  { size: "200g", label: "Daily Bag" },
];

const REMOVED_PUBLIC_PACKAGE_SIZES = new Set(["1kg", "1 kg", "1000g", "1000 g"]);

function isPublicPackageSize(size) {
  const normalized = String(size || "").trim().toLowerCase();
  return normalized && !REMOVED_PUBLIC_PACKAGE_SIZES.has(normalized);
}

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function safeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function safeJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function packageLabelForSize(size, fallback = "") {
  const standard = STANDARD_PACKAGE_OPTIONS.find((option) => option.size === size);
  return String(fallback || standard?.label || "").trim();
}

export function isPackageAvailable(option) {
  return option?.price !== null && option?.price !== "" && Number.isFinite(Number(option?.price));
}

export function formatPackagePrice(option, quantity = 1) {
  if (!isPackageAvailable(option)) return "Ask for availability";
  return `RM${Number(option.price) * Math.max(1, Number.parseInt(quantity, 10) || 1)}`;
}

function parseNumericPrice(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = String(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function normalizeVariants(value, fallback = {}) {
  const variants = safeJsonArray(value)
    .map((item) => ({
      size: String(item?.size || "").trim(),
      label: packageLabelForSize(String(item?.size || "").trim(), item?.label),
      price: item?.price === null ? null : Number(item?.price),
    }))
    .filter((item) => isPublicPackageSize(item.size) && (item.price === null || (Number.isFinite(item.price) && item.price >= 0)));

  if (variants.length) return variants;

  const fallbackSize = String(fallback.size || "200g");
  if (!isPublicPackageSize(fallbackSize)) {
    return [{
      size: "200g",
      label: packageLabelForSize("200g"),
      price: null,
    }];
  }
  return [{
    size: fallbackSize,
    label: packageLabelForSize(fallbackSize),
    price: Number(fallback.price || 0),
  }];
}

export function selectBeanVariant(bean, variant) {
  const selected = variant || bean?.variants?.[0] || {
    size: bean?.size || "200g",
    label: packageLabelForSize(bean?.size || "200g"),
    price: Number(bean?.price || 0),
  };
  return {
    ...bean,
    size: selected.size,
    packageLabel: selected.label || packageLabelForSize(selected.size),
    price: selected.price,
    variantId: `${bean.id}:${selected.size}`,
  };
}

export function formatBeanPrice(bean) {
  const lowest = getLowestBeanPrice(bean);
  if (!Number.isFinite(lowest)) return "Ask for availability";
  return `From RM${lowest}`;
}

export function formatAddToCartPrice(bean) {
  const lowest = getLowestBeanPrice(bean);
  if (!Number.isFinite(lowest)) return "Ask for availability";

  const numericPrices = (bean?.variants || [])
    .map((variant) => parseNumericPrice(variant?.price))
    .filter(Number.isFinite);
  const uniquePrices = new Set(numericPrices);

  return uniquePrices.size > 1 ? `from RM${lowest}` : `RM${lowest}`;
}

export function getLowestBeanPrice(bean) {
  const variants = bean?.variants || [];
  const variantPrices = variants
    .map((variant) => parseNumericPrice(variant?.price))
    .filter(Number.isFinite);
  if (variantPrices.length) return Math.min(...variantPrices);

  const fallbackPrice = parseNumericPrice(bean?.price);
  return Number.isFinite(fallbackPrice) ? fallbackPrice : Number.POSITIVE_INFINITY;
}

function sortBeansByLowestPrice(beans) {
  return [...beans].sort((a, b) => {
    const priceDelta = getLowestBeanPrice(a) - getLowestBeanPrice(b);
    return priceDelta || a.name.localeCompare(b.name);
  });
}

const visibleFallbackBeans = sortBeansByLowestPrice(
  FALLBACK_BEANS.filter((bean) => bean.active !== false),
);

export function formatPackageLabel(option) {
  const label = option?.label || packageLabelForSize(option?.size || "");
  return [option?.size, label].filter(Boolean).join(" ");
}

export function getPackageSizeSummary(bean) {
  const variants = bean?.variants?.length ? bean.variants : normalizeVariants(null, bean);
  return variants.map((variant) => variant.size).filter(Boolean).join(" / ");
}

export function getSimplePositioning(bean) {
  const labels = getBestForLabels(bean);
  if (getEspressoUse(bean) === "Espresso Friendly") return "Espresso Friendly";
  if (labels.includes("Daily Brew")) return "Daily Brew";
  if (labels.includes("Milk Coffee")) return "Great with milk";
  if (labels.includes("French Press")) return "Fuller home brew";
  if (labels.includes("Pour Over")) return "Clean pour over";
  if (labels.includes("Limited Release")) return "Limited Release";
  return getConfidenceLevel(bean);
}

function beanText(bean) {
  return [
    bean?.name,
    bean?.category,
    bean?.collection,
    bean?.tagline,
    bean?.description,
    bean?.origin,
    bean?.process,
    bean?.roast,
    bean?.badge,
    bean?.bestFor,
    ...safeArray(bean?.notes),
  ].filter(Boolean).join(" ").toLowerCase();
}

function fieldArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/[,/|]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function getTasteStyles(bean) {
  const explicit = fieldArray(bean?.tasteStyle || bean?.tasteStyles);
  if (explicit.length) return explicit.slice(0, 4);

  const text = beanText(bean);
  const styles = [];
  const add = (label, tests) => {
    if (tests.some((test) => text.includes(test))) styles.push(label);
  };

  add("Fruity", ["fruit", "berry", "mango", "orange", "apple", "peach", "grape", "tropical", "citrus"]);
  add("Floral", ["floral", "flower", "jasmine", "rose"]);
  add("Chocolatey", ["chocolate", "cacao", "cocoa", "mocha"]);
  add("Nutty", ["nut", "almond", "hazelnut", "peanut"]);
  add("Sweet", ["sweet", "caramel", "honey", "sugar", "molasses"]);
  add("Low Acid", ["low acid", "low-acid", "smooth", "mellow"]);
  add("Bright", ["bright", "citrus", "sparkling", "juicy"]);
  add("Heavy Body", ["heavy body", "full body", "full-bodied", "creamy", "syrupy"]);
  add("Clean", ["clean", "washed", "clear", "clarity"]);
  add("Funky", ["funky", "anaerobic", "experimental", "ferment"]);
  add("Winey", ["wine", "winey", "grape"]);

  if (styles.length) return [...new Set(styles)].slice(0, 4);
  return bean?.category === "Espresso" ? ["Chocolatey", "Sweet"] : ["Clean", "Sweet"];
}

export function getBestForLabels(bean) {
  const explicit = fieldArray(bean?.bestForLabels || bean?.bestFor);
  const allowed = ["Pour Over", "Espresso Friendly", "Milk Coffee", "French Press", "Daily Brew", "Limited Release"];
  const aliasMap = {
    espresso: "Espresso Friendly",
    "espresso friendly": "Espresso Friendly",
    "latte / milk coffee": "Milk Coffee",
    latte: "Milk Coffee",
    "milk drinks": "Milk Coffee",
    "black coffee": "Daily Brew",
    americano: "Daily Brew",
    "cold brew": "Pour Over",
    chemex: "Pour Over",
  };
  const normalized = explicit
    .map((label) => aliasMap[label.toLowerCase()] || allowed.find((allowedLabel) => allowedLabel.toLowerCase() === label.toLowerCase()) || label)
    .filter((label) => allowed.includes(label));
  if (normalized.length) return [...new Set(normalized)].slice(0, 5);

  const text = beanText(bean);
  const isEspresso = bean?.category === "Espresso" || text.includes("espresso");
  const isLimited = text.includes("limited") || text.includes("gesha") || text.includes("competition");
  const isLowAcid = text.includes("low acid") || text.includes("smooth") || text.includes("mellow");
  const isCold = text.includes("cold brew");

  const labels = isEspresso
    ? ["Espresso Friendly", "Milk Coffee", "Daily Brew"]
    : ["Pour Over", "Daily Brew"];

  if (!isEspresso && (text.includes("body") || text.includes("chocolate") || isLowAcid)) labels.push("French Press");
  if (isCold || isLowAcid || text.includes("chocolate")) labels.push("Pour Over");
  if (isLimited) labels.push("Limited Release");

  return [...new Set(labels)].slice(0, 5);
}

export function getEspressoUse(bean) {
  const value = String(bean?.espressoUse || "").trim();
  if (value) return value;

  const text = beanText(bean);
  if (getBestForLabels(bean).includes("Espresso Friendly")) return "Espresso Friendly";
  if (text.includes("gesha") || text.includes("competition") || text.includes("rare")) return "Not recommended";
  if (text.includes("fruit") || text.includes("ferment") || text.includes("anaerobic") || text.includes("natural")) {
    return "Possible but bright";
  }
  return "";
}

export function getEspressoUseDescription(bean) {
  const value = getEspressoUse(bean);
  if (value === "Espresso Friendly") return "Recommended for espresso and milk coffee.";
  if (value.toLowerCase().includes("possible")) return "Possible, but expect a brighter and more expressive cup.";
  if (value === "Not recommended") return "Not recommended for espresso; best enjoyed as filter coffee.";
  return value;
}

export function getDisplayCategory(bean) {
  if (getEspressoUse(bean) === "Espresso Friendly") return "Espresso Friendly";
  if (getBestForLabels(bean).includes("Limited Release")) return "Limited Release";
  return bean?.category || "Coffee";
}

export function getConfidenceLevel(bean) {
  if (bean?.confidenceLevel) return bean.confidenceLevel;
  if (bean?.customerType) {
    return bean.customerType === "Curious Drinkers" ? "For Curious Drinkers" : bean.customerType;
  }

  const text = beanText(bean);
  if (text.includes("limited") || text.includes("gesha") || text.includes("anaerobic") || text.includes("wine") || text.includes("funk")) {
    return "For Advanced Coffee Lovers";
  }
  if (text.includes("floral") || text.includes("fruit") || text.includes("bright") || text.includes("experimental")) {
    return "For Curious Drinkers";
  }
  return "Easy Pick";
}

export function getDisplayBadges(bean, limit = 4) {
  const bestFor = getBestForLabels(bean);
  const tastes = getTasteStyles(bean);
  const badgeLabel = (label) => {
    if (label === "Latte / Milk Coffee") return "MILK COFFEE";
    if (label === "Low Acid") return "LOW ACID";
    return label.toUpperCase();
  };
  const badges = [
    getEspressoUse(bean) === "Espresso Friendly" ? "ESPRESSO FRIENDLY" : "POUR OVER",
    ...bestFor.map(badgeLabel),
    ...tastes.map(badgeLabel),
  ];

  if (getConfidenceLevel(bean) === "Easy Pick") badges.push("EASY PICK");
  if (String(bean?.badge || "").toLowerCase().includes("limited") || beanText(bean).includes("limited")) badges.push("LIMITED RELEASE");

  return [...new Set(badges)].slice(0, limit);
}

export function getBuyThisIf(bean) {
  if (bean?.buyThisIf) return bean.buyThisIf;

  const tastes = getTasteStyles(bean).map((style) => style.toLowerCase());
  const bestFor = getBestForLabels(bean);
  const drink = bestFor.includes("Milk Coffee")
      ? "milk coffee and espresso-style drinks"
      : bestFor[0]?.toLowerCase() || "coffee";

  return `Buy this if you enjoy ${tastes.slice(0, 3).join(", ")} ${drink}.`;
}

export function getSkipThisIf(bean) {
  if (bean?.skipThisIf) return bean.skipThisIf;

  const tastes = getTasteStyles(bean);
  if (tastes.includes("Bright") || tastes.includes("Fruity") || tastes.includes("Winey")) {
    return "Skip this if you prefer low-acid, chocolatey, heavy-bodied coffee.";
  }
  if (bean?.category === "Espresso") {
    return "Skip this if you want a light, floral pour-over as your main cup.";
  }
  return "Skip this if you want a bold espresso roast for milk drinks.";
}

export function getGuideMatches(bean, guide) {
  const bestFor = getBestForLabels(bean);
  const tastes = getTasteStyles(bean);
  const confidence = getConfidenceLevel(bean);
  const text = beanText(bean);

  if (guide === "Pour Over") return bestFor.includes("Pour Over");
  if (guide === "Espresso Friendly") return getEspressoUse(bean) === "Espresso Friendly";
  if (guide === "Milk Coffee") return bestFor.includes("Milk Coffee");
  if (guide === "French Press") return bestFor.includes("French Press");
  if (guide === "Daily Brew") return bestFor.includes("Daily Brew");
  if (guide === "Limited Release") return bestFor.includes("Limited Release") || text.includes("limited");
  if (guide === "Americano") return bestFor.includes("Pour Over");
  if (guide === "Latte / Milk Coffee") return bestFor.includes("Milk Coffee");
  if (guide === "Low Acidity") return tastes.includes("Low Acid") || text.includes("smooth") || bean?.category === "Espresso";
  if (guide === "Fruity Coffee") return tastes.some((style) => ["Fruity", "Bright", "Winey", "Floral"].includes(style));
  if (guide === "Easy Pick") return confidence === "Easy Pick";
  return false;
}

export function getProductFilterMatches(bean, filter) {
  if (filter === "All" || filter === "All Coffee") return true;
  if (filter === "Bundles") return beanText(bean).includes("bundle");
  return getGuideMatches(bean, filter);
}

export function getSimilarBeans(bean, beans, limit = 3) {
  if (!bean) return [];
  const baseBestFor = getBestForLabels(bean);
  const baseTaste = getTasteStyles(bean);
  return beans
    .filter((item) => item.slug !== bean.slug)
    .map((item) => {
      const bestForScore = getBestForLabels(item).filter((label) => baseBestFor.includes(label)).length * 2;
      const tasteScore = getTasteStyles(item).filter((label) => baseTaste.includes(label)).length;
      const categoryScore = item.category === bean.category ? 2 : 0;
      return { item, score: bestForScore + tasteScore + categoryScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

export function appendImageParams(url, params = {}) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      parsed.searchParams.set(key, String(value));
    });
    return parsed.toString();
  } catch {
    return url;
  }
}

function getEnv() {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env;
    }
  } catch {
    return {};
  }
  return {};
}

export function normalizeContentfulImage(asset) {
  const url = asset?.fields?.file?.url || asset?.url || "";
  if (!url) return "";
  const normalized = url.startsWith("//") ? `https:${url}` : url;
  try {
    const parsed = new URL(normalized);
    parsed.searchParams.set("w", "1600");
    parsed.searchParams.set("h", "1600");
    parsed.searchParams.set("fit", "pad");
    parsed.searchParams.set("fm", "webp");
    parsed.searchParams.set("q", "86");
    return parsed.toString();
  } catch {
    return normalized;
  }
}

const FLAVOR_IMAGE_OVERRIDES = {
  "alo-sidama-g1-natural-slow-dry": "/flavors/alo-sidama-g1-natural-slow-dry.png",
  "alo-bona-zuria-gute-natural-g1": "/flavors/alo-bona-zuria-gute-natural-g1.png",
  "bensa-arsi-g1": "/flavors/bensa-arsi-g1.png",
  "april": "/flavors/april.png",
  "colombia-finca-milan-niu": "/flavors/colombia-finca-milan-niu.png",
  "watermelon": "/flavors/watermelon.png",
  "el-diviso-ombligon": "/flavors/el-diviso-ombligon.png",
  "fazenda-pinhal": "/flavors/fazenda-pinhal.png",
  "iri-s-esta-te-sym-bio-sis": "/flavors/iris-estate-symbiosis.png",
  "lan-chang": "/flavors/lan-chang.png",
  "panama-lamastus-gesha-alto-quiel-selecto-natural": "/flavors/panama-lamastus-gesha-alto-quiel-selecto-natural.png",
  "meranti-liberica-g1": "/flavors/meranti-liberica-g1.png",
  "paraiso-java": "/flavors/paraiso-java.png",
  "spring-bloom-blend": "/flavors/spring-bloom-blend.png",
};

export function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function inferTagline({ name = "", slug = "", category = "", bestFor = "" }) {
  const key = `${name} ${slug}`.toLowerCase();

  if (key.includes("mango")) return "Bold, tropical and juicy.";
  if (key.includes("apple")) return "Clean, crisp and structured.";
  if (key.includes("orange blossom")) return "Floral, light and elegant.";
  if (key.includes("spring bloom")) return "Floral, silky, and easy to love.";
  if (key.includes("lan chang")) return "Winey fruit with a deeper, expressive finish.";
  if (key.includes("south blend")) return "Comforting chocolate sweetness for milk coffee and daily brewing.";

  if (bestFor) return `Built for ${bestFor.toLowerCase()}.`;
  if (category === "Espresso") return "Espresso Friendly for balanced shots and milk drinks.";
  return "Roasted for clarity, sweetness, and an easy daily cup.";
}

export function normalizeAudience(value, category = "") {
  if (value) return value;
  return category === "Espresso"
    ? "Espresso Friendly / Milk Coffee"
    : "Pour Over / Daily Brew";
}

function parseBuyerGuidance(value = "") {
  const text = String(value || "");
  if (!text.includes("Buyer Guidance")) return {};

  const readLine = (label) => {
    const match = text.match(new RegExp(`${label}:\\s*([^\\n]+)`, "i"));
    return match?.[1]?.trim() || "";
  };

  return {
    bestForLabels: readLine("Best For"),
    tasteStyle: readLine("Taste Style"),
    buyThisIf: readLine("Buy This If"),
    skipThisIf: readLine("Skip This If"),
    confidenceLevel: readLine("Confidence Level"),
    altitude: readLine("Altitude"),
    espressoUse: readLine("Espresso Use"),
  };
}

export function mapContentfulEntries(data) {
  const items = Array.isArray(data?.items) ? data.items : [];
  const includes = Array.isArray(data?.includes?.Asset)
    ? data.includes.Asset
    : [];

  const assetMap = includes.reduce((acc, asset) => {
    if (asset?.sys?.id) acc[asset.sys.id] = asset;
    return acc;
  }, {});

  return items.map((item) => {
    const fields = item.fields || {};
    const slug = normalizeSlug(fields.slug || fields.name || item.sys.id);
    const imageId = fields.image?.sys?.id;
    const image2Id = fields.image2?.sys?.id;
    const flavorImageId = fields.flavorImage?.sys?.id || fields.flavourImage?.sys?.id;
    const asset = imageId ? assetMap[imageId] : null;
    const image2Asset = image2Id ? assetMap[image2Id] : null;
    const flavorAsset = flavorImageId ? assetMap[flavorImageId] : null;
    const notes = safeArray(fields.notes || fields.tastingNotes);
    const bestFor = normalizeAudience(fields.bestfor || fields.bestFor || "", fields.category || "Filter");
    const buyerGuidance = parseBuyerGuidance(fields.brewguide || "");

    const variants = normalizeVariants(fields.packageOptions || fields.variants, {
      size: fields.size,
      price: fields.price,
    });

    return {
      id: item.sys.id,
      slug,
      name: fields.name || "Untitled Coffee",
      category: fields.category || "Filter",
      collection: fields.collection || "",
      price: variants[0].price,
      size: variants[0].size,
      variants,
      notes,
      tagline: fields.tagline || inferTagline({
        name: fields.name || "",
        slug: fields.slug || item.sys.id,
        category: fields.category || "Filter",
        bestFor,
      }),
      description: fields.description || "",
      roast: fields.roast || "",
      origin: fields.origin || "",
      process: fields.process || "",
      variety: fields.variety || "",
      altitude: fields.altitude || buyerGuidance.altitude || "",
      brewguide: fields.brewguide || "",
      featured: Boolean(fields.featured),
      badge: fields.badge || "",
      bestFor,
      bestForLabels: fields.bestForLabels || fields.bestForList || fields.bestforList || buyerGuidance.bestForLabels || "",
      tasteStyle: fields.tasteStyle || fields.tasteStyles || buyerGuidance.tasteStyle || "",
      buyThisIf: fields.buyThisIf || buyerGuidance.buyThisIf || "",
      skipThisIf: fields.skipThisIf || buyerGuidance.skipThisIf || "",
      confidenceLevel: fields.confidenceLevel || fields.customerType || buyerGuidance.confidenceLevel || "",
      espressoUse: fields.espressoUse || buyerGuidance.espressoUse || "",
      wholesaleAvailable: Boolean(fields.wholesaleAvailable),
      sortOrder: Number(fields.sortOrder || 999),
      active: fields.active !== false,
      image: normalizeContentfulImage(image2Asset) || normalizeContentfulImage(asset) || FLAVOR_IMAGE_OVERRIDES[slug] || "",
      flavorImage: normalizeContentfulImage(flavorAsset) || normalizeContentfulImage(image2Asset) || FLAVOR_IMAGE_OVERRIDES[slug] || "",
    };
  });
}

export async function fetchBeansFromContentful() {
  const env = getEnv();

  const spaceId = env.VITE_CONTENTFUL_SPACE_ID || "";
  const environment = env.VITE_CONTENTFUL_ENVIRONMENT || "master";

  const accessToken =
    env.VITE_CONTENTFUL_DELIVERY_TOKEN ||
    env.VITE_CONTENTFUL_ACCESS_TOKEN ||
    "";

  const contentType =
    env.VITE_CONTENTFUL_CONTENT_TYPE ||
    "drunkCoffeeRoasters";

  if (!spaceId || !accessToken) {
    return {
      beans: visibleFallbackBeans,
      warning:
        "Contentful environment variables are missing. Showing fallback coffee list.",
    };
  }

  const endpoint =
    `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries` +
    `?content_type=${contentType}&include=2`;

  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Contentful request failed with status ${response.status}`);
  }

  const data = await response.json();
  const mapped = mapContentfulEntries(data)
    .filter((bean) => bean.active !== false)
    .sort((a, b) => {
      const priceDelta = getLowestBeanPrice(a) - getLowestBeanPrice(b);
      return priceDelta || a.name.localeCompare(b.name);
    });

  return {
    beans: mapped.length ? mapped : visibleFallbackBeans,
    warning: mapped.length
      ? ""
      : "Contentful returned no active coffee entries. Showing fallback coffee list.",
  };
}

export function badgeClasses(badge) {
  const map = {
    New: "border border-emerald-200/20 bg-emerald-200/10 text-emerald-100",
    "Best Seller": "border border-amber-200/20 bg-amber-200/10 text-amber-100",
    Limited: "border border-stone-200/18 bg-stone-200/8 text-stone-100",
    Seasonal: "border border-orange-200/20 bg-orange-200/10 text-orange-100",
    Wholesale: "border border-sky-200/20 bg-sky-200/10 text-sky-100",
    Recommended:
      "border border-violet-200/20 bg-violet-200/10 text-violet-100",
  };
  return map[badge] || "border border-white/12 bg-white/[0.05] text-white/74";
}

export function buildSingleOrderUrl(bean, quantity = 1) {
  const name = String(bean?.name || "Coffee").trim() || "Coffee";
  const size = String(bean?.size || "Standard size").trim() || "Standard size";
  const label = String(bean?.packageLabel || packageLabelForSize(size)).trim();
  const category = String(bean?.category || "Coffee").trim() || "Coffee";
  const orderQuantity = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const available = isPackageAvailable(bean);
  const message = available
    ? `Hi Drunk Coffee Roasters, I'd like to order:\n\n${name}\nPack: ${formatPackageLabel({ size, label })}\nQty: ${orderQuantity}\nCategory: ${category}\nTotal: ${formatPackagePrice(bean, orderQuantity)}\n\nCan you confirm availability, roast timing, payment, and delivery?`
    : `Hi Drunk Coffee Roasters, I'd like to ask about availability for ${name}.\n\nPack: ${formatPackageLabel({ size, label })}\n\nCan you confirm roast timing, payment, and delivery?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildBundleOrderUrl(bundleBeans, title = "Coffee Set") {
  if (!bundleBeans?.length) return `https://wa.me/${WHATSAPP_NUMBER}`;

  const message = `Hi Drunk Coffee Roasters, I'd like to order the ${title}:\n\n${bundleBeans
    .map((bean, index) => `${index + 1}. ${bean.name} (${bean.size})`)
    .join("\n")}\n\nCan you confirm availability, roast timing, payment, and delivery?`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildCartWhatsAppUrl(cart) {
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0,
  );

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    cart.length
      ? `Hi Drunk Coffee Roasters, I'd like to place an order:\n\n${cart
          .map(
            (item, index) =>
              `${index + 1}. ${item.name} (${[item.size, item.packageLabel].filter(Boolean).join(" ")}) x${item.quantity}\n${
                formatPackagePrice(item, item.quantity)
              }`,
          )
          .join("\n\n")}\n\nTotal: RM ${cartTotal}\n\nCan you confirm availability, roast timing, payment, and delivery?`
      : "Hi Drunk Coffee Roasters, I'm not sure which coffee to choose. I usually drink black coffee / milk coffee and prefer chocolatey / fruity / floral / not too acidic. Can you recommend one?",
  )}`;
}

export function buildGeneralWhatsAppUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I'm not sure which coffee to choose.\n\nI usually drink:\n1. Black coffee / milk coffee\n2. Hand brew / espresso / French press\n3. Prefer: chocolatey / fruity / floral / not too acidic\n\nCan you recommend one?",
  )}`;
}

export function buildWholesaleWhatsAppUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I would like to enquire about wholesale coffee supply.",
  )}`;
}

export function useBeans() {
  const [beans, setBeans] = useState(visibleFallbackBeans);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBeans() {
      try {
        setLoading(true);
        setError("");
        const result = await fetchBeansFromContentful();
        if (!isMounted) return;
        setBeans(result.beans);
        if (result.warning) setError(result.warning);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setBeans(visibleFallbackBeans);
          setError(
            "Could not load Contentful content. Showing fallback coffee list.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBeans();
    return () => {
      isMounted = false;
    };
  }, []);

  return { beans, loading, error };
}

export function usePersistentCart() {
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("drunk-cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("drunk-cart", JSON.stringify(cart));
    } catch {
      // ignore storage failures
    }
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    [cart],
  );

  function addToCart(bean) {
    setCart((current) => {
      const cartId = bean.variantId || `${bean.id}:${bean.size}`;
      const existing = current.find((item) => item.id === cartId);
      if (existing) {
        return current.map((item) =>
          item.id === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...current,
        {
          id: cartId,
          productId: bean.id,
          name: bean.name,
          price: bean.price,
          size: bean.size,
          packageLabel: bean.packageLabel || packageLabelForSize(bean.size),
          category: bean.category,
          quantity: 1,
        },
      ];
    });
  }

  function decreaseCartItem(id) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function increaseCartItem(id) {
    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function removeCartItem(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  return {
    cart,
    setCart,
    cartCount,
    cartTotal,
    addToCart,
    decreaseCartItem,
    increaseCartItem,
    removeCartItem,
    clearCart,
  };
}
