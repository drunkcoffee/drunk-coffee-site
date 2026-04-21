import { ShoppingCart, Instagram, Menu, X, Coffee } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import {
  APP_BG,
  DARK_BUTTON,
  EYEBROW,
  FILTERS,
  HOW_TO_ORDER_STEPS,
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
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
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
      onClick={() => onOpen(bean.slug)}
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
          {bean.tagline ? (
            <p className="font-body mt-2 line-clamp-2 text-[13px] leading-6 text-white/64">
              {bean.tagline}
            </p>
          ) : null}
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
        onClick={() => onOpen(bean.slug)}
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
                {bean.tagline ? (
                  <p className="font-body mt-2 max-w-[28ch] text-[13px] leading-6 text-white/64">
                    {bean.tagline}
                  </p>
                ) : null}
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

        {bean.bestFor ? (
          <p className="font-body mt-3 text-xs uppercase tracking-[0.12em] text-white/34">
            Best for · {bean.bestFor}
          </p>
        ) : null}

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
                onClick={() => onOpen(bean.slug)}
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
            <a
              href={cartWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className={LIGHT_BUTTON}
              style={LIGHT_BUTTON_STYLE}
            >
              Send order on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className={DARK_BUTTON}
            >
              Continue browsing
            </button>
          </div>
        </div>
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

  const [activeFilter, setActiveFilter] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filterKey, setFilterKey] = useState(0);

  const featuredBeans = useMemo(() => beans.filter((b) => b.featured), [beans]);

  const spotlightBeans = useMemo(() => {
    const preferred = beans.filter((bean) => {
      const key = `${bean.slug || ""} ${bean.name || ""}`.toLowerCase();
      return (
        key.includes("mango") ||
        key.includes("apple") ||
        key.includes("orange blossom")
      );
    });
    return preferred.slice(0, 3);
  }, [beans]);

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

  const spotlightBundleUrl = buildBundleOrderUrl(
    spotlightBeans,
    spotlightBeans.length ? "Monteblanco Series" : "Featured Set",
  );

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setCartOpen(false);
        setMobileNavOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  function handleFilterChange(filter) {
    setActiveFilter(filter);
    setFilterKey((k) => k + 1);
  }

  function handleAddToCart(bean) {
    addToCart(bean);
    setCartOpen(true);
    setToast(`${bean.name} added to cart`);
  }

  function openBean(slug) {
    navigate(`/coffee/${slug}`);
  }

  const openGeneralWhatsApp = buildGeneralWhatsAppUrl();
  const wholesaleWhatsAppUrl = buildWholesaleWhatsAppUrl();

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
              <img
                src="/logo.png"
                alt="Drunk Coffee Roasters"
                className="h-14 object-contain transition duration-300 hover:scale-[1.01] md:h-[70px]"
              />
            </a>

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

        <main id="top" className="relative z-[1]">
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

                <h1 className="font-display mt-5 max-w-[11ch] text-[50px] font-semibold leading-[0.88] tracking-[-0.05em] text-white sm:text-[64px] md:text-[84px] xl:text-[96px]">
                  Specialty coffee,
                  <br />
                  made easy to enjoy.
                </h1>

                <p className="font-body mt-6 max-w-md text-sm leading-7 text-white/56 md:text-[15px] md:leading-8">
                  Clean, balanced, expressive coffees — roasted in small batches for everyday brewing, espresso, and gifting.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <a href="#shop" className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                    Shop Coffee
                  </a>
                  <a href={openGeneralWhatsApp} target="_blank" rel="noreferrer" className={DARK_BUTTON}>
                    Order via WhatsApp
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
                      Designed for
                    </p>
                    <p className="font-body mt-1 text-sm text-white/72">
                      Home brewers · cafés · gifts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {!loading && featuredBeans.length > 0 ? (
            <section className="border-b border-white/8 py-10 md:py-12">
              <FadeSection>
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className={EYEBROW}>Featured coffees</p>
                      <h2 className="font-display mt-2 text-[22px] font-semibold leading-[0.96] tracking-[-0.03em] text-white md:text-[28px]">
                        Roasting now
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
                      onOpen={openBean}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                  <div className="w-1 shrink-0" />
                </div>
              </FadeSection>
            </section>
          ) : null}

          {!loading && spotlightBeans.length > 0 ? (
            <section className="border-b border-white/8">
              <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
                <FadeSection>
                  <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                    <div>
                      <p className={EYEBROW}>Series highlight</p>
                      <h2 className="font-display mt-3 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[44px]">
                        Monteblanco Series
                      </h2>
                      <p className="font-body mt-4 max-w-xl text-sm leading-7 text-white/54 md:text-[15px]">
                        Fruit-forward coffees with clean structure and expressive fermentation. Try the full set or explore each profile one by one.
                      </p>
                    </div>

                    <div className={cx("p-5 md:p-6", SOFT_PANEL)}>
                      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
                        Included profiles
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {spotlightBeans.map((bean) => (
                          <span
                            key={bean.id}
                            className="font-body rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/68"
                          >
                            {bean.name}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={spotlightBundleUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={LIGHT_BUTTON}
                          style={LIGHT_BUTTON_STYLE}
                        >
                          Order the set
                        </a>
                        <a href="#shop" className={DARK_BUTTON}>
                          Explore all coffees
                        </a>
                      </div>
                    </div>
                  </div>
                </FadeSection>
              </div>
            </section>
          ) : null}

          <section id="shop" className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-18">
            <FadeSection>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <SectionHeading
                  eyebrow="Coffee Menu"
                  title="Choose by brew style"
                  description="Every coffee we roast is available to order directly. Pick your style, check the notes, and open the full product page."
                />
                <div className="font-body text-sm text-white/40 md:text-right">
                  Showing <span className="text-white/72">{filteredBeans.length}</span> coffee{filteredBeans.length !== 1 ? "s" : ""}
                </div>
              </div>
            </FadeSection>

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

            {error ? (
              <div className="font-body mt-5 rounded-[22px] border border-amber-200/15 bg-amber-200/8 p-4 text-sm text-amber-100">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
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
              <div key={filterKey} className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBeans.map((bean, index) => (
                  <CoffeeCard
                    key={bean.id}
                    bean={bean}
                    onOpen={openBean}
                    onAddToCart={handleAddToCart}
                    animationDelay={index * 80}
                  />
                ))}
              </div>
            )}
          </section>

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
                    Approachable espresso blends, seasonal filter options, and a more dependable small-batch supply model for businesses that want a cleaner house coffee offer.
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

          <section id="story" className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <FadeSection className="flex gap-3">
                  <div className="flex-[1.08] overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03]">
                    <img
                      src="/editorial-drunk-coffee-roasters.jpg"
                      alt="Drunk Coffee Roasters team"
                      className="h-full min-h-[380px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:min-h-[480px] lg:min-h-[560px]"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-[0.92] flex-col gap-3 pt-10 sm:pt-14">
                    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
                      <img
                        src="/editorial-brewing.jpg"
                        alt="Coffee being brewed"
                        className="h-[180px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[220px]"
                        loading="lazy"
                      />
                    </div>
                    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
                      <img
                        src="/editorial-roasted-beans.jpg"
                        alt="Freshly roasted coffee beans"
                        className="h-[180px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[220px]"
                        loading="lazy"
                      />
                    </div>
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
                    Drunk Coffee Roasters grew through real brewing routines, coffee events, and a constant pursuit of better cups. Based in Johor, we roast in small batches with a stronger focus on clarity, balance, and a cup that feels considered.
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
                    Coffee roasted with balance, clarity, and a stronger sense of identity — for home brewers, cafés, and everyday drinkers who want something better.
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
          <div className="pointer-events-none fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/12 bg-[#efe8db] px-4 py-2 text-sm font-medium shadow-[0_20px_60px_rgba(0,0,0,0.35)]" style={LIGHT_BUTTON_STYLE}>
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}
