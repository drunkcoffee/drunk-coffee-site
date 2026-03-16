import { ShoppingCart, Instagram } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FALLBACK_BEANS = [
  {
    id: "spring-bloom-blend",
    slug: "spring-bloom-blend",
    name: "Spring Bloom Blend",
    category: "Filter",
    collection: "Seasonal Highlight",
    price: 49,
    size: "200g",
    notes: ["Floral", "Citrus", "Silky Body"],
    description:
      "A clean and expressive blend that feels festive, floral, and easy to enjoy.",
    roast: "Light",
    origin: "Ethiopia Hambella Guji Goro · China Yunnan Lan Chang",
    process: "Washed + Anaerobic Natural Blend",
    featured: true,
    badge: "Seasonal",
    bestFor: "Filter",
    wholesaleAvailable: true,
    sortOrder: 1,
    active: true,
    image: "",
  },
  {
    id: "lan-chang",
    slug: "lan-chang",
    name: "Lan Chang",
    category: "Filter",
    collection: "Experimental Fruit",
    price: 59,
    size: "200g",
    notes: ["Red Wine", "Raisin", "Wine Chocolate"],
    description:
      "A bold anaerobic natural from Baoshan, Yunnan. Expect red wine aromatics, raisin sweetness, and a smooth wine-chocolate finish.",
    roast: "Medium Light",
    origin: "China Yunnan",
    process: "Anaerobic Natural",
    featured: true,
    badge: "Limited",
    bestFor: "Filter",
    wholesaleAvailable: true,
    sortOrder: 2,
    active: true,
    image: "",
  },
  {
    id: "south-blend",
    slug: "south-blend",
    name: "South Blend",
    category: "Espresso",
    collection: "Espresso Lovers",
    price: 49,
    size: "200g",
    notes: ["Mix Nut", "Chocolate", "Cherry"],
    description:
      "Comforting espresso blend built for daily milk drinks and approachable black coffee.",
    roast: "Medium",
    origin: "Brazil Fazendal Pinhal · Colombia Supremo",
    process: "Washed + Natural Blend",
    featured: false,
    badge: "Best Seller",
    bestFor: "Espresso / Milk",
    wholesaleAvailable: true,
    sortOrder: 3,
    active: true,
    image: "",
  },
];

const FILTERS = ["All", "Filter", "Espresso"];
const COLLECTION_ORDER = [
  "Seasonal Highlight",
  "Clean Filter",
  "Everyday Filter",
  "Funky Process",
  "Experimental Fruit",
  "Espresso Lovers",
  "Coffee Selection",
];

const WHATSAPP_NUMBER = "601127060012";
const INSTAGRAM_URL = "https://instagram.com/drunkcoffeeroasters";
const XHS_LABEL = "Drunkcoffeeroasters";

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

function safeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function appendImageParams(url, params = {}) {
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

function normalizeContentfulImage(asset) {
  const url = asset?.fields?.file?.url || asset?.url || "";
  if (!url) return "";

  const normalized = url.startsWith("//") ? `https:${url}` : url;

  try {
    const parsed = new URL(normalized);
    parsed.searchParams.set("w", "1000");
    parsed.searchParams.set("h", "1000");
    parsed.searchParams.set("fit", "fill");
    parsed.searchParams.set("fm", "webp");
    parsed.searchParams.set("q", "82");
    return parsed.toString();
  } catch {
    return normalized;
  }
}

function mapContentfulEntries(data) {
  const items = data?.items || [];
  const includes = data?.includes?.Asset || [];

  const assetMap = includes.reduce((acc, asset) => {
    acc[asset.sys.id] = asset;
    return acc;
  }, {});

  return items.map((item) => {
    const fields = item.fields || {};
    const imageId = fields.image?.sys?.id;
    const asset = imageId ? assetMap[imageId] : null;

    return {
      id: item.sys.id,
      slug: fields.slug || item.sys.id,
      name: fields.name || fields.beanName || "Untitled Coffee",
      category: fields.category || "Filter",
      collection: fields.collection || "Coffee Selection",
      price: Number(fields.price || 0),
      size: fields.size || "200g",
      notes: safeArray(fields.tastingNotes || fields.notes),
      description: fields.description || "",
      roast: fields.roast || "",
      origin: fields.origin || "",
      process: fields.process || "",
      featured: Boolean(fields.featured),
      badge: fields.badge || "",
      bestFor: fields.bestFor || "",
      wholesaleAvailable: Boolean(fields.wholesaleAvailable),
      sortOrder: Number(fields.sortOrder || 999),
      active: fields.active !== false,
      image: normalizeContentfulImage(asset),
    };
  });
}

function getContentfulConfig() {
  const env = getEnv();

  return {
    spaceId: env.VITE_CONTENTFUL_SPACE_ID || "",
    environment: env.VITE_CONTENTFUL_ENVIRONMENT || "master",
    accessToken: env.VITE_CONTENTFUL_DELIVERY_TOKEN || "",
    contentType: env.VITE_CONTENTFUL_CONTENT_TYPE || "coffeeBean",
  };
}

async function fetchBeansFromContentful() {
  const { spaceId, environment, accessToken, contentType } =
    getContentfulConfig();

  if (!spaceId || !accessToken) {
    return {
      beans: FALLBACK_BEANS,
      warning:
        "Contentful environment variables are missing. Showing fallback coffee list.",
    };
  }

  const endpoint =
    `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries` +
    `?content_type=${contentType}&include=2`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Contentful request failed with status ${response.status}`);
  }

  const data = await response.json();
  const mapped = mapContentfulEntries(data)
    .filter((bean) => bean.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    beans: mapped.length ? mapped : FALLBACK_BEANS,
    warning: mapped.length
      ? ""
      : "Contentful returned no coffee entries. Showing fallback coffee list.",
  };
}

function buildSingleOrderUrl(bean) {
  const message = `Hi Drunk Coffee Roasters,

I would like to order:

${bean.name} (${bean.size})
Category: ${bean.category}
Price: RM ${bean.price}

Please share availability and roasting lead time.
Thank you.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function collectionAccentClasses(name) {
  const map = {
    "Seasonal Highlight": "from-amber-200/15 to-rose-200/10",
    "Clean Filter": "from-sky-200/12 to-white/5",
    "Everyday Filter": "from-emerald-200/12 to-white/5",
    "Funky Process": "from-fuchsia-200/12 to-violet-200/10",
    "Experimental Fruit": "from-orange-200/12 to-pink-200/10",
    "Espresso Lovers": "from-amber-900/18 to-stone-200/5",
  };
  return map[name] || "from-white/[0.04] to-white/[0.02]";
}

function badgeClasses(badge) {
  const map = {
    New: "bg-emerald-400/15 text-emerald-200 border-emerald-300/20",
    "Best Seller": "bg-amber-400/15 text-amber-100 border-amber-300/20",
    Limited: "bg-rose-400/15 text-rose-100 border-rose-300/20",
    Seasonal: "bg-orange-400/15 text-orange-100 border-orange-300/20",
    Wholesale: "bg-sky-400/15 text-sky-100 border-sky-300/20",
    Recommended: "bg-violet-400/15 text-violet-100 border-violet-300/20",
  };
  return map[badge] || "bg-white/10 text-white/80 border-white/15";
}

function CoffeeCard({ bean, onOpen, onAddToCart }) {
  const notes = safeArray(bean.notes).slice(0, 3);
  const cardImage = bean.image
    ? appendImageParams(bean.image, {
        w: 820,
        h: 620,
        fit: "fill",
        fm: "webp",
        q: 80,
      })
    : "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/6 hover:shadow-[0_40px_90px_rgba(0,0,0,0.6)]">
      <button
        type="button"
        onClick={() => onOpen(bean)}
        className="block w-full text-left"
        aria-label={`Open details for ${bean.name}`}
      >
        <div className="relative aspect-4/3 overflow-hidden bg-white/5">
          {cardImage ? (
            <img
              src={cardImage}
              alt={bean.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.07]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-white/5 to-white/2 text-sm text-white/35">
              No image yet
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {bean.badge ? (
              <span
                className={`font-body rounded-full border px-3 py-1 text-[11px] font-medium ${badgeClasses(
                  bean.badge
                )}`}
              >
                {bean.badge}
              </span>
            ) : null}

            {bean.wholesaleAvailable ? (
              <span className="font-body rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-medium text-white/85">
                Wholesale
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/40 to-transparent" />
        </div>
      </button>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.24em] text-white/45">
              {bean.category}
            </p>
            <h3 className="font-display mt-2 text-2xl leading-tight font-semibold text-white md:text-[30px]">
              {bean.name}
            </h3>
          </div>

          <span className="font-body shrink-0 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-sm text-white/70">
            {bean.size}
          </span>
        </div>

        <p className="font-body mt-4 min-h-14 text-sm leading-7 text-white/72">
          {bean.origin || "Origin TBC"}
        </p>

        <div className="mt-4 flex min-h-[52px] flex-wrap gap-2">
          {notes.map((note) => (
            <span
              key={note}
              className="font-body rounded-xl border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-white/70"
            >
              {note}
            </span>
          ))}
        </div>

        <div className="mt-4 min-h-6">
          {bean.bestFor ? (
            <p className="font-body text-sm text-white/60">
              Best for: <span className="text-white/82">{bean.bestFor}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.18em] text-white/38">
                Price
              </p>
              <p className="font-body mt-2 text-2xl font-semibold text-white">
                RM {bean.price}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpen(bean)}
                className="font-body rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5"
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => onAddToCart(bean)}
                className="font-body rounded-2xl bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035]">
      <div className="aspect-4/3 animate-pulse bg-white/5" />
      <div className="space-y-4 p-6">
        <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-7 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-full animate-pulse rounded bg-white/10" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-white/10" />
        <div className="flex gap-2">
          <div className="h-7 w-20 animate-pulse rounded-xl bg-white/10" />
          <div className="h-7 w-20 animate-pulse rounded-xl bg-white/10" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-24 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}

function EditorialFeature({
  eyebrow,
  title,
  text,
  imageSrc,
  imageAlt,
  reverse = false,
  light = false,
}) {
  return (
    <section
      className={`border-t ${
        light
          ? "border-black/10 bg-[#f5efe4] text-neutral-950"
          : "border-white/10 bg-neutral-950 text-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-20">
        <div
          className={`grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className="overflow-hidden rounded-[32px] border border-black/5 bg-black/5 shadow-2xl shadow-black/10">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="h-[420px] w-full object-cover md:h-[620px]"
            />
          </div>

          <div className="max-w-xl">
            <p
              className={`font-body text-sm uppercase tracking-[0.22em] ${
                light ? "text-neutral-500" : "text-white/42"
              }`}
            >
              {eyebrow}
            </p>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-[1.02] md:text-6xl">
              {title}
            </h2>
            <p
              className={`font-body mt-6 text-base leading-8 ${
                light ? "text-neutral-700" : "text-white/72"
              }`}
            >
              {text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DrunkCoffeeRoastersStorefront() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [beans, setBeans] = useState(FALLBACK_BEANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBean, setSelectedBean] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

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
          setBeans(FALLBACK_BEANS);
          setError(
            "Could not load Contentful content. Showing fallback coffee list."
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

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedBean(null);
        setCartOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const shouldLock = cartOpen || Boolean(selectedBean);
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, selectedBean]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredBeans = useMemo(() => {
    if (activeFilter === "All") return beans;
    return beans.filter((bean) => bean.category === activeFilter);
  }, [activeFilter, beans]);

  const filterCounts = useMemo(() => {
    return {
      All: beans.length,
      Filter: beans.filter((bean) => bean.category === "Filter").length,
      Espresso: beans.filter((bean) => bean.category === "Espresso").length,
    };
  }, [beans]);

  const collectionMeta = {
    "Seasonal Highlight": {
      title: "Seasonal Highlight",
      subtitle: "Limited coffees and seasonal releases worth starting with.",
    },
    "Clean Filter": {
      title: "Clean Filter",
      subtitle: "Elegant, structured cups with classic specialty clarity.",
    },
    "Everyday Filter": {
      title: "Everyday Filter",
      subtitle: "Expressive daily drinkers that stay easy to enjoy.",
    },
    "Funky Process": {
      title: "Funky Process",
      subtitle: "Fermentation-forward coffees with extra character and fruit.",
    },
    "Experimental Fruit": {
      title: "Experimental Fruit",
      subtitle:
        "Fruit-driven coffees with modern processing and louder profiles.",
    },
    "Espresso Lovers": {
      title: "Espresso Lovers",
      subtitle:
        "Comforting coffees for espresso, milk drinks, and daily use.",
    },
  };

  const beansByCollection = useMemo(() => {
    return filteredBeans.reduce((acc, bean) => {
      const key = bean.collection || "Coffee Selection";
      if (!acc[key]) acc[key] = [];
      acc[key].push(bean);
      return acc;
    }, {});
  }, [filteredBeans]);

  const orderedCollections = useMemo(() => {
    return Object.keys(beansByCollection).sort((a, b) => {
      const aIndex = COLLECTION_ORDER.indexOf(a);
      const bIndex = COLLECTION_ORDER.indexOf(b);
      const safeA = aIndex === -1 ? 999 : aIndex;
      const safeB = bIndex === -1 ? 999 : bIndex;
      return safeA - safeB;
    });
  }, [beansByCollection]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  function addToCart(bean) {
    setCart((current) => {
      const existing = current.find((item) => item.id === bean.id);
      if (existing) {
        return current.map((item) =>
          item.id === bean.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: bean.id,
          name: bean.name,
          price: bean.price,
          size: bean.size,
          category: bean.category,
          quantity: 1,
        },
      ];
    });
    setCartOpen(true);
    setToast(`${bean.name} added to cart`);
  }

  function decreaseCartItem(itemId) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseCartItem(itemId) {
    setCart((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function removeCartItem(itemId) {
    setCart((current) => current.filter((item) => item.id !== itemId));
  }

  function clearCart() {
    setCart([]);
  }

  const openGeneralWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I would like to browse your coffee menu."
  )}`;

  const wholesaleWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I would like to enquire about wholesale coffee supply."
  )}`;

  const cartWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    cart.length
      ? `Hi Drunk Coffee Roasters,

I would like to place an order:

${cart
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} (${item.size}) x${item.quantity}
RM ${Number(item.price || 0) * item.quantity}`
  )
  .join("\n\n")}

Total: RM ${cartTotal}

Please confirm availability and roasting lead time.
Thank you.`
      : "Hi Drunk Coffee Roasters, I would like to place an order."
  )}`;

  const detailImage = selectedBean?.image
    ? appendImageParams(selectedBean.image, {
        w: 1200,
        h: 1200,
        fit: "fill",
        fm: "webp",
        q: 84,
      })
    : "";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#top" className="flex items-center">
            <img
              src="/logo.png"
              alt="Drunk Coffee Roasters"
              className="h-[72px] object-contain transition duration-300 hover:scale-105 md:h-[96px]"
            />
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#beans"
              className="font-body text-sm text-white/80 transition hover:text-white"
            >
              Shop
            </a>
            <a
              href="#wholesale"
              className="font-body text-sm text-white/80 transition hover:text-white"
            >
              Wholesale
            </a>
            <a
              href="#story"
              className="font-body text-sm text-white/80 transition hover:text-white"
            >
              Story
            </a>
            <a
              href="#about"
              className="font-body text-sm text-white/80 transition hover:text-white"
            >
              About
            </a>
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative text-white/80 transition hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="font-body absolute -right-2 -top-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-black">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href={openGeneralWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="transition hover:scale-110"
              aria-label="WhatsApp"
            >
              <img
                src="https://cdn.simpleicons.org/whatsapp/ffffff"
                alt="WhatsApp"
                className="h-5 w-5 opacity-80 transition hover:opacity-100"
              />
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="transition hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram
                size={22}
                className="opacity-80 transition hover:opacity-100"
              />
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative mx-auto max-w-7xl px-5 py-14 md:px-6 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="font-body inline-flex rounded-full border border-white/12 bg-white/4 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/75">
                Johor Specialty Coffee Roaster
              </p>

              <h1 className="font-display mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] text-white md:text-6xl">
                Coffee roasted for better daily cups.
              </h1>

              <p className="font-body mt-6 max-w-xl text-base leading-8 text-white/75 md:text-lg">
                Small-batch roasted in Johor for home brewers, cafés, and
                everyday coffee drinkers looking for expressive but approachable
                coffees.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#beans"
                  className="font-body rounded-2xl bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                >
                  Shop Coffee
                </a>

                <a
                  href="#wholesale"
                  className="font-body rounded-2xl border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Wholesale
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
                <span className="font-body rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Filter
                </span>

                <span className="font-body rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Espresso
                </span>

                <span className="font-body rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  Wholesale Supply
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[36px] bg-white/5 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-black/40">
                <img
                  src="/hero-coffee.jpg"
                  alt="Drunk Coffee Roasters roasting coffee"
                  className="h-[420px] w-full object-cover md:h-[620px]"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <p className="font-body text-xs uppercase tracking-[0.22em] text-white/80">
                    Drunk Coffee Roasters
                  </p>
                  <p className="font-display mt-2 max-w-sm text-2xl font-semibold leading-tight text-white md:text-3xl">
                    Roasting coffee for easier choices and better cups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <EditorialFeature
          eyebrow="Brewing Ritual"
          title="Coffee brewed with clarity, warmth, and intention."
          text="From pour-over routines to everyday cups, we roast coffees that feel expressive, approachable, and easy to enjoy."
          imageSrc="/editorial-brewing.jpg"
          imageAlt="Pour over coffee brewing"
          light
        />

        <section
          id="beans"
          className="mx-auto max-w-7xl px-5 py-14 md:px-6 md:py-18"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-body text-[20px] uppercase tracking-[0.18em] text-white/58 md:text-[20px]">
                Coffee menu
              </p>
              <h2 className="font-display mt-3 text-[42px] leading-[0.98] font-semibold md:text-[56px]">
                Shop by brew style
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`font-body rounded-full px-5 py-2 text-sm transition ${
                      isActive
                        ? "bg-white text-neutral-950"
                        : "border border-white/10 text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {filter} ({filterCounts[filter] ?? 0})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 border-b border-white/10 pb-5 text-sm text-white/50">
            <p className="font-body">
              Showing <span className="text-white/80">{filteredBeans.length}</span>{" "}
              coffee{filteredBeans.length > 1 ? "s" : ""}
            </p>
          </div>

          {error ? (
            <div className="font-body mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : filteredBeans.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/4 p-10 text-center">
              <p className="font-display text-lg font-semibold">No beans found</p>
              <p className="font-body mt-3 text-sm leading-7 text-white/60">
                Try another filter, or publish more coffee entries in Contentful.
              </p>
            </div>
          ) : (
            <div className="mt-10 space-y-12">
              {orderedCollections.map((collectionKey) => {
                const collectionBeans = beansByCollection[collectionKey] || [];
                const meta = collectionMeta[collectionKey] || {
                  title: collectionKey,
                  subtitle: "Coffee selection",
                };

                return (
                  <section key={collectionKey} className="space-y-6">
                    <div
                      className={`rounded-[32px] border border-white/10 bg-linear-to-br p-6 md:p-8 ${collectionAccentClasses(
                        collectionKey
                      )}`}
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="font-body text-sm uppercase tracking-[0.22em] text-white/45">
                            Collection
                          </p>
                          <h3 className="font-display mt-2 text-2xl font-semibold md:text-3xl">
                            {meta.title}
                          </h3>
                          <p className="font-body mt-2 max-w-2xl text-sm leading-7 text-white/65">
                            {meta.subtitle}
                          </p>
                        </div>
                        <p className="font-body text-sm text-white/38">
                          {collectionBeans.length} coffee
                          {collectionBeans.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {collectionBeans.map((bean) => (
                        <CoffeeCard
                          key={bean.id}
                          bean={bean}
                          onOpen={setSelectedBean}
                          onAddToCart={addToCart}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>

        <section id="wholesale" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/4 p-7">
                <p className="font-body text-sm uppercase tracking-[0.22em] text-white/42">
                  Wholesale
                </p>
                <h2 className="font-display mt-2 text-3xl font-semibold">
                  Coffee supply for cafés, offices, and retail partners.
                </h2>
                <p className="font-body mt-5 text-sm leading-8 text-white/68">
                  We offer wholesale roasted coffee for partners looking for
                  approachable espresso, expressive filter options, and reliable
                  small-batch supply.
                </p>
                <p className="font-body mt-4 text-sm leading-8 text-white/68">
                  Suitable for café programs, office coffee setups, and retail
                  collaboration.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={wholesaleWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body rounded-2xl bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                  >
                    Enquire on WhatsApp
                  </a>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body rounded-2xl border border-white/15 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                  >
                    View Instagram
                  </a>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-6">
                  <p className="font-display text-lg font-semibold">Suitable for</p>
                  <p className="font-body mt-3 text-sm leading-7 text-white/65">
                    Cafés · Offices · Retail shelves · Event coffee supply
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-6">
                  <p className="font-display text-lg font-semibold">Roast styles</p>
                  <p className="font-body mt-3 text-sm leading-7 text-white/65">
                    Espresso blends, seasonal filters, and flexible coffee
                    selections for different needs.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-6">
                  <p className="font-display text-lg font-semibold">Ordering</p>
                  <p className="font-body mt-3 text-sm leading-7 text-white/65">
                    Start with WhatsApp for faster discussion on availability,
                    profile, and supply needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="story">
          <EditorialFeature
            eyebrow="Our Story"
            title="Drunk Coffee Roasters in real moments, real spaces, and real service."
            text="Built through coffee events, brewing sessions, and everyday interactions, the brand continues to grow through genuine connection and consistent cups."
            imageSrc="/editorial-drunk-coffee-roasters.jpg"
            imageAlt="Drunk Coffee Roasters team at event booth"
            light
          />
        </section>

        <section id="about" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/4 p-7">
                <p className="font-body text-sm uppercase tracking-[0.22em] text-white/42">
                  About
                </p>
                <h2 className="font-display mt-2 text-3xl font-semibold">
                  Roasting coffee that feels easier to choose, brew, and enjoy.
                </h2>
                <p className="font-body mt-5 text-sm leading-8 text-white/68">
                  Drunk Coffee Roasters began with a simple obsession: finding
                  coffee that could make daily routines feel sharper, more
                  enjoyable, and more intentional. What started from early
                  mornings, training days, and a deep personal curiosity
                  gradually grew into a roasting practice built around balance,
                  clarity, and drinkability.
                </p>
                <p className="font-body mt-4 text-sm leading-8 text-white/68">
                  Today, we roast coffees for home brewers, cafés, and everyday
                  drinkers who want cleaner choices and more satisfying cups.
                  The goal is not to make coffee feel complicated, but to roast
                  coffees that are expressive, dependable, and easy to return to
                  every day.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-6">
                  <p className="font-display text-lg font-semibold">
                    Simple ordering
                  </p>
                  <p className="font-body mt-3 text-sm leading-7 text-white/65">
                    Browse the menu, build your cart, and send one clean order
                    request through WhatsApp for faster confirmation.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/4 p-6">
                  <p className="font-display text-lg font-semibold">
                    Small-batch roasting
                  </p>
                  <p className="font-body mt-3 text-sm leading-7 text-white/65">
                    Roasted in small batches to maintain sweetness, clarity, and
                    consistency across espresso, filter, and wholesale supply.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/4 p-6 sm:col-span-2">
                  <p className="font-display text-lg font-semibold">
                    Find the brand
                  </p>
                  <p className="font-body mt-3 text-sm leading-7 text-white/65">
                    Follow Drunk Coffee Roasters on Instagram and 小红书 for new
                    releases, coffee updates, and brand highlights.
                  </p>

                  <div className="mt-4 space-y-3 text-sm text-white/65">
                    <a
                      href="https://instagram.com/drunkcoffeeroasters"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 hover:text-white"
                    >
                      <span className="w-24 text-white/40">Instagram</span>
                      <span>@drunkcoffeeroasters</span>
                    </a>

                    <div className="flex items-center gap-3">
                      <span className="w-24 text-white/40">小红书</span>
                      <span>{XHS_LABEL}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedBean ? (
        <div className="fixed inset-0 z-60 flex items-end justify-center bg-black/70 p-4 md:items-center">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close product details"
            onClick={() => setSelectedBean(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[32px] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50">
            <div className="grid items-start lg:grid-cols-[0.9fr_1.1fr]">
              <div className="bg-white/5 p-4 md:p-5">
                <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white/5">
                  {detailImage ? (
                    <img
                      src={detailImage}
                      alt={selectedBean.name}
                      className="h-auto max-h-[420px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-[320px] items-center justify-center bg-linear-to-br from-white/5 to-white/2 text-sm text-white/35">
                      No image yet
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-body text-xs uppercase tracking-[0.2em] text-white/45">
                      {selectedBean.collection || selectedBean.category}
                    </p>
                    <h3 className="font-display mt-2 text-3xl font-semibold leading-tight md:text-4xl">
                      {selectedBean.name}
                    </h3>
                    <p className="font-body mt-3 text-sm font-medium text-white/70">
                      {selectedBean.origin || "Origin TBC"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBean(null)}
                    className="font-body rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {safeArray(selectedBean.notes).map((note) => (
                    <span
                      key={note}
                      className="font-body rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-white/75"
                    >
                      {note}
                    </span>
                  ))}
                </div>

                <p className="font-body mt-6 text-base leading-8 text-white/68">
                  {selectedBean.description || "Description coming soon."}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="font-body text-sm text-white/40">Origin</p>
                    <p className="font-body mt-2 text-white/85">
                      {selectedBean.origin || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="font-body text-sm text-white/40">Roast</p>
                    <p className="font-body mt-2 text-white/85">
                      {selectedBean.roast || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="font-body text-sm text-white/40">Process</p>
                    <p className="font-body mt-2 text-white/85">
                      {selectedBean.process || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="font-body text-sm text-white/40">Size</p>
                    <p className="font-body mt-2 text-white/85">
                      {selectedBean.size || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="font-body text-sm text-white/40">Best for</p>
                    <p className="font-body mt-2 text-white/85">
                      {selectedBean.bestFor || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="font-body text-sm text-white/40">Wholesale</p>
                    <p className="font-body mt-2 text-white/85">
                      {selectedBean.wholesaleAvailable
                        ? "Available"
                        : "Retail only"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-body text-sm text-white/40">Price</p>
                    <p className="font-body mt-2 text-3xl font-semibold">
                      RM {selectedBean.price}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => addToCart(selectedBean)}
                      className="font-body rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                    >
                      Add to cart
                    </button>
                    <a
                      href={buildSingleOrderUrl(selectedBean)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-body rounded-2xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                    >
                      Order on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cartOpen ? (
        <div className="fixed inset-0 z-70 flex justify-end bg-black/60">
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="flex-1"
            aria-label="Close cart overlay"
          />
          <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-neutral-950 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="font-display text-lg font-semibold">Your cart</p>
                <p className="font-body mt-1 text-sm text-white/50">
                  {cartCount} item{cartCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="font-body rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/5"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-5">
              {cart.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-white/4 p-6 text-center">
                  <p className="font-display text-lg font-semibold">Cart is empty</p>
                  <p className="font-body mt-3 text-sm leading-7 text-white/60">
                    Add a few coffees, then send one combined order through
                    WhatsApp.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="font-body mt-5 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/5"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-white/10 bg-white/4 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-base font-semibold">
                            {item.name}
                          </p>
                          <p className="font-body mt-1 text-sm text-white/55">
                            {item.category} · {item.size}
                          </p>
                          <p className="font-body mt-1 text-xs text-white/40">
                            RM {item.price} each
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="font-body text-sm text-white/45 transition hover:text-white"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decreaseCartItem(item.id)}
                            className="font-body h-9 w-9 rounded-full border border-white/10 text-sm text-white/80 transition hover:bg-white/5"
                          >
                            −
                          </button>
                          <span className="font-body min-w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseCartItem(item.id)}
                            className="font-body h-9 w-9 rounded-full border border-white/10 text-sm text-white/80 transition hover:bg-white/5"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-body text-base font-semibold">
                          RM {Number(item.price || 0) * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-body text-sm text-white/55">Total</p>
                <p className="font-body text-2xl font-semibold">RM {cartTotal}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="font-body rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:bg-white/5"
                >
                  Clear
                </button>
                <a
                  href={cartWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`font-body flex-1 rounded-2xl px-4 py-3 text-center text-sm font-medium transition ${
                    cart.length
                      ? "bg-white text-neutral-950 hover:opacity-90"
                      : "pointer-events-none border border-white/10 text-white/35"
                  }`}
                >
                  Order all on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="font-body fixed bottom-6 left-1/2 z-80 -translate-x-1/2 rounded-2xl border border-white/10 bg-neutral-900 px-5 py-2 text-sm text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          {toast}
        </div>
      ) : null}

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-display text-xl font-semibold text-white">
                Drunk Coffee Roasters
              </p>

              <p className="font-body mt-3 text-sm leading-7 text-white/60">
                Specialty coffee roasted in Johor, Malaysia for espresso,
                filter brewing, and wholesale supply.
              </p>
            </div>

            <div>
              <p className="mb-3 font-display text-lg text-white">Explore</p>

              <div className="flex flex-col gap-2 text-sm text-white/65">
                <a href="#beans" className="font-body hover:text-white">
                  Shop Coffee
                </a>
                <a href="#story" className="font-body hover:text-white">
                  Story
                </a>
                <a href="#wholesale" className="font-body hover:text-white">
                  Wholesale
                </a>
                <a href="#about" className="font-body hover:text-white">
                  About
                </a>
              </div>
            </div>

            <div>
              <p className="mb-3 font-display text-lg text-white">Connect</p>

              <div className="flex flex-col gap-2 text-sm text-white/65">
                <a
                  href="https://instagram.com/drunkcoffeeroasters"
                  target="_blank"
                  rel="noreferrer"
                  className="font-body hover:text-white"
                >
                  Instagram
                </a>

                <a
                  href="https://wa.me/601127060012"
                  target="_blank"
                  rel="noreferrer"
                  className="font-body hover:text-white"
                >
                  WhatsApp
                </a>

                <p className="font-body">小红书: Drunkcoffeeroasters</p>
                <p className="font-body">Johor, Malaysia</p>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/40">
            © {new Date().getFullYear()} Drunk Coffee Roasters. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}