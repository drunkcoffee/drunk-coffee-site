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

function ImagePlaceholder({ className = "" }) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/[0.05] to-transparent",
        className,
      )}
    >
      <Coffee size={30} className="text-white/18" strokeWidth={1.2} />
      <span className="font-body text-[10px] uppercase tracking-[0.18em] text-white/22">
        Photo coming soon
      </span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2 className="font-display mt-3 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[46px]">
          {title}
        </h2>
        {description ? (
          <p className="font-body mt-4 max-w-xl text-sm leading-7 text-white/54 md:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function ReviewCard({ handle, meta, quote, initials, delay = 0 }) {
  return (
    <FadeSection delay={delay}>
      <div className={cx("h-full p-6 md:p-7", PANEL)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/78">
              {initials}
            </div>
            <div>
              <p className="font-body text-sm text-white/74">{handle}</p>
              <p className="font-body mt-1 text-xs text-white/40">{meta}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[#efe8db]">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
          </div>
        </div>

        <p className="font-body mt-5 text-base leading-8 text-white/78">
          {quote}
        </p>
      </div>
    </FadeSection>
  );
}


function CartDrawer({
  cartOpen,
  setCartOpen,
  cart,
  cartCount,
  cartTotal,
  decreaseCartItem,
  increaseCartItem,
  removeCartItem,
  clearCart,
}) {
  if (!cartOpen) return null;

  const cartWhatsAppUrl = buildCartWhatsAppUrl(cart);

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/70">
      <button type="button" onClick={() => setCartOpen(false)} className="flex-1" aria-label="Close cart" />
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
              <p className="font-display mt-1 text-[28px] font-semibold tracking-[-0.03em] text-white">
                RM {cartTotal}
              </p>
            </div>
            {cart.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="font-body text-xs uppercase tracking-[0.12em] text-white/36 transition hover:text-white/74"
              >
                Clear cart
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2.5">
            <a href={cartWhatsAppUrl} target="_blank" rel="noreferrer" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
              Send order on WhatsApp
            </a>
            <button type="button" onClick={() => setCartOpen(false)} className={DARK_BUTTON}>
              Continue browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeriesMiniCard({ bean, onOpen }) {
  const image = bean?.image
    ? appendImageParams(bean.image, { w: 1000, h: 1000, fit: "pad", fm: "webp", q: 84 })
    : "";

  return (
    <button
      type="button"
      onClick={() => onOpen(bean.slug)}
      className={cx("group overflow-hidden text-left transition hover:-translate-y-1", SOFT_PANEL)}
    >
      <div className="aspect-square overflow-hidden bg-[#11110f]">
        {image ? (
          <div className="flex h-full w-full items-center justify-center p-5">
            <img src={image} alt={bean.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]" />
          </div>
        ) : (
          <ImagePlaceholder className="aspect-square" />
        )}
      </div>
      <div className="p-5">
        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">{bean.category}</p>
        <h3 className="font-display mt-2 text-[22px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
          {bean.name}
        </h3>
        {bean.tagline ? (
          <p className="font-body mt-2 text-sm leading-7 text-white/56">{bean.tagline}</p>
        ) : null}
      </div>
    </button>
  );
}

function CoffeeCard({ bean, onOpen, onAddToCart }) {
  const image = bean.image
    ? appendImageParams(bean.image, { w: 1200, h: 1200, fit: "pad", fm: "webp", q: 84 })
    : "";

  return (
    <article className={cx("group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1", PANEL)}>
      <button type="button" onClick={() => onOpen(bean.slug)} className="block w-full text-left">
        <div className="relative aspect-[5/4] overflow-hidden bg-[#11110f]">
          {image ? (
            <div className="flex h-full w-full items-center justify-center p-5 sm:p-6">
              <img src={image} alt={bean.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]" />
            </div>
          ) : (
            <ImagePlaceholder className="h-full" />
          )}

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
        </div>
      </button>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-display mt-1 text-[26px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
          {bean.name}
        </h3>
        {bean.tagline ? (
          <p className="font-body mt-3 text-sm leading-7 text-white/58">{bean.tagline}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {safeArray(bean.notes).slice(0, 3).map((note) => (
            <span
              key={note}
              className="font-body rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/62"
            >
              {note}
            </span>
          ))}
        </div>

        <p className="font-body mt-4 text-[11px] uppercase tracking-[0.16em] text-white/36">
          Best for · {bean.bestFor || bean.category}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/8 pt-5">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Price</p>
            <p className="font-display mt-2 text-[24px] font-semibold tracking-[-0.03em] text-white">RM {bean.price}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => onOpen(bean.slug)} className={DARK_BUTTON}>
              View details
            </button>
            <button type="button" onClick={() => onAddToCart(bean)} className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
              Add to cart
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

export default function HomePage() {
  const navigate = useNavigate();
  const { beans, loading, error } = useBeans();
  const {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    decreaseCartItem,
    increaseCartItem,
    removeCartItem,
    clearCart,
  } = usePersistentCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [toast, setToast] = useState("");

  const featuredBean = useMemo(() => {
    return beans.find((bean) => bean.featured) || beans[0] || null;
  }, [beans]);

  const monteblancoBeans = useMemo(() => {
    return beans.filter((item) =>
      [item.name, item.origin, item.collection]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes("monteblanco")),
    );
  }, [beans]);

  const filteredBeans = useMemo(() => {
    if (activeFilter === "All") return beans;
    return beans.filter((bean) => bean.category === activeFilter);
  }, [beans, activeFilter]);

  const filterCounts = useMemo(
    () => ({
      All: beans.length,
      Filter: beans.filter((bean) => bean.category === "Filter").length,
      Espresso: beans.filter((bean) => bean.category === "Espresso").length,
    }),
    [beans],
  );

  const bundleBeans = monteblancoBeans.slice(0, 3);
  const monteblancoBundleUrl = buildBundleOrderUrl(bundleBeans, "Monteblanco Series");
  const generalWhatsAppUrl = buildGeneralWhatsAppUrl();
  const wholesaleWhatsAppUrl = buildWholesaleWhatsAppUrl();

  useEffect(() => {
    const locked = cartOpen || mobileNavOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen, mobileNavOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timeout);
  }, [toast]);

  function openCoffee(slug) {
    navigate(`/coffee/${slug}`);
  }

  function handleAddToCart(bean) {
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

  function handleQuickFilter(filter) {
    setActiveFilter(filter);
    const el = document.getElementById("shop");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Seo
        title="Specialty Coffee Roaster in Malaysia"
        description="Small-batch specialty coffee roasted in Johor, Malaysia for filter, espresso, and wholesale supply."
        url="/"
      />

      <div className={cx("min-h-screen", APP_BG)}>
        <div className="pointer-events-none fixed inset-0 opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
        </div>

        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0d0b]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <a href="#top" className="flex items-center">
              <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-14 object-contain transition duration-300 hover:scale-[1.01] md:h-[70px]" />
            </a>

            <nav className="hidden items-center gap-7 md:flex">
              <a href="#series" className="font-body text-[13px] tracking-[0.08em] text-white/62 transition hover:text-white">
                Series
              </a>
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
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white"
                aria-label="Open cart"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 ? (
                  <span className="font-body absolute right-0.5 top-0.5 min-w-[17px] rounded-full bg-[#efe8db] px-1 text-center text-[9px] font-bold leading-4" style={LIGHT_BUTTON_STYLE}>
                    {cartCount}
                  </span>
                ) : null}
              </button>

              <a
                href={generalWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] transition hover:border-white/18 hover:bg-white/[0.05] md:flex"
              >
                <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" className="h-[18px] w-[18px] opacity-75 transition hover:opacity-100" />
              </a>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white md:flex"
              >
                <Instagram size={18} />
              </a>

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
                <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-12 object-contain" />
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
                <a
                  href="#series"
                  onClick={() => setMobileNavOpen(false)}
                  className="font-body rounded-[14px] px-4 py-3.5 text-[15px] tracking-[0.04em] text-white/70 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Series
                </a>
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
                <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" className={cx(LIGHT_BUTTON, "w-full justify-center")} style={LIGHT_BUTTON_STYLE}>
                  Order on WhatsApp
                </a>
                <div className="flex justify-center gap-4">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:text-white" aria-label="Instagram">
                    <Instagram size={17} />
                  </a>
                  <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition hover:bg-white/[0.05]" aria-label="WhatsApp">
                    <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" className="h-4 w-4 opacity-60" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <main id="top" className="relative z-[1]">
          <section className="relative overflow-hidden border-b border-white/8">
            <div className="absolute inset-0">
              <img
                src="/hero-coffee.jpg"
                alt="Drunk Coffee Roasters roasting coffee"
                className="h-full w-full object-cover opacity-42"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.86)_0%,rgba(8,8,8,0.62)_48%,rgba(8,8,8,0.7)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82),transparent_38%,rgba(0,0,0,0.22))]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
              <div className="max-w-4xl">
                <FadeSection>
                  <div>
                    <p className={EYEBROW}>Johor · Specialty Coffee Roaster</p>
                    <h1 className="font-display mt-5 text-[48px] font-semibold leading-[0.88] tracking-[-0.05em] text-white sm:text-[64px] md:max-w-[11ch] md:text-[88px]">
                      Coffee with clarity.
                      <br />
                      Roasted with intent.
                    </h1>
                    <p className="font-body mt-6 max-w-2xl text-sm leading-8 text-white/62 md:text-[16px]">
                      Small-batch roasting from Johor, with coffees chosen for balance, character, and everyday brewing.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3.5">
                      <a href="#shop" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                        Shop coffees
                      </a>
                      <a href="#series" className={DARK_BUTTON}>
                        Explore series
                      </a>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleQuickFilter("Filter")}
                        className="font-body rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-[12px] tracking-[0.04em] text-white/68 transition hover:border-white/22 hover:bg-white/[0.07] hover:text-white"
                      >
                        Filter favourites
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFilter("Espresso")}
                        className="font-body rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-[12px] tracking-[0.04em] text-white/68 transition hover:border-white/22 hover:bg-white/[0.07] hover:text-white"
                      >
                        Espresso picks
                      </button>
                      <a
                        href="#wholesale"
                        className="font-body rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-2 text-[12px] tracking-[0.04em] text-white/68 transition hover:border-white/22 hover:bg-white/[0.07] hover:text-white"
                      >
                        Wholesale enquiry
                      </a>
                    </div>

                    <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
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
                  </div>
                </FadeSection>
              </div>
            </div>
          </section>

          <section className="border-b border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
              <div className="grid gap-3 md:grid-cols-3">
                <FadeSection>
                  <div className={cx("p-4", SOFT_PANEL)}>
                    <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Roasted fresh</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/74">
                      Roasted in small batches for clarity, balance, and consistency.
                    </p>
                  </div>
                </FadeSection>
                <FadeSection delay={90}>
                  <div className={cx("p-4", SOFT_PANEL)}>
                    <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Shipping</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/74">
                      Orders are usually packed and sent within 1–3 working days.
                    </p>
                  </div>
                </FadeSection>
                <FadeSection delay={180}>
                  <div className={cx("p-4", SOFT_PANEL)}>
                    <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Ordering</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/74">
                      Add to cart, then send one clean order through WhatsApp.
                    </p>
                  </div>
                </FadeSection>
              </div>
            </div>
          </section>

          <section id="series" className="border-b border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <FadeSection>
                <SectionHeading
                  eyebrow="Series focus"
                  title="The Monteblanco Series"
                  description="A focused look at fruit-forward profiles from Monteblanco — built for comparison, exploration, and easy repeat ordering."
                  action={
                    bundleBeans.length ? (
                      <div className="flex flex-wrap gap-2.5">
                        <button type="button" onClick={handleAddBundle} className={DARK_BUTTON}>
                          Add bundle to cart
                        </button>
                        <a href={monteblancoBundleUrl} target="_blank" rel="noreferrer" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                          Order the bundle
                        </a>
                      </div>
                    ) : null
                  }
                />
              </FadeSection>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {bundleBeans.length ? (
                  bundleBeans.map((bean, index) => (
                    <FadeSection key={bean.id} delay={index * 90}>
                      <SeriesMiniCard bean={bean} onOpen={openCoffee} />
                    </FadeSection>
                  ))
                ) : (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="border-b border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <div className="grid gap-4 md:grid-cols-3">
                <FadeSection>
                  <div className={cx("h-full p-6 md:p-7", PANEL)}>
                    <Sparkles className="text-white/34" size={20} />
                    <h3 className="font-display mt-4 text-[28px] font-semibold leading-[0.96] tracking-[-0.03em] text-white">
                      Built for everyday brewing
                    </h3>
                    <p className="font-body mt-4 text-sm leading-8 text-white/58">
                      A clearer storefront, with direct product pages and a simpler route into coffees worth drinking every day.
                    </p>
                  </div>
                </FadeSection>

                <FadeSection delay={90}>
                  <div className={cx("h-full p-6 md:p-7", PANEL)}>
                    <Package className="text-white/34" size={20} />
                    <h3 className="font-display mt-4 text-[28px] font-semibold leading-[0.96] tracking-[-0.03em] text-white">
                      Bundle, compare, repeat
                    </h3>
                    <p className="font-body mt-4 text-sm leading-8 text-white/58">
                      Explore the series side by side, or add the full set to cart in one go when you want the full expression.
                    </p>
                  </div>
                </FadeSection>

                <FadeSection delay={180}>
                  <div className={cx("h-full p-6 md:p-7", PANEL)}>
                    <ArrowRight className="text-white/34" size={20} />
                    <h3 className="font-display mt-4 text-[28px] font-semibold leading-[0.96] tracking-[-0.03em] text-white">
                      From browse to order
                    </h3>
                    <p className="font-body mt-4 text-sm leading-8 text-white/58">
                      Product cards, detail pages, cart, and WhatsApp now connect more naturally, so ordering feels faster and clearer.
                    </p>
                  </div>
                </FadeSection>
              </div>
            </div>
          </section>

          <section className="border-b border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <FadeSection>
                <SectionHeading
                  eyebrow="Proof of work"
                  title="A closer look at how we work."
                  description="Real moments from roasting, brewing, and packing coffee — the part of the brand that makes it feel real."
                />
              </FadeSection>

              <div className="mt-8 grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                <FadeSection>
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03]">
                    <img
                      src="/editorial-drunk-coffee-roasters.jpg"
                      alt="Drunk Coffee Roasters at work"
                      className="h-full min-h-[340px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:min-h-[440px] lg:min-h-[560px]"
                      loading="lazy"
                    />
                  </div>
                </FadeSection>

                <div className="grid gap-4">
                  <FadeSection delay={90}>
                    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                      <img
                        src="/editorial-brewing.jpg"
                        alt="Brewing coffee"
                        className="h-[220px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[260px]"
                        loading="lazy"
                      />
                    </div>
                  </FadeSection>

                  <FadeSection delay={180}>
                    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                      <img
                        src="/editorial-roasted-beans.jpg"
                        alt="Freshly roasted coffee beans"
                        className="h-[220px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[260px]"
                        loading="lazy"
                      />
                    </div>
                  </FadeSection>

                  <FadeSection delay={270}>
                    <div className={cx("p-6 md:p-7", PANEL)}>
                      <Sparkles className="text-white/34" size={20} />
                      <h3 className="font-display mt-4 text-[28px] font-semibold leading-[0.96] tracking-[-0.03em] text-white">
                        Roasted by hand, packed with care
                      </h3>
                      <p className="font-body mt-4 text-sm leading-8 text-white/58">
                        The work behind each release matters. Showing it makes the site feel grounded, active, and worth trusting.
                      </p>
                    </div>
                  </FadeSection>
                </div>
              </div>
            </div>
          </section>

          <section id="shop" className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
            <FadeSection>
              <SectionHeading
                eyebrow="Coffee menu"
                title="Shop by brew style"
                description="Choose by how people actually buy: filter, espresso, or all. Product pages carry the rest."
                action={
                  <div className="font-body text-sm text-white/42">
                    Showing <span className="text-white/74">{filteredBeans.length}</span> coffee{filteredBeans.length !== 1 ? "s" : ""}
                  </div>
                }
              />
            </FadeSection>

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

            {error ? (
              <div className="mt-5 rounded-[22px] border border-amber-200/15 bg-amber-200/8 p-4 text-sm text-amber-100">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
                  <SkeletonCard key={id} />
                ))}
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBeans.map((bean, index) => (
                  <FadeSection key={bean.id} delay={index * 70}>
                    <CoffeeCard bean={bean} onOpen={openCoffee} onAddToCart={handleAddToCart} />
                  </FadeSection>
                ))}
              </div>
            )}
          </section>

          <section className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <FadeSection>
                <SectionHeading
                  eyebrow="Reviews"
                  title="What customers are saying"
                  description="Real buying reasons matter more than generic brand claims — freshness, gifting, and coffee people actually want to bring home."
                />
              </FadeSection>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <ReviewCard
                  delay={0}
                  initials="CM"
                  handle="@coffeewithmei"
                  meta="Fresh roast · repeat order"
                  quote="“The beans were really fragrant and tasted super fresh. I really liked them.”"
                />
                <ReviewCard
                  delay={90}
                  initials="JD"
                  handle="@joeydrinkscoffee"
                  meta="Giftable · approachable"
                  quote="“Perfect as a gift. My friend really loved it.”"
                />
                <ReviewCard
                  delay={180}
                  initials="LW"
                  handle="@linaroundtheworld"
                  meta="Souvenir · easy to share"
                  quote="“Amazing as a souvenir to bring back to China.”"
                />
              </div>
            </div>
          </section>

          <section id="wholesale" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <div className="grid gap-5 lg:grid-cols-[1.06fr_0.94fr]">
                <FadeSection className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Wholesale</p>
                  <h2 className="font-display mt-4 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[44px]">
                    Supply for cafés,
                    <br />
                    offices, and partners.
                  </h2>
                  <p className="font-body mt-5 max-w-xl text-sm leading-8 text-white/54 md:text-[15px]">
                    Small-batch roasting with cleaner house blends, more expressive seasonal filters, and a storefront flow that makes wholesale enquiries easier to convert.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3.5">
                    <a href={wholesaleWhatsAppUrl} target="_blank" rel="noreferrer" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                      Enquire on WhatsApp
                    </a>
                    <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={DARK_BUTTON}>
                      Instagram ↗
                    </a>
                  </div>
                </FadeSection>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <FadeSection delay={90} className={cx("p-5 md:p-6", SOFT_PANEL)}>
                    <p className="font-display text-[20px] font-semibold text-white">Suitable for</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/56">
                      Cafés · office coffee corners · retail shelves · events
                    </p>
                  </FadeSection>
                  <FadeSection delay={180} className={cx("p-5 md:p-6", SOFT_PANEL)}>
                    <p className="font-display text-[20px] font-semibold text-white">Roast direction</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/56">
                      House espresso, seasonal filters, and approachable coffees that stay consistent.
                    </p>
                  </FadeSection>
                </div>
              </div>
            </div>
          </section>

          <section id="story" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <FadeSection className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Story</p>
                  <h2 className="font-display mt-4 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[44px]">
                    Coffee made to be enjoyed,
                    <br />
                    not overcomplicated.
                  </h2>
                  <p className="font-body mt-5 max-w-xl text-sm leading-8 text-white/56 md:text-[15px]">
                    Drunk Coffee Roasters is built around daily brewing, careful roasting, and coffees with clarity, balance, and character. The site now reflects that better — less menu sheet, more actual brand storefront.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                      Order fresh roast
                    </a>
                    <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={DARK_BUTTON}>
                      Follow Instagram
                    </a>
                  </div>
                </FadeSection>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FadeSection delay={90} className={cx("p-5", SOFT_PANEL)}>
                    <p className="font-display text-[18px] font-semibold text-white">Small-batch roasting</p>
                    <p className="font-body mt-2 text-sm leading-7 text-white/56">
                      Roasted in smaller batches for cleaner, more expressive cups.
                    </p>
                  </FadeSection>

                  <FadeSection delay={180} className={cx("p-5 sm:col-span-2", SOFT_PANEL)}>
                    <p className="font-display text-[18px] font-semibold text-white">Find us</p>
                    <div className="mt-4 space-y-3 text-sm">
                      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/56 transition hover:text-white">
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">Instagram</span>
                        <span>@drunkcoffeeroasters ↗</span>
                      </a>
                      <div className="flex items-center gap-3 text-white/56">
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">小红书</span>
                        <span>{XHS_LABEL}</span>
                      </div>
                      <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-white/56 transition hover:text-white">
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">WhatsApp</span>
                        <span>+601127060012 ↗</span>
                      </a>
                      <div className="flex items-center gap-3 text-white/56">
                        <span className="w-24 text-[10px] uppercase tracking-[0.18em] text-white/30">Location</span>
                        <span>Johor, Malaysia</span>
                      </div>
                    </div>
                  </FadeSection>
                </div>
              </div>
            </div>
          </section>
          <section className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <FadeSection className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>FAQ</p>
                  <h2 className="font-display mt-4 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[44px]">
                    A few useful things to know
                  </h2>

                  <div className="mt-6 space-y-4">
                    <div className={cx("p-4", SOFT_PANEL)}>
                      <p className="font-display text-[18px] font-semibold text-white">How do I place an order?</p>
                      <p className="font-body mt-2 text-sm leading-7 text-white/58">
                        Add your coffees to cart and send the order through WhatsApp. We will confirm availability and roasting lead time there.
                      </p>
                    </div>

                    <div className={cx("p-4", SOFT_PANEL)}>
                      <p className="font-display text-[18px] font-semibold text-white">When will my coffee be shipped?</p>
                      <p className="font-body mt-2 text-sm leading-7 text-white/58">
                        Most orders are packed and shipped within 1–3 working days, depending on roast schedule and order volume.
                      </p>
                    </div>

                    <div className={cx("p-4", SOFT_PANEL)}>
                      <p className="font-display text-[18px] font-semibold text-white">Are these coffees for filter or espresso?</p>
                      <p className="font-body mt-2 text-sm leading-7 text-white/58">
                        Each coffee is marked by brew style and best use, so you can choose more easily without guessing.
                      </p>
                    </div>

                    <div className={cx("p-4", SOFT_PANEL)}>
                      <p className="font-display text-[18px] font-semibold text-white">Do you offer wholesale?</p>
                      <p className="font-body mt-2 text-sm leading-7 text-white/58">
                        Yes. We supply cafés, offices, events, and retail partners. Use the wholesale section or WhatsApp to enquire.
                      </p>
                    </div>
                  </div>
                </FadeSection>

                <FadeSection delay={100} className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Footer</p>
                  <h2 className="font-display mt-4 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[44px]">
                    Stay connected
                  </h2>

                  <div className="mt-6 space-y-4">
                    <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={cx("flex items-center justify-between p-4 transition hover:bg-white/[0.05]", SOFT_PANEL)}>
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Instagram</p>
                        <p className="font-body mt-2 text-sm text-white/74">@drunkcoffeeroasters</p>
                      </div>
                      <ArrowRight className="text-white/34" size={18} />
                    </a>

                    <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer" className={cx("flex items-center justify-between p-4 transition hover:bg-white/[0.05]", SOFT_PANEL)}>
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">WhatsApp</p>
                        <p className="font-body mt-2 text-sm text-white/74">+601127060012</p>
                      </div>
                      <ArrowRight className="text-white/34" size={18} />
                    </a>

                    <div className={cx("p-4", SOFT_PANEL)}>
                      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">小红书</p>
                      <p className="font-body mt-2 text-sm text-white/74">{XHS_LABEL}</p>
                    </div>

                    <div className={cx("p-4", SOFT_PANEL)}>
                      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Location</p>
                      <p className="font-body mt-2 text-sm text-white/74">Johor, Malaysia</p>
                    </div>

                    <a href={wholesaleWhatsAppUrl} target="_blank" rel="noreferrer" className={cx("flex items-center justify-between p-4 transition hover:bg-white/[0.05]", SOFT_PANEL)}>
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Wholesale enquiry</p>
                        <p className="font-body mt-2 text-sm text-white/74">For café supply and retail partnership</p>
                      </div>
                      <ArrowRight className="text-white/34" size={18} />
                    </a>
                  </div>

                  <p className="font-body mt-6 text-xs tracking-[0.04em] text-white/28">
                    © Drunk Coffee Roasters · Johor, Malaysia
                  </p>
                </FadeSection>
              </div>
            </div>
          </section>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/10 bg-[#0d0d0b]/95 p-3 backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/78 transition hover:bg-white/[0.08]"
              aria-label="Open cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 ? (
                <span className="font-body absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#efe8db] px-1 text-center text-[9px] font-bold leading-5" style={LIGHT_BUTTON_STYLE}>
                  {cartCount}
                </span>
              ) : null}
            </button>

            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 flex-1 items-center justify-between rounded-full bg-[#efe8db] px-5 py-3.5 text-sm font-semibold"
              style={LIGHT_BUTTON_STYLE}
            >
              <span className="truncate">Order via WhatsApp</span>
              <span className="ml-4 shrink-0">Fresh roast</span>
            </a>
          </div>
        </div>

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
          <div className="pointer-events-none fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/12 bg-[#efe8db] px-4 py-2 text-sm font-medium shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:bottom-5" style={LIGHT_BUTTON_STYLE}>
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}
