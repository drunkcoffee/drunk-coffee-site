import { ShoppingCart, Instagram, Menu, X, Coffee } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Seo from "../components/Seo";

// ---------------------------------------------------------------------------
// Fallback data
// ---------------------------------------------------------------------------
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
    variety: "",
    brewguide: "",
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
    variety: "",
    brewguide: "",
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
    variety: "",
    brewguide: "",
    featured: false,
    badge: "Best Seller",
    bestFor: "Espresso / Milk",
    wholesaleAvailable: true,
    sortOrder: 3,
    active: true,
    image: "",
  },
];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const FILTERS = ["All", "Filter", "Espresso"];
const WHATSAPP_NUMBER = "601127060012";
const INSTAGRAM_URL = "https://instagram.com/drunkcoffeeroasters";
const XHS_LABEL = "Drunkcoffeeroasters";

const HOW_TO_ORDER_STEPS = [
  {
    step: "01",
    title: "Browse the menu",
    body: "Pick your coffees — filter, espresso, or both. Check tasting notes and roast profiles.",
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

const NAV_LINKS = [
  ["Shop", "#shop"],
  ["Wholesale", "#wholesale"],
  ["Story", "#story"],
  ["About", "#about"],
];

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const LIGHT_BUTTON_STYLE = { color: "#151515" };
const APP_BG = "bg-[#0d0d0b] text-[#f3eee3]";
const PANEL =
  "rounded-[24px] border border-white/10 bg-white/[0.035] backdrop-blur-sm shadow-[0_18px_50px_rgba(0,0,0,0.22)]";
const SOFT_PANEL =
  "rounded-[22px] border border-white/8 bg-white/[0.025] backdrop-blur-sm";
const LIGHT_BUTTON =
  "inline-flex items-center justify-center rounded-full bg-[#efe8db] px-5 py-3 text-sm font-semibold tracking-[0.01em] transition duration-200 hover:bg-[#f6f0e6] active:scale-[0.98]";
const DARK_BUTTON =
  "inline-flex items-center justify-center rounded-full border border-white/12 bg-transparent px-5 py-3 text-sm font-medium text-white/80 transition duration-200 hover:border-white/20 hover:bg-white/[0.05] hover:text-white active:scale-[0.98]";
const EYEBROW =
  "font-body text-[10px] uppercase tracking-[0.28em] text-white/34";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
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

// ---------------------------------------------------------------------------
// Custom hook — scroll-triggered reveal
// ---------------------------------------------------------------------------
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, ...options },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}

// ---------------------------------------------------------------------------
// Contentful helpers
// ---------------------------------------------------------------------------
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
      name: fields.name || "Untitled Coffee",
      category: fields.category || "Filter",
      collection: fields.collection || "",
      price: Number(fields.price || 0),
      size: fields.size || "200g",
      notes: safeArray(fields.notes || fields.tastingNotes),
      description: fields.description || "",
      roast: fields.roast || "",
      origin: fields.origin || "",
      process: fields.process || "",
      variety: fields.variety || "",
      brewguide: fields.brewguide || "",
      featured: Boolean(fields.featured),
      badge: fields.badge || "",
      bestFor: fields.bestfor || fields.bestFor || "",
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
    headers: { Authorization: `Bearer ${accessToken}` },
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

// ---------------------------------------------------------------------------
// WhatsApp builders
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Badge styling
// ---------------------------------------------------------------------------
function badgeClasses(badge) {
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

// ---------------------------------------------------------------------------
// Image placeholder
// ---------------------------------------------------------------------------
function ImagePlaceholder({ className = "" }) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/[0.04] to-transparent",
        className,
      )}
    >
      <Coffee size={28} className="text-white/18" strokeWidth={1.2} />
      <span className="font-body text-[10px] uppercase tracking-[0.16em] text-white/22">
        Photo coming soon
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fade-in section wrapper
// ---------------------------------------------------------------------------
function FadeSection({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={cx(
        "transition-all duration-700",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable components
// ---------------------------------------------------------------------------
function InfoBox({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.035] p-4">
      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
        {label}
      </p>
      <p className="font-body mt-2 text-sm leading-6 text-white/80">{value}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className={EYEBROW}>{eyebrow}</p>
      <h2 className="font-display mt-3 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[44px]">
        {title}
      </h2>
      {description ? (
        <p className="font-body mt-4 max-w-xl text-sm leading-7 text-white/54 md:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Featured bean card (horizontal strip)
// ---------------------------------------------------------------------------
function FeaturedCard({ bean, onOpen, onAddToCart }) {
  const notes = safeArray(bean.notes).slice(0, 3);
  const cardImage = bean.image
    ? appendImageParams(bean.image, {
        w: 900,
        h: 900,
        fit: "pad",
        fm: "webp",
        q: 84,
      })
    : "";

  return (
    <article
      onClick={() => onOpen(bean)}
      className="group relative flex w-[260px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#141412] transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:w-[300px]"
    >
      <div className="relative aspect-square overflow-hidden bg-[#11110f]">
        {cardImage ? (
          <div className="flex h-full w-full items-center justify-center p-5 sm:p-6">
            <img
              src={cardImage}
              alt={bean.name}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
          </div>
        ) : (
          <ImagePlaceholder className="h-full" />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/72 via-black/28 to-transparent" />

        {bean.badge ? (
          <span
            className={cx(
              "font-body absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]",
              badgeClasses(bean.badge),
            )}
          >
            {bean.badge}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/48">
            {bean.category}
          </p>
          <h3 className="font-display mt-1 text-[20px] font-semibold leading-[1.05] tracking-[-0.03em] text-white">
            {bean.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-1.5">
          {notes.map((note) => (
            <span
              key={note}
              className="font-body rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-white/60"
            >
              {note}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
          <p className="font-body text-sm font-semibold text-white">
            RM {bean.price}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(bean);
            }}
            className={cx(LIGHT_BUTTON, "px-3.5 py-2 text-[12px]")}
            style={LIGHT_BUTTON_STYLE}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main coffee card (grid) — with scroll-triggered animation
// ---------------------------------------------------------------------------
function CoffeeCard({ bean, onOpen, onAddToCart, animationDelay = 0 }) {
  const [ref, inView] = useInView();
  const notes = safeArray(bean.notes).slice(0, 3);
  const cardImage = bean.image
    ? appendImageParams(bean.image, {
        w: 1200,
        h: 1200,
        fit: "pad",
        fm: "webp",
        q: 84,
      })
    : "";

  return (
    <article
      ref={ref}
      style={{ transitionDelay: inView ? `${animationDelay}ms` : "0ms" }}
      className={cx(
        "group flex h-full flex-col overflow-hidden",
        "rounded-[24px] border border-white/10 bg-[#141412] shadow-[0_14px_40px_rgba(0,0,0,0.24)]",
        "transition-all duration-500",
        "hover:-translate-y-1 hover:border-white/16 hover:shadow-[0_28px_70px_rgba(0,0,0,0.34)]",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(bean)}
        className="block w-full text-left"
        aria-label={`Open details for ${bean.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#11110f]">
          {cardImage ? (
            <div className="flex h-full w-full items-center justify-center p-5 sm:p-6">
              <img
                src={cardImage}
                alt={bean.name}
                className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          ) : (
            <ImagePlaceholder className="h-full" />
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/78 via-black/30 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {bean.badge ? (
              <span
                className={cx(
                  "font-body rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]",
                  badgeClasses(bean.badge),
                )}
              >
                {bean.badge}
              </span>
            ) : null}
            {bean.wholesaleAvailable ? (
              <span className="font-body rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/76">
                Wholesale
              </span>
            ) : null}
          </div>

          <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
            {bean.collection ? (
              <p className="font-body text-[10px] uppercase tracking-[0.22em] text-white/42">
                {bean.collection}
              </p>
            ) : null}
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/48">
                  {bean.category}
                </p>
                <h3 className="font-display mt-1 text-[24px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
                  {bean.name}
                </h3>
              </div>
              <span className="font-body shrink-0 rounded-full border border-white/12 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-white/70">
                {bean.size}
              </span>
            </div>
          </div>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="font-body line-clamp-1 text-sm leading-6 text-white/54">
          {bean.origin || "Origin TBC"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {notes.map((note) => (
            <span
              key={note}
              className="font-body rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/62"
            >
              {note}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
                Price
              </p>
              <p className="font-body mt-1 text-base font-semibold tracking-[0.01em] text-white">
                RM {bean.price}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpen(bean)}
                className={cx(DARK_BUTTON, "px-4 py-2.5 text-[13px]")}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => onAddToCart(bean)}
                className={cx(LIGHT_BUTTON, "px-4 py-2.5 text-[13px]")}
                style={LIGHT_BUTTON_STYLE}
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

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03]">
      <div className="aspect-[4/3] animate-pulse bg-white/[0.05]" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-7 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        <div className="flex gap-2">
          <div className="h-7 w-16 animate-pulse rounded-full bg-white/10" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="flex items-center justify-between border-t border-white/8 pt-4">
          <div className="h-7 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function DrunkCoffeeRoastersStorefront() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [beans, setBeans] = useState(FALLBACK_BEANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBean, setSelectedBean] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filterKey, setFilterKey] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // ----- Data fetching -----
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

  // ----- Derived state -----
  const featuredBeans = useMemo(
    () => beans.filter((b) => b.featured),
    [beans],
  );

  const filteredBeans = useMemo(() => {
    if (activeFilter === "All") return beans;
    return beans.filter((bean) => bean.category === activeFilter);
  }, [activeFilter, beans]);

  const filterCounts = useMemo(
    () => ({
      All: beans.length,
      Filter: beans.filter((bean) => bean.category === "Filter").length,
      Espresso: beans.filter((bean) => bean.category === "Espresso").length,
    }),
    [beans],
  );

  const selectedBeanIndex = useMemo(() => {
    if (!selectedBean) return -1;
    return filteredBeans.findIndex((bean) => bean.id === selectedBean.id);
  }, [filteredBeans, selectedBean]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0,
  );

  // ----- Navigation (stable callbacks) -----
  const openNextBean = useCallback(() => {
    setSelectedBean((current) => {
      if (!current) return current;
      const idx = filteredBeans.findIndex((b) => b.id === current.id);
      if (idx === -1) return current;
      return filteredBeans[(idx + 1) % filteredBeans.length];
    });
  }, [filteredBeans]);

  const openPrevBean = useCallback(() => {
    setSelectedBean((current) => {
      if (!current) return current;
      const idx = filteredBeans.findIndex((b) => b.id === current.id);
      if (idx === -1) return current;
      return filteredBeans[
        (idx - 1 + filteredBeans.length) % filteredBeans.length
      ];
    });
  }, [filteredBeans]);

  // ----- Filter change -----
  function handleFilterChange(filter) {
    setActiveFilter(filter);
    setFilterKey((k) => k + 1);
  }

  // ----- Touch handlers -----
  function handleTouchStart(event) {
    touchStartX.current = event.changedTouches[0].clientX;
  }

  function handleTouchEnd(event) {
    touchEndX.current = event.changedTouches[0].clientX;
    const diffX = touchEndX.current - touchStartX.current;
    if (Math.abs(diffX) < 50) return;
    if (diffX < 0) openNextBean();
    else openPrevBean();
  }

  // ----- Keyboard navigation -----
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedBean(null);
        setCartOpen(false);
        setMobileNavOpen(false);
      }
      if (selectedBean) {
        if (event.key === "ArrowRight") openNextBean();
        if (event.key === "ArrowLeft") openPrevBean();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedBean, openNextBean, openPrevBean]);

  // ----- Body scroll lock -----
  useEffect(() => {
    const locked = cartOpen || Boolean(selectedBean) || mobileNavOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, selectedBean, mobileNavOpen]);

  // ----- Toast auto-clear -----
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timeout);
  }, [toast]);

  // ----- Cart actions -----
  function addToCart(bean) {
    setCart((current) => {
      const existing = current.find((item) => item.id === bean.id);
      if (existing) {
        return current.map((item) =>
          item.id === bean.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
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

  // ----- WhatsApp URLs -----
  const openGeneralWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I would like to browse your coffee menu.",
  )}`;

  const wholesaleWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I would like to enquire about wholesale coffee supply.",
  )}`;

  const cartWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    cart.length
      ? `Hi Drunk Coffee Roasters,\n\nI would like to place an order:\n\n${cart
          .map(
            (item, index) =>
              `${index + 1}. ${item.name} (${item.size}) x${item.quantity}\nRM ${
                Number(item.price || 0) * item.quantity
              }`,
          )
          .join("\n\n")}\n\nTotal: RM ${cartTotal}\n\nPlease confirm availability and roasting lead time.\nThank you.`
      : "Hi Drunk Coffee Roasters, I would like to place an order.",
  )}`;

  const detailImage = selectedBean?.image
    ? appendImageParams(selectedBean.image, {
        w: 1800,
        h: 1800,
        fit: "pad",
        fm: "webp",
        q: 86,
      })
    : "";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <Seo
        title="Specialty Coffee Roaster in Malaysia"
        description="Small-batch specialty coffee roasted in Johor, Malaysia for filter, espresso, and wholesale supply."
        url="/"
      />

      <div className={cx("min-h-screen", APP_BG)}>
        {/* Background gradient */}
        <div className="pointer-events-none fixed inset-0 opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0d0b]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <a href="#top" className="flex items-center">
              <img
                src="/logo.png"
                alt="Drunk Coffee Roasters"
                className="h-14 object-contain transition duration-300 hover:scale-[1.01] md:h-[70px]"
              />
            </a>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="font-body text-[13px] tracking-[0.08em] text-white/62 transition hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              {/* Cart */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white"
                aria-label="Open cart"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 ? (
                  <span
                    className="font-body absolute right-0.5 top-0.5 min-w-[17px] rounded-full bg-[#efe8db] px-1 text-center text-[9px] font-bold leading-4"
                    style={LIGHT_BUTTON_STYLE}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </button>

              {/* WhatsApp — desktop only */}
              <a
                href={openGeneralWhatsApp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] transition hover:border-white/18 hover:bg-white/[0.05] md:flex"
              >
                <img
                  src="https://cdn.simpleicons.org/whatsapp/ffffff"
                  alt="WhatsApp"
                  className="h-[18px] w-[18px] opacity-75 transition hover:opacity-100"
                />
              </a>

              {/* Instagram — desktop only */}
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white md:flex"
              >
                <Instagram size={18} />
              </a>

              {/* Hamburger — mobile only */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:bg-white/[0.05] hover:text-white md:hidden"
                aria-label="Open menu"
              >
                <Menu size={19} />
              </button>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Mobile nav drawer                                                */}
        {/* ---------------------------------------------------------------- */}
        {mobileNavOpen ? (
          <div className="fixed inset-0 z-[90] flex">
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
            />

            <div className="relative ml-auto flex h-full w-[80vw] max-w-xs flex-col border-l border-white/10 bg-[#0f0f0d] px-6 py-8 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between">
                <img
                  src="/logo.png"
                  alt="Drunk Coffee Roasters"
                  className="h-12 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/58 transition hover:bg-white/[0.05] hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="mt-10 flex flex-col gap-1">
                {NAV_LINKS.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    className="font-body rounded-[14px] px-4 py-3.5 text-[15px] tracking-[0.04em] text-white/70 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t border-white/8 pt-6">
                <a
                  href={openGeneralWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(LIGHT_BUTTON, "w-full justify-center")}
                  style={LIGHT_BUTTON_STYLE}
                >
                  Order on WhatsApp
                </a>
                <div className="flex justify-center gap-4">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white"
                    aria-label="Instagram"
                  >
                    <Instagram size={17} />
                  </a>
                  <a
                    href={openGeneralWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition hover:bg-white/[0.05]"
                    aria-label="WhatsApp"
                  >
                    <img
                      src="https://cdn.simpleicons.org/whatsapp/ffffff"
                      alt="WhatsApp"
                      className="h-4 w-4 opacity-60"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Main                                                             */}
        {/* ---------------------------------------------------------------- */}
        <main id="top" className="relative z-[1]">

          {/* Hero */}
          <section className="relative overflow-hidden border-b border-white/8">
            <div className="absolute inset-0">
              <img
                src="/hero-coffee.jpg"
                alt="Drunk Coffee Roasters roasting coffee"
                className="h-full w-full object-cover opacity-48"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.82)_0%,rgba(10,10,10,0.54)_48%,rgba(10,10,10,0.62)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.76),transparent_38%,rgba(0,0,0,0.2))]" />
            </div>

            <div className="relative mx-auto flex min-h-[80vh] max-w-7xl items-end px-4 pb-14 pt-24 md:px-6 md:pb-20 md:pt-28 lg:min-h-[86vh]">
              <div className="max-w-3xl">
                <p className="font-body text-[10px] uppercase tracking-[0.34em] text-white/42">
                  Johor · Specialty Coffee Roaster
                </p>

                <h1 className="font-display mt-5 max-w-[10ch] text-[50px] font-semibold leading-[0.88] tracking-[-0.05em] text-white sm:text-[64px] md:text-[84px] xl:text-[96px]">
                  Quiet luxury,
                  <br />
                  roasted daily.
                </h1>

                <p className="font-body mt-6 max-w-md text-sm leading-7 text-white/56 md:text-[15px] md:leading-8">
                  Small-batch coffee from Johor for espresso, filter, and everyday
                  cups with more clarity, balance, and identity.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <a href="#shop" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                    Shop Coffee
                  </a>
                  <a href="#wholesale" className={DARK_BUTTON}>
                    Wholesale
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/30">
                      Roast style
                    </p>
                    <p className="font-body mt-1 text-sm text-white/72">
                      Clean · balanced · expressive
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/30">
                      Best for
                    </p>
                    <p className="font-body mt-1 text-sm text-white/72">
                      Home brewers · cafés · gifts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured strip */}
          {!loading && featuredBeans.length > 0 ? (
            <section className="border-b border-white/8 py-10 md:py-12">
              <FadeSection>
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className={EYEBROW}>Staff Picks</p>
                      <h2 className="font-display mt-2 text-[22px] font-semibold leading-[0.96] tracking-[-0.03em] text-white md:text-[28px]">
                        Currently on rotation
                      </h2>
                    </div>
                    <a
                      href="#shop"
                      className="font-body hidden text-[13px] tracking-[0.04em] text-white/42 transition hover:text-white md:block"
                    >
                      View all →
                    </a>
                  </div>
                </div>

                <div className="-mb-3 flex gap-4 overflow-x-auto pb-3 pl-4 pr-4 md:pl-6 md:pr-6 [&::-webkit-scrollbar]:hidden">
                  {featuredBeans.map((bean) => (
                    <FeaturedCard
                      key={bean.id}
                      bean={bean}
                      onOpen={setSelectedBean}
                      onAddToCart={addToCart}
                    />
                  ))}
                  <div className="w-1 shrink-0" />
                </div>
              </FadeSection>
            </section>
          ) : null}

          {/* Shop */}
          <section id="shop" className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
            <FadeSection>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeading
                  eyebrow="Coffee Menu"
                  title="Shop by brew style"
                  description="Every coffee we roast is available to order directly. Pick your style, check the notes, and send through WhatsApp."
                />
                <div className="font-body text-sm text-white/40 md:text-right">
                  Showing{" "}
                  <span className="text-white/72">{filteredBeans.length}</span>{" "}
                  coffee{filteredBeans.length !== 1 ? "s" : ""}
                </div>
              </div>
            </FadeSection>

            {/* Sticky filter bar */}
            <div className="sticky top-[72px] z-20 -mx-4 mt-7 border-b border-white/5 bg-[#0d0d0b]/90 px-4 pb-3 pt-2 backdrop-blur-md md:mx-0 md:px-0">
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => handleFilterChange(filter)}
                      className={cx(
                        "font-body shrink-0 rounded-full border px-4 py-2.5 text-[13px] tracking-[0.04em] transition duration-200 active:scale-[0.98]",
                        isActive
                          ? "border-[#efe8db] bg-[#efe8db] font-semibold"
                          : "border-white/12 bg-white/[0.02] text-white/52 hover:border-white/22 hover:bg-white/[0.04] hover:text-white",
                      )}
                      style={isActive ? LIGHT_BUTTON_STYLE : undefined}
                    >
                      {filter} ({filterCounts[filter] ?? 0})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Warning banner */}
            {error ? (
              <div className="font-body mt-5 rounded-[22px] border border-amber-200/15 bg-amber-200/8 p-4 text-sm text-amber-100">
                {error}
              </div>
            ) : null}

            {/* Grid */}
            {loading ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
                  <SkeletonCard key={id} />
                ))}
              </div>
            ) : filteredBeans.length === 0 ? (
              <div className={cx("mt-8 p-10 text-center", PANEL)}>
                <p className="font-display text-lg font-semibold text-white">
                  No beans found
                </p>
                <p className="font-body mt-2.5 text-sm leading-7 text-white/52">
                  Try another filter, or publish more coffee entries in Contentful.
                </p>
              </div>
            ) : (
              <div
                key={filterKey}
                className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {filteredBeans.map((bean, index) => (
                  <CoffeeCard
                    key={bean.id}
                    bean={bean}
                    onOpen={setSelectedBean}
                    onAddToCart={addToCart}
                    animationDelay={index * 80}
                  />
                ))}
              </div>
            )}
          </section>

          {/* How to Order */}
          <section className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <FadeSection>
                <SectionHeading
                  eyebrow="Simple process"
                  title="How to order"
                  description="No accounts, no checkout forms. Browse, pick, and send one message."
                />
              </FadeSection>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {HOW_TO_ORDER_STEPS.map(({ step, title, body }, index) => (
                  <FadeSection key={step} delay={index * 100}>
                    <div className={cx("flex h-full flex-col p-6", SOFT_PANEL)}>
                      <span className="font-display text-[38px] font-semibold leading-none tracking-[-0.04em] text-white/10">
                        {step}
                      </span>
                      <p className="font-display mt-4 text-[18px] font-semibold tracking-[-0.02em] text-white">
                        {title}
                      </p>
                      <p className="font-body mt-2 text-sm leading-7 text-white/50">
                        {body}
                      </p>
                    </div>
                  </FadeSection>
                ))}
              </div>

              <FadeSection delay={300} className="mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={openGeneralWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className={LIGHT_BUTTON}
                    style={LIGHT_BUTTON_STYLE}
                  >
                    Start your order
                  </a>
                  <a href="#shop" className={DARK_BUTTON}>
                    Browse coffees
                  </a>
                </div>
              </FadeSection>
            </div>
          </section>

          {/* Wholesale */}
          <section id="wholesale" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <FadeSection className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Wholesale</p>
                  <h2 className="font-display mt-4 text-[28px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[42px]">
                    Supply for cafés,
                    <br />
                    offices, and partners.
                  </h2>
                  <p className="font-body mt-5 max-w-xl text-sm leading-8 text-white/54 md:text-[15px]">
                    Approachable espresso blends, seasonal filter options, and a more
                    dependable small-batch supply model for businesses that want a
                    cleaner house coffee offer.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3.5">
                    <a
                      href={wholesaleWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={LIGHT_BUTTON}
                      style={LIGHT_BUTTON_STYLE}
                    >
                      Enquire on WhatsApp
                    </a>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={DARK_BUTTON}
                    >
                      Instagram ↗
                    </a>
                  </div>
                </FadeSection>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <FadeSection delay={100} className={cx("p-5 md:p-6", SOFT_PANEL)}>
                    <p className="font-display text-[19px] font-semibold text-white">
                      Suitable for
                    </p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/54">
                      Cafés · Offices · Retail shelves · Events
                    </p>
                  </FadeSection>
                  <FadeSection delay={180} className={cx("p-5 md:p-6", SOFT_PANEL)}>
                    <p className="font-display text-[19px] font-semibold text-white">
                      Roast direction
                    </p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/54">
                      Espresso blends and seasonal filters with flexible supply.
                    </p>
                  </FadeSection>
                </div>
              </div>
            </div>
          </section>

          {/* Story */}
          <section id="story" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">

                <FadeSection className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
                    <img
                      src="/editorial-drunk-coffee-roasters.jpg"
                      alt="Drunk Coffee Roasters team"
                      className="h-[240px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[320px]"
                      loading="lazy"
                    />
                  </div>
                  <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
                    <img
                      src="/editorial-brewing.jpg"
                      alt="Coffee being brewed"
                      className="h-[160px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[200px]"
                      loading="lazy"
                    />
                  </div>
                  <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
                    <img
                      src="/editorial-roasted-beans.jpg"
                      alt="Freshly roasted coffee beans"
                      className="h-[160px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[200px]"
                      loading="lazy"
                    />
                  </div>
                </FadeSection>

                <FadeSection delay={120} className="lg:pt-2">
                  <p className={EYEBROW}>Our Story</p>
                  <h2 className="font-display mt-4 text-[32px] font-semibold leading-[0.94] tracking-[-0.035em] text-white md:text-[50px]">
                    Built from obsession,
                    <br />
                    repetition, and taste.
                  </h2>
                  <p className="font-body mt-5 max-w-xl text-sm leading-8 text-white/54 md:text-[15px]">
                    Drunk Coffee Roasters grew through real brewing routines, coffee
                    events, and a constant pursuit of better cups. Based in Johor, we
                    roast in small batches with a stronger focus on clarity, balance,
                    and a cup that feels considered.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className={cx("p-5", SOFT_PANEL)}>
                      <p className="font-display text-xl font-semibold text-white">
                        Johor
                      </p>
                      <p className="font-body mt-1 text-xs uppercase tracking-[0.08em] text-white/42">
                        Based in Malaysia
                      </p>
                    </div>
                    <div className={cx("p-5", SOFT_PANEL)}>
                      <p className="font-display text-xl font-semibold text-white">
                        Small-batch
                      </p>
                      <p className="font-body mt-1 text-xs uppercase tracking-[0.08em] text-white/42">
                        Roasted with care
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href={openGeneralWhatsApp}
                      target="_blank"
                      rel="noreferrer"
                      className={LIGHT_BUTTON}
                      style={LIGHT_BUTTON_STYLE}
                    >
                      Order on WhatsApp
                    </a>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={DARK_BUTTON}
                    >
                      Instagram ↗
                    </a>
                  </div>
                </FadeSection>
              </div>
            </div>
          </section>

          {/* About */}
          <section id="about" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
                <FadeSection className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>About</p>
                  <h2 className="font-display mt-4 text-[28px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[42px]">
                    Easier to choose.
                    <br />
                    Harder to forget.
                  </h2>
                  <p className="font-body mt-5 max-w-xl text-sm leading-8 text-white/54 md:text-[15px]">
                    Coffee roasted with balance, clarity, and a stronger sense of
                    identity — for home brewers, cafés, and everyday drinkers who want
                    something better.
                  </p>
                </FadeSection>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FadeSection delay={80} className={cx("p-5", SOFT_PANEL)}>
                    <p className="font-display text-[18px] font-semibold text-white">
                      Simple ordering
                    </p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/54">
                      Build your cart and send one clean order through WhatsApp.
                    </p>
                  </FadeSection>

                  <FadeSection delay={140} className={cx("p-5", SOFT_PANEL)}>
                    <p className="font-display text-[18px] font-semibold text-white">
                      Small-batch roasting
                    </p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/54">
                      Roasted in smaller batches to maintain clarity and consistency.
                    </p>
                  </FadeSection>

                  <FadeSection delay={200} className={cx("p-5 sm:col-span-2", SOFT_PANEL)}>
                    <p className="font-display text-[18px] font-semibold text-white">
                      Find us
                    </p>
                    <div className="mt-4 space-y-3 text-sm">
                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-white/56 transition hover:text-white"
                      >
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">
                          Instagram
                        </span>
                        <span>@drunkcoffeeroasters ↗</span>
                      </a>
                      <div className="flex items-center gap-3 text-white/56">
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">
                          小红书
                        </span>
                        <span>{XHS_LABEL}</span>
                      </div>
                      <a
                        href={openGeneralWhatsApp}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 text-white/56 transition hover:text-white"
                      >
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">
                          WhatsApp
                        </span>
                        <span>+601127060012 ↗</span>
                      </a>
                      <div className="flex items-center gap-3 text-white/56">
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">
                          Location
                        </span>
                        <span>Johor, Malaysia</span>
                      </div>
                    </div>
                  </FadeSection>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* ---------------------------------------------------------------- */}
        {/* Bean detail modal                                                */}
        {/* ---------------------------------------------------------------- */}
        {selectedBean ? (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/78 md:items-center md:p-4">
            <button
              type="button"
              className="absolute inset-0"
              aria-label="Close"
              onClick={() => setSelectedBean(null)}
            />

            <div
              className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#121210] shadow-[0_35px_120px_rgba(0,0,0,0.62)] md:max-h-[88vh] md:max-w-5xl md:flex-row md:rounded-[28px]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex shrink-0 justify-center py-2.5 md:hidden">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>

              <div className="relative shrink-0 overflow-hidden bg-[#11110f] md:w-[42%]">
                {detailImage ? (
                  <div className="flex h-[220px] w-full items-center justify-center p-5 sm:h-[260px] sm:p-6 md:h-full md:p-8">
                    <img
                      src={detailImage}
                      alt={selectedBean.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder className="h-[220px] sm:h-[260px] md:h-full" />
                )}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent md:hidden" />

                <button
                  type="button"
                  onClick={openPrevBean}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/12 bg-black/50 px-3 py-2 text-sm text-white/88 backdrop-blur-sm transition hover:bg-black/75"
                  aria-label="Previous"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={openNextBean}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/12 bg-black/50 px-3 py-2 text-sm text-white/88 backdrop-blur-sm transition hover:bg-black/75"
                  aria-label="Next"
                >
                  →
                </button>

                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {filteredBeans.map((bean, index) => (
                    <span
                      key={bean.id}
                      className={cx(
                        "block h-1 rounded-full transition-all duration-200",
                        index === selectedBeanIndex
                          ? "w-5 bg-[#efe8db]"
                          : "w-1.5 bg-white/28",
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-7 lg:p-8">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {selectedBean.collection ? (
                      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/30">
                        {selectedBean.collection}
                      </p>
                    ) : null}
                    <p className="font-body mt-0.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
                      {selectedBean.category}
                    </p>
                    <h3 className="font-display mt-1.5 text-[24px] font-semibold leading-[1.02] tracking-[-0.03em] text-white md:text-[34px]">
                      {selectedBean.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBean(null)}
                    className="font-body shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm text-white/58 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {safeArray(selectedBean.notes).map((note) => (
                    <span
                      key={note}
                      className="font-body rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/68"
                    >
                      {note}
                    </span>
                  ))}
                </div>

                <p className="font-body mt-5 max-w-2xl text-sm leading-8 text-white/58 md:text-[15px]">
                  {selectedBean.description || "Description coming soon."}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2.5 md:gap-3">
                  <InfoBox label="Origin" value={selectedBean.origin} />
                  <InfoBox label="Roast" value={selectedBean.roast} />
                  <InfoBox label="Process" value={selectedBean.process} />
                  <InfoBox label="Variety" value={selectedBean.variety} />
                  <InfoBox label="Best For" value={selectedBean.bestFor} />
                  <InfoBox label="Size" value={selectedBean.size} />
                </div>

                {selectedBean.brewguide ? (
                  <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[0.035] p-4 md:p-5">
                    <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
                      Brew Guide
                    </p>
                    <p className="font-body mt-2 whitespace-pre-line text-sm leading-7 text-white/74">
                      {selectedBean.brewguide}
                    </p>
                  </div>
                ) : null}

                <div className="mt-7 flex flex-col gap-4 border-t border-white/8 pt-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/34">
                      Price
                    </p>
                    <p className="font-body mt-1 text-[28px] font-semibold tracking-[-0.02em] text-white">
                      RM {selectedBean.price}
                    </p>
                  </div>

                  <div className="flex gap-2.5 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => addToCart(selectedBean)}
                      className={DARK_BUTTON}
                    >
                      Add to cart
                    </button>
                    <a
                      href={buildSingleOrderUrl(selectedBean)}
                      target="_blank"
                      rel="noreferrer"
                      className={LIGHT_BUTTON}
                      style={LIGHT_BUTTON_STYLE}
                    >
                      Order on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Cart drawer                                                      */}
        {/* ---------------------------------------------------------------- */}
        {cartOpen ? (
          <div className="fixed inset-0 z-[70] flex justify-end bg-black/70">
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="flex-1"
              aria-label="Close cart"
            />

            <div className="flex h-full w-full max-w-xs flex-col border-l border-white/10 bg-[#121210] shadow-[0_35px_120px_rgba(0,0,0,0.56)] sm:max-w-sm md:max-w-md">
              <div className="border-b border-white/8 px-4 py-4 md:px-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-[20px] font-semibold tracking-[-0.02em] text-white">
                      Your cart
                    </p>
                    <p className="font-body mt-1 text-xs uppercase tracking-[0.14em] text-white/34">
                      {cartCount} item{cartCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="font-body rounded-full border border-white/10 px-4 py-2 text-xs text-white/58 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-4 py-4 md:px-5">
                {cart.length === 0 ? (
                  <div className={cx("p-5 text-center", SOFT_PANEL)}>
                    <p className="font-display text-base font-semibold text-white">
                      Cart is empty
                    </p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/50">
                      Add a few coffees, then send one combined order through WhatsApp.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCartOpen(false)}
                      className={cx(DARK_BUTTON, "mt-4")}
                    >
                      Continue shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className={cx("p-4", SOFT_PANEL)}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-[17px] font-semibold tracking-[-0.02em] text-white">
                              {item.name}
                            </p>
                            <p className="font-body mt-1 text-xs uppercase tracking-[0.12em] text-white/36">
                              {item.category} · {item.size}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.id)}
                            className="font-body text-xs text-white/36 transition hover:text-white/78"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => decreaseCartItem(item.id)}
                              className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05] active:scale-[0.98]"
                            >
                              −
                            </button>
                            <span className="font-body min-w-6 text-center text-sm font-medium text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increaseCartItem(item.id)}
                              className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05] active:scale-[0.98]"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-body text-sm font-semibold text-white">
                            RM {Number(item.price || 0) * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/8 px-4 py-4 md:px-5">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/34">
                      Total
                    </p>
                    <p className="font-body mt-1 text-[28px] font-semibold tracking-[-0.02em] text-white">
                      RM {cartTotal}
                    </p>
                  </div>
                  {cart.length ? (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="font-body text-sm text-white/42 transition hover:text-white/78"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <a
                  href={cartWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(
                    "flex w-full items-center justify-center rounded-full px-4 py-3 text-center text-sm font-semibold transition active:scale-[0.98]",
                    cart.length
                      ? "bg-[#efe8db] hover:bg-[#f6f0e6]"
                      : "pointer-events-none border border-white/10 bg-transparent text-white/28",
                  )}
                  style={cart.length ? LIGHT_BUTTON_STYLE : undefined}
                >
                  Order all on WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Toast                                                            */}
        {/* ---------------------------------------------------------------- */}
        {toast ? (
          <div className="font-body fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#161613] px-5 py-2.5 text-sm text-white shadow-[0_8px_40px_rgba(0,0,0,0.52)]">
            {toast}
          </div>
        ) : null}

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                           */}
        {/* ---------------------------------------------------------------- */}
        <footer className="border-t border-white/8 bg-black/18">
          <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-14">
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="font-display text-[18px] font-semibold tracking-[-0.02em] text-white">
                  Drunk Coffee Roasters
                </p>
                <p className="font-body mt-2.5 text-sm leading-7 text-white/45">
                  Specialty coffee roasted in Johor, Malaysia.
                </p>
              </div>

              <div>
                <p className="mb-3 font-body text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Explore
                </p>
                <div className="flex flex-col gap-2 text-sm text-white/52">
                  {[
                    ["Shop", "#shop"],
                    ["Story", "#story"],
                    ["Wholesale", "#wholesale"],
                    ["About", "#about"],
                  ].map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      className="font-body transition hover:text-white"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-body text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Connect
                </p>
                <div className="flex flex-col gap-2 text-sm text-white/52">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body transition hover:text-white"
                  >
                    Instagram
                  </a>
                  <a
                    href={openGeneralWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className="font-body transition hover:text-white"
                  >
                    WhatsApp
                  </a>
                  <p className="font-body">小红书: {XHS_LABEL}</p>
                  <p className="font-body">Johor, Malaysia</p>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/8 pt-5 text-xs text-white/24">
              © {new Date().getFullYear()} Drunk Coffee Roasters. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
