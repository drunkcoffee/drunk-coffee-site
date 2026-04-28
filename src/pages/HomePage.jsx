import {
  ArrowRight,
  Coffee,
  Instagram,
  Menu,
  Package,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { trackAddToCart, trackWhatsappClick } from "../lib/analytics";
import {
  APP_BG,
  DARK_BUTTON,
  EYEBROW,
  FILTERS,
  INSTAGRAM_URL,
  LIGHT_BUTTON,
  LIGHT_BUTTON_STYLE,
  NAV_LINKS,
  PANEL,
  SOFT_PANEL,
  XHS_LABEL,
  appendImageParams,
  badgeClasses,
  buildBundleOrderUrl,
  buildCartWhatsAppUrl,
  buildGeneralWhatsAppUrl,
  buildWholesaleWhatsAppUrl,
  cx,
  safeArray,
  useBeans,
  usePersistentCart,
} from "../lib/coffeeStore";

// ─── Intersection-based fade ─────────────────────────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.12, ...options },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, inView];
}

function FadeSection({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={cx(
        "transition-all duration-700",
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Mobile horizontal swipe row + desktop grid ───────────────────────────────
// Usage: wrap card lists with this. On mobile → snap scroll. On md+ → grid.
function SwipeRow({ items, renderItem, mobileItemWidth = "w-[82vw]", desktopCols = "md:grid-cols-3", className = "" }) {
  return (
    <>
      {/* ── Mobile: horizontal snap scroll ── */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden md:hidden">
        {items.map((item, i) => (
          <div key={item.id ?? i} className={cx("snap-start shrink-0", mobileItemWidth)}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {/* ── Desktop: regular grid ── */}
      <div className={cx("hidden gap-4 md:grid", desktopCols, className)}>
        {items.map((item, i) => (
          <FadeSection key={item.id ?? i} delay={i * 70}>
            {renderItem(item, i)}
          </FadeSection>
        ))}
      </div>
    </>
  );
}

// ─── Dot indicator for swipe rows ────────────────────────────────────────────
function SwipeDots({ count, current }) {
  return (
    <div className="mt-2 flex justify-center gap-1.5 md:hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={cx(
            "block h-1 rounded-full transition-all duration-300",
            i === current ? "w-5 bg-white/60" : "w-1.5 bg-white/20",
          )}
        />
      ))}
    </div>
  );
}

// ─── Swipe row with dot tracking ─────────────────────────────────────────────
function SwipeRowTracked({ items, renderItem, mobileItemWidth = "w-[82vw]", desktopCols = "md:grid-cols-3" }) {
  const scrollRef = useRef(null);
  const [current, setCurrent] = useState(0);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const itemW = el.firstElementChild?.offsetWidth ?? 1;
    setCurrent(Math.round(el.scrollLeft / (itemW + 12))); // 12 = gap-3
  }

  return (
    <>
      {/* Mobile scroll */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [&::-webkit-scrollbar]:hidden md:hidden"
      >
        {items.map((item, i) => (
          <div key={item.id ?? i} className={cx("snap-start shrink-0", mobileItemWidth)}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      <SwipeDots count={items.length} current={current} />

      {/* Desktop grid */}
      <div className={cx("hidden gap-4 md:grid", desktopCols)}>
        {items.map((item, i) => (
          <FadeSection key={item.id ?? i} delay={i * 70}>
            {renderItem(item, i)}
          </FadeSection>
        ))}
      </div>
    </>
  );
}

function ImagePlaceholder({ className = "" }) {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/[0.05] to-transparent", className)}>
      <Coffee size={30} className="text-white/18" strokeWidth={1.2} />
      <span className="font-body text-[10px] uppercase tracking-[0.18em] text-white/22">Photo coming soon</span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2 className="font-display mt-3 text-[28px] font-semibold leading-[0.94] tracking-[-0.03em] text-white sm:text-[30px] md:text-[46px]">
          {title}
        </h2>
        {description ? (
          <p className="font-body mt-4 max-w-xl text-sm leading-7 text-white/54 md:text-[15px]">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// ─── Cart drawer ─────────────────────────────────────────────────────────────
function CartDrawer({ cartOpen, setCartOpen, cart, cartCount, cartTotal, decreaseCartItem, increaseCartItem, removeCartItem, clearCart }) {
  if (!cartOpen) return null;
  const cartWhatsAppUrl = buildCartWhatsAppUrl(cart);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/70">
      <button type="button" onClick={() => setCartOpen(false)} className="flex-1" aria-label="Close cart" />
      <div className="flex h-full w-full max-w-xs flex-col border-l border-white/10 bg-[#121210] shadow-[0_35px_120px_rgba(0,0,0,0.56)] sm:max-w-sm md:max-w-md">
        <div className="border-b border-white/8 px-4 py-4 md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-[20px] font-semibold tracking-[-0.02em] text-white">Your cart</p>
              <p className="font-body mt-1 text-xs uppercase tracking-[0.14em] text-white/34">
                {cartCount} item{cartCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/58 transition hover:bg-white/[0.05] hover:text-white"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4 md:px-5">
          {cart.length === 0 ? (
            <div className={cx("p-5 text-center", SOFT_PANEL)}>
              <p className="font-display text-base font-semibold text-white">Cart is empty</p>
              <p className="font-body mt-2 text-sm leading-7 text-white/50">
                Add a few coffees, then send one combined order through WhatsApp.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className={cx("p-4", SOFT_PANEL)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[17px] font-semibold tracking-[-0.02em] text-white">{item.name}</p>
                      <p className="font-body mt-1 text-xs uppercase tracking-[0.12em] text-white/36">{item.category} · {item.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/36 transition hover:bg-white/[0.06] hover:text-white/78"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => decreaseCartItem(item.id)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05] active:scale-[0.96]" aria-label="Decrease quantity">−</button>
                      <span className="font-body min-w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button type="button" onClick={() => increaseCartItem(item.id)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05] active:scale-[0.96]" aria-label="Increase quantity">+</button>
                    </div>
                    <p className="font-body text-sm font-semibold text-white">RM {Number(item.price || 0) * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/8 px-4 pt-4 md:px-5" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/34">Total</p>
              <p className="font-display mt-1 text-[28px] font-semibold tracking-[-0.03em] text-white">RM {cartTotal}</p>
            </div>
            {cart.length > 0 ? (
              <button type="button" onClick={clearCart} className="-mb-1 -mr-2 px-3 py-3 text-xs uppercase tracking-[0.12em] text-white/36 transition hover:text-white/74">
                Clear cart
              </button>
            ) : null}
          </div>
          <div className="flex flex-col gap-2.5">
            <a href={cartWhatsAppUrl} target="_blank" rel="noreferrer" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
              Send order on WhatsApp
            </a>
            <button type="button" onClick={() => setCartOpen(false)} className={DARK_BUTTON}>Continue browsing</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Series mini card ─────────────────────────────────────────────────────────
function SeriesMiniCard({ bean, onOpen }) {
  const image = bean?.image ? appendImageParams(bean.image, { w: 1000, h: 1000, fit: "pad", fm: "webp", q: 84 }) : "";
  return (
    <button type="button" onClick={() => onOpen(bean.slug)} className={cx("group h-full w-full overflow-hidden text-left transition hover:-translate-y-1", SOFT_PANEL)}>
      <div className="aspect-square overflow-hidden bg-[#11110f]">
        {image ? (
          <div className="flex h-full w-full items-center justify-center p-5">
            <img src={image} alt={bean.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]" />
          </div>
        ) : <ImagePlaceholder className="aspect-square" />}
      </div>
      <div className="p-4">
        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">{bean.category}</p>
        <h3 className="font-display mt-2 text-[20px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">{bean.name}</h3>
        {bean.tagline ? <p className="font-body mt-2 text-sm leading-6 text-white/56 line-clamp-2">{bean.tagline}</p> : null}
      </div>
    </button>
  );
}

// ─── Coffee card ─────────────────────────────────────────────────────────────
function CoffeeCard({ bean, onOpen, onAddToCart }) {
  const image = bean.image ? appendImageParams(bean.image, { w: 1200, h: 1200, fit: "pad", fm: "webp", q: 84 }) : "";
  return (
    <article className={cx("group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1", PANEL)}>
      <button type="button" onClick={() => onOpen(bean.slug)} className="block w-full text-left">
        <div className="relative aspect-[5/4] overflow-hidden bg-[#11110f]">
          {image ? (
            <div className="flex h-full w-full items-center justify-center p-5 sm:p-6">
              <img src={image} alt={bean.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]" />
            </div>
          ) : <ImagePlaceholder className="h-full" />}
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {bean.badge ? (
              <span className={cx("font-body rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]", badgeClasses(bean.badge))}>{bean.badge}</span>
            ) : null}
            {bean.wholesaleAvailable ? (
              <span className="font-body rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-white/76">Wholesale</span>
            ) : null}
          </div>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-display mt-1 text-[24px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">{bean.name}</h3>
        {bean.tagline ? <p className="font-body mt-2 text-sm leading-7 text-white/58 line-clamp-2">{bean.tagline}</p> : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {safeArray(bean.notes).slice(0, 3).map((note) => (
            <span key={note} className="font-body rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/62">{note}</span>
          ))}
        </div>

        <p className="font-body mt-3 text-[11px] uppercase tracking-[0.16em] text-white/36">Best for · {bean.bestFor || bean.category}</p>

        <div className="mt-auto border-t border-white/8 pt-4">
          <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Price</p>
          <p className="font-display mt-1 text-[22px] font-semibold tracking-[-0.03em] text-white">RM {bean.price}</p>
          <div className="mt-3 flex flex-col gap-2">
            <button type="button" onClick={() => onAddToCart(bean)} className={cx(LIGHT_BUTTON, "w-full justify-center")} style={LIGHT_BUTTON_STYLE}>
              Add to cart
            </button>
            <button type="button" onClick={() => onOpen(bean.slug)} className={cx(DARK_BUTTON, "w-full justify-center")}>
              View details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className={cx("overflow-hidden", PANEL)}>
      <div className="aspect-[5/4] animate-pulse bg-white/[0.05]" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        <div className="h-20 w-full animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const { beans, loading, error } = useBeans();
  const { cart, cartCount, cartTotal, addToCart, decreaseCartItem, increaseCartItem, removeCartItem, clearCart } = usePersistentCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [toast, setToast] = useState("");

  const monteblancoBeans = useMemo(() => beans.filter((item) =>
    [item.name, item.origin, item.collection].filter(Boolean).some((v) => String(v).toLowerCase().includes("monteblanco"))
  ), [beans]);

  const filteredBeans = useMemo(() => activeFilter === "All" ? beans : beans.filter((b) => b.category === activeFilter), [beans, activeFilter]);

  const filterCounts = useMemo(() => ({
    All: beans.length,
    Filter: beans.filter((b) => b.category === "Filter").length,
    Espresso: beans.filter((b) => b.category === "Espresso").length,
  }), [beans]);

  const bundleBeans = monteblancoBeans.slice(0, 3);
  const monteblancoBundleUrl = buildBundleOrderUrl(bundleBeans, "Monteblanco Series");
  const generalWhatsAppUrl = buildGeneralWhatsAppUrl();
  const wholesaleWhatsAppUrl = buildWholesaleWhatsAppUrl();

  useEffect(() => {
    document.body.style.overflow = (cartOpen || mobileNavOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, mobileNavOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  function openCoffee(slug) { navigate(`/coffee/${slug}`); }

  function handleAddToCart(bean) {
    trackAddToCart(bean, "home");
    addToCart(bean);
    setCartOpen(true);
    setToast(`${bean.name} added to cart`);
  }

  function handleAddBundle() {
    if (!bundleBeans.length) return;
    bundleBeans.forEach((bean) => addToCart(bean));
    setCartOpen(true);
    setToast("Monteblanco bundle added to cart");
  }

  return (
    <>
      <Seo
        title="Drunk Coffee Roasters | Specialty Coffee Roaster in Malaysia"
        description="Small-batch specialty coffee roasted in Johor, Malaysia. Shop filter and espresso coffees, explore the Monteblanco Series, and order fresh roast via WhatsApp."
        url="/"
        jsonLd={{
          "@context": "https://schema.org", "@type": "Organization",
          name: "Drunk Coffee Roasters", url: "https://drunkcoffeeroasters.com",
          sameAs: ["https://instagram.com/drunkcoffeeroasters"],
          contactPoint: { "@type": "ContactPoint", telephone: "+60-11-2706-0012", contactType: "customer service", areaServed: "MY" },
        }}
      />

      <div className={cx("min-h-screen", APP_BG)}>
        <div className="pointer-events-none fixed inset-0 opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
        </div>

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0d0b]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <a href="#top" className="flex items-center">
              <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-14 object-contain transition duration-300 hover:scale-[1.01] md:h-[70px]" />
            </a>

            <nav className="hidden items-center gap-7 md:flex">
              {/* Series → scrolls to #series section on the page */}
              <a href="#series" className="font-body text-[13px] tracking-[0.08em] text-white/62 transition hover:text-white">
                Series
              </a>
              {NAV_LINKS.map(([label, href]) => (
                <a key={label} href={href} className="font-body text-[13px] tracking-[0.08em] text-white/62 transition hover:text-white">{label}</a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCartOpen(true)} className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white" aria-label="Open cart">
                <ShoppingCart size={19} />
                {cartCount > 0 ? (
                  <span className="font-body absolute right-0.5 top-0.5 min-w-[17px] rounded-full bg-[#efe8db] px-1 text-center text-[9px] font-bold leading-4" style={LIGHT_BUTTON_STYLE}>{cartCount}</span>
                ) : null}
              </button>
              <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" onClick={() => trackWhatsappClick("home_header", "general")} className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] transition hover:border-white/18 hover:bg-white/[0.05] md:flex">
                <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" className="h-[18px] w-[18px] opacity-75 transition hover:opacity-100" />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white md:flex">
                <Instagram size={18} />
              </a>
              <button type="button" onClick={() => setMobileNavOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:bg-white/[0.05] hover:text-white md:hidden" aria-label="Open menu">
                <Menu size={19} />
              </button>
            </div>
          </div>
        </header>

        {/* ── MOBILE NAV ── */}
        {mobileNavOpen ? (
          <div className="fixed inset-0 z-[90] flex">
            <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Close menu" onClick={() => setMobileNavOpen(false)} />
            <div className="relative ml-auto flex h-full w-[80vw] max-w-xs flex-col border-l border-white/10 bg-[#0f0f0d] px-6 py-8 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between">
                <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-12 object-contain" />
                <button type="button" onClick={() => setMobileNavOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/58 transition hover:bg-white/[0.05] hover:text-white" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>

              <nav className="mt-10 flex flex-col gap-1">
                {/* Series → scroll to #series, close nav */}
                <a
                  href="#series"
                  onClick={() => setMobileNavOpen(false)}
                  className="font-body rounded-[14px] px-4 py-4 text-[15px] tracking-[0.04em] text-white/70 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Series
                </a>
                {/* Shop → scroll to #shop */}
                <a
                  href="#shop"
                  onClick={() => setMobileNavOpen(false)}
                  className="font-body rounded-[14px] px-4 py-4 text-[15px] tracking-[0.04em] text-white/70 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Shop
                </a>
                {NAV_LINKS.map(([label, href]) => (
                  <a key={label} href={href} onClick={() => setMobileNavOpen(false)} className="font-body rounded-[14px] px-4 py-4 text-[15px] tracking-[0.04em] text-white/70 transition hover:bg-white/[0.05] hover:text-white">
                    {label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t border-white/8 pt-6" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("home_mobile_menu", "general")} className={cx(LIGHT_BUTTON, "w-full justify-center")} style={LIGHT_BUTTON_STYLE}>
                  Order on WhatsApp
                </a>
                <div className="flex justify-center gap-4">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white" aria-label="Instagram">
                    <Instagram size={17} />
                  </a>
                  <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("home_mobile_menu_icon", "general")} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 transition hover:bg-white/[0.05]" aria-label="WhatsApp">
                    <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" className="h-4 w-4 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <main id="top" className="relative z-[1]">
          {/* ── HERO ── */}
          <section className="relative overflow-hidden border-b border-white/8">
            <div className="absolute inset-0">
              <img src="/hero-coffee.jpg" alt="Drunk Coffee Roasters roasting coffee" className="h-full w-full object-cover opacity-42" fetchPriority="high" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.86)_0%,rgba(8,8,8,0.62)_48%,rgba(8,8,8,0.7)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82),transparent_38%,rgba(0,0,0,0.22))]" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
              <FadeSection>
                <p className={EYEBROW}>Johor · Specialty Coffee Roaster</p>
                <h1 className="font-display mt-5 text-[38px] font-semibold leading-[0.88] tracking-[-0.05em] text-white sm:text-[56px] md:max-w-[11ch] md:text-[88px]">
                  Coffee with clarity.
                  <br />
                  Roasted with intent.
                </h1>
                <p className="font-body mt-5 max-w-2xl text-sm leading-8 text-white/62 md:text-[16px]">
                  Small-batch roasting from Johor, with coffees chosen for balance, character, and everyday brewing.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-3.5">
                  <a href="#shop" className={cx(LIGHT_BUTTON, "w-full justify-center sm:w-auto")} style={LIGHT_BUTTON_STYLE}>Shop coffees</a>
                  <a href="#series" className={cx(DARK_BUTTON, "w-full justify-center sm:w-auto")}>Explore series</a>
                </div>
                <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                  <div className={cx("p-4", SOFT_PANEL)}>
                    <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Roast style</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/74">Clean · balanced · expressive</p>
                  </div>
                  <div className={cx("p-4", SOFT_PANEL)}>
                    <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Best for</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/74">Home brewers · cafés · gifts</p>
                  </div>
                  <div className={cx("p-4", SOFT_PANEL)}>
                    <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Ordering</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/74">Cart + WhatsApp flow</p>
                  </div>
                </div>
              </FadeSection>
            </div>
          </section>

          {/* ── INFO STRIPS ── */}
          <section className="border-b border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Roasted fresh", text: "Roasted in small batches for clarity, balance, and consistency." },
                  { label: "Shipping", text: "Orders are usually packed and sent within 1–3 working days." },
                  { label: "Ordering", text: "Add to cart, then send one clean order through WhatsApp." },
                ].map((item, i) => (
                  <FadeSection key={item.label} delay={i * 90}>
                    <div className={cx("p-4", SOFT_PANEL)}>
                      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">{item.label}</p>
                      <p className="font-body mt-2 text-sm leading-7 text-white/74">{item.text}</p>
                    </div>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              SHOP — comes FIRST on mobile so user sees coffees right away
          ═══════════════════════════════════════════════════════════════════ */}
          <section id="shop" className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-18">
            <FadeSection>
              <SectionHeading
                eyebrow="Coffee menu"
                title="Shop by brew style"
                description="Filter, espresso, or all. Swipe to browse on mobile."
                action={
                  <div className="font-body text-sm text-white/42">
                    <span className="text-white/74">{filteredBeans.length}</span> coffee{filteredBeans.length !== 1 ? "s" : ""}
                  </div>
                }
              />
            </FadeSection>

            {/* Sticky filter bar */}
            <div className="sticky top-[72px] z-20 -mx-4 mt-7 border-b border-white/5 bg-[#0d0d0b]/92 px-4 pb-3 pt-2 backdrop-blur-md md:mx-0 md:px-0">
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={cx(
                        "font-body shrink-0 rounded-full border px-4 py-3 text-[13px] tracking-[0.04em] transition duration-200 active:scale-[0.97]",
                        isActive ? "border-[#efe8db] bg-[#efe8db] font-semibold" : "border-white/12 bg-white/[0.02] text-white/52 hover:border-white/22 hover:bg-white/[0.04] hover:text-white",
                      )}
                      style={isActive ? LIGHT_BUTTON_STYLE : undefined}
                    >
                      {filter} ({filterCounts[filter] ?? 0})
                    </button>
                  );
                })}
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-[22px] border border-amber-200/15 bg-amber-200/8 p-4 text-sm text-amber-100">{error}</div>
            ) : null}

            <div className="mt-8">
              {loading ? (
                <>
                  {/* Mobile skeleton swipe */}
                  <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden md:hidden">
                    {SKELETON_IDS.slice(0, 3).map((id) => (
                      <div key={id} className="w-[82vw] shrink-0"><SkeletonCard /></div>
                    ))}
                  </div>
                  {/* Desktop skeleton grid */}
                  <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
                    {SKELETON_IDS.map((id) => <SkeletonCard key={id} />)}
                  </div>
                </>
              ) : (
                <SwipeRowTracked
                  items={filteredBeans}
                  mobileItemWidth="w-[82vw]"
                  desktopCols="md:grid-cols-2 xl:grid-cols-3"
                  renderItem={(bean) => (
                    <CoffeeCard bean={bean} onOpen={openCoffee} onAddToCart={handleAddToCart} />
                  )}
                />
              )}
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════════════════════
              SERIES — below shop, so mobile users see coffees first
          ═══════════════════════════════════════════════════════════════════ */}
          <section id="series" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-18">
              <FadeSection>
                <SectionHeading
                  eyebrow="Series focus"
                  title="The Monteblanco Series"
                  description="Fruit-forward profiles from Monteblanco — swipe to compare, or order the full bundle."
                  action={
                    bundleBeans.length ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2.5">
                        <button type="button" onClick={handleAddBundle} className={DARK_BUTTON}>Add bundle to cart</button>
                        <a href={monteblancoBundleUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("home_series_bundle", "monteblanco")} className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                          Order bundle on WhatsApp
                        </a>
                      </div>
                    ) : null
                  }
                />
              </FadeSection>

              <div className="mt-8">
                {bundleBeans.length ? (
                  <SwipeRowTracked
                    items={bundleBeans}
                    mobileItemWidth="w-[72vw]"
                    desktopCols="md:grid-cols-3"
                    renderItem={(bean) => <SeriesMiniCard bean={bean} onOpen={openCoffee} />}
                  />
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── FEATURE CARDS ── */}
          <section className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-18">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { icon: <Sparkles size={20} className="text-white/34" />, title: "Built for everyday brewing", text: "A clearer storefront, with direct product pages and a simpler route into coffees worth drinking every day." },
                  { icon: <Package size={20} className="text-white/34" />, title: "Bundle, compare, repeat", text: "Explore the series side by side, or add the full set to cart in one go when you want the full expression." },
                  { icon: <ArrowRight size={20} className="text-white/34" />, title: "From browse to order", text: "Product cards, detail pages, cart, and WhatsApp now connect more naturally, so ordering feels faster and clearer." },
                ].map((card, i) => (
                  <FadeSection key={card.title} delay={i * 90}>
                    <div className={cx("h-full p-6 md:p-7", PANEL)}>
                      {card.icon}
                      <h3 className="font-display mt-4 text-[26px] font-semibold leading-[0.96] tracking-[-0.03em] text-white">{card.title}</h3>
                      <p className="font-body mt-4 text-sm leading-8 text-white/58">{card.text}</p>
                    </div>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* ── EDITORIAL ── */}
          <section className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-18">
              <FadeSection>
                <SectionHeading eyebrow="Proof of work" title="A closer look at how we work." description="Real moments from roasting, brewing, and packing coffee." />
              </FadeSection>
              <div className="mt-8 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                <FadeSection>
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
                    <img src="/editorial-drunk-coffee-roasters.jpg" alt="Drunk Coffee Roasters at work" className="h-full min-h-[280px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:min-h-[440px] lg:min-h-[560px]" loading="lazy" />
                  </div>
                </FadeSection>
                <div className="grid gap-4">
                  <FadeSection delay={90}><div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]"><img src="/editorial-brewing.jpg" alt="Brewing coffee" className="h-[200px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[260px]" loading="lazy" /></div></FadeSection>
                  <FadeSection delay={180}><div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]"><img src="/editorial-roasted-beans.jpg" alt="Freshly roasted coffee beans" className="h-[200px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[260px]" loading="lazy" /></div></FadeSection>
                  <FadeSection delay={270}>
                    <div className={cx("p-6 md:p-7", PANEL)}>
                      <Sparkles className="text-white/34" size={20} />
                      <h3 className="font-display mt-4 text-[26px] font-semibold leading-[0.96] tracking-[-0.03em] text-white">Roasted by hand, packed with care</h3>
                      <p className="font-body mt-4 text-sm leading-8 text-white/58">The work behind each release matters. Showing it makes the site feel grounded, active, and worth trusting.</p>
                    </div>
                  </FadeSection>
                </div>
              </div>
            </div>
          </section>

          {/* ── REVIEWS ── */}
          <section className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-18">
              <FadeSection>
                <SectionHeading eyebrow="Reviews" title="What customers are saying" />
              </FadeSection>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  { handle: "@coffeewithmei", sub: "Fresh roast · repeat order", text: '"The beans were really fragrant and tasted super fresh. I really liked them."' },
                  { handle: "@joeydrinkscoffee", sub: "Giftable · approachable", text: '"Perfect as a gift. My friend really loved it."' },
                  { handle: "@linaroundtheworld", sub: "Souvenir · easy to share", text: '"Amazing as a souvenir to bring back to China."' },
                ].map((r, i) => (
                  <FadeSection key={r.handle} delay={i * 90}>
                    <div className={cx("h-full p-6 md:p-7", PANEL)}>
                      <div className="flex items-center gap-1 text-[#efe8db]"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
                      <p className="font-body mt-5 text-base leading-8 text-white/78">{r.text}</p>
                      <div className="mt-6 flex items-center justify-between border-t border-white/8 pt-4">
                        <div>
                          <p className="font-body text-sm text-white/72">{r.handle}</p>
                          <p className="font-body mt-1 text-xs text-white/44">{r.sub}</p>
                        </div>
                        <span className="font-body rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/42">Customer note</span>
                      </div>
                    </div>
                  </FadeSection>
                ))}
              </div>
            </div>
          </section>

          {/* ── WHOLESALE ── */}
          <section id="wholesale" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-18">
              <div className="grid gap-5 lg:grid-cols-[1.06fr_0.94fr]">
                <FadeSection className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Wholesale</p>
                  <h2 className="font-display mt-4 text-[28px] font-semibold leading-[0.94] tracking-[-0.03em] text-white sm:text-[30px] md:text-[44px]">Supply for cafés, offices, and partners.</h2>
                  <p className="font-body mt-5 max-w-xl text-sm leading-8 text-white/54 md:text-[15px]">Small-batch roasting with cleaner house blends, more expressive seasonal filters.</p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
                    <Link to="/wholesale" className={cx(DARK_BUTTON, "w-full justify-center sm:w-auto")}>View wholesale page</Link>
                    <a href={wholesaleWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("home_wholesale", "wholesale")} className={cx(LIGHT_BUTTON, "w-full justify-center sm:w-auto")} style={LIGHT_BUTTON_STYLE}>Enquire on WhatsApp</a>
                  </div>
                </FadeSection>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <FadeSection delay={90} className={cx("p-5 md:p-6", SOFT_PANEL)}><p className="font-display text-[20px] font-semibold text-white">Suitable for</p><p className="font-body mt-2 text-sm leading-7 text-white/56">Cafés · office coffee corners · retail shelves · events</p></FadeSection>
                  <FadeSection delay={180} className={cx("p-5 md:p-6", SOFT_PANEL)}><p className="font-display text-[20px] font-semibold text-white">Roast direction</p><p className="font-body mt-2 text-sm leading-7 text-white/56">House espresso, seasonal filters, and approachable coffees that stay consistent.</p></FadeSection>
                </div>
              </div>
            </div>
          </section>

          {/* ── STORY + FOOTER ── */}
          <section id="story" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-18">
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <FadeSection className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Story</p>
                  <h2 className="font-display mt-4 text-[28px] font-semibold leading-[0.94] tracking-[-0.03em] text-white sm:text-[30px] md:text-[44px]">Coffee made to be enjoyed, not overcomplicated.</h2>
                  <p className="font-body mt-5 max-w-xl text-sm leading-8 text-white/56 md:text-[15px]">Drunk Coffee Roasters is built around daily brewing, careful roasting, and coffees with clarity, balance, and character.</p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:gap-3">
                    <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("home_story", "general")} className={cx(LIGHT_BUTTON, "w-full justify-center sm:w-auto")} style={LIGHT_BUTTON_STYLE}>Order fresh roast</a>
                    <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={cx(DARK_BUTTON, "w-full justify-center sm:w-auto")}>Follow Instagram</a>
                  </div>
                  <div className="mt-6 space-y-1 border-t border-white/8 pt-6">
                    <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex min-h-[44px] items-center gap-3 text-sm text-white/56 transition hover:text-white">
                      <span className="w-24 shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/30">Instagram</span>
                      <span>@drunkcoffeeroasters ↗</span>
                    </a>
                    <div className="flex min-h-[44px] items-center gap-3 text-sm text-white/56">
                      <span className="w-24 shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/30">小红书</span>
                      <span>{XHS_LABEL}</span>
                    </div>
                    <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("home_find_us", "general")} className="flex min-h-[44px] items-center gap-3 text-sm text-white/56 transition hover:text-white">
                      <span className="w-24 shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/30">WhatsApp</span>
                      <span>+601127060012 ↗</span>
                    </a>
                    <div className="flex min-h-[44px] items-center gap-3 text-sm text-white/56">
                      <span className="w-24 shrink-0 text-[10px] uppercase tracking-[0.18em] text-white/30">Location</span>
                      <span>Johor, Malaysia</span>
                    </div>
                  </div>
                </FadeSection>

                <FadeSection delay={100} className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>FAQ</p>
                  <h2 className="font-display mt-4 text-[28px] font-semibold leading-[0.94] tracking-[-0.03em] text-white sm:text-[30px] md:text-[44px]">A few useful things to know</h2>
                  <div className="mt-6 space-y-4">
                    {[
                      { q: "How do I place an order?", a: "Add your coffees to cart and send the order through WhatsApp. We'll confirm availability and roasting lead time there." },
                      { q: "When will my coffee be shipped?", a: "Most orders are packed and shipped within 1–3 working days, depending on roast schedule and order volume." },
                      { q: "Filter or espresso?", a: "Each coffee is marked by brew style and best use, so you can choose more easily without guessing." },
                      { q: "Do you offer wholesale?", a: "Yes. We supply cafés, offices, events, and retail partners. Use the wholesale section or WhatsApp to enquire." },
                    ].map((faq) => (
                      <div key={faq.q} className={cx("p-4", SOFT_PANEL)}>
                        <p className="font-display text-[17px] font-semibold text-white">{faq.q}</p>
                        <p className="font-body mt-2 text-sm leading-7 text-white/58">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </FadeSection>
              </div>
            </div>
          </section>
        </main>

        <CartDrawer
          cartOpen={cartOpen}
          setCartOpen={setCartOpen}
          cart={cart}
          cartCount={cartCount}
          cartTotal={cartTotal}
          decreaseCartItem={decreaseCartItem}
          increaseCartItem={increaseCartItem}
          removeCartItem={removeCartItem}
          clearCart={clearCart}
        />

        {toast ? (
          <div
            className="pointer-events-none fixed left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/12 bg-[#efe8db] px-4 py-2 text-sm font-medium shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            style={{ ...LIGHT_BUTTON_STYLE, bottom: "max(5rem, calc(1.25rem + env(safe-area-inset-bottom)))" }}
          >
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}
