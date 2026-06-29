import { ArrowLeft, ChevronLeft, ChevronRight, Instagram, Minus, Plus, ShoppingCart, X } from "lucide-react";
import BlurImage from "../components/BlurImage";
import Toast from "../components/Toast";
import { Lightbox, useLightbox } from "../components/Lightbox";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { trackAddToCart, trackProductView, trackWhatsappClick } from "../lib/analytics";
import {
  INSTAGRAM_URL,
  appendImageParams,
  buildCartWhatsAppUrl,
  buildGeneralWhatsAppUrl,
  buildSingleOrderUrl,
  cx,
  formatBeanPrice,
  formatPackageLabel,
  formatPackagePrice,
  getBestForLabels,
  getBuyThisIf,
  getConfidenceLevel,
  getDisplayBadges,
  getDisplayCategory,
  getEspressoUseDescription,
  getSimilarBeans,
  getSkipThisIf,
  getTasteStyles,
  isPackageAvailable,
  safeArray,
  selectBeanVariant,
  useBeans,
  usePersistentCart,
} from "../lib/coffeeStore";
const AMBER = "#c8922a";
const P = "inline-flex items-center gap-2 rounded-full bg-[#c8922a] px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#0e0c09] transition hover:bg-[#d9a23a] active:scale-[0.97]";
const G = "inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-white/55 transition hover:border-white/24 hover:text-white active:scale-[0.97]";
function useInView(t = 0.06) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { threshold: t });
    io.observe(el); return () => io.disconnect();
  }, [t]);
  return [ref, v];
}
function Fade({ children, delay = 0, className = "" }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref}
      style={{ transitionDelay: v ? `${delay}ms` : "0ms", transform: v ? "none" : "translateY(14px)" }}
      className={cx("transition-all duration-600 ease-out", v ? "opacity-100" : "opacity-0", className)}>
      {children}
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="h-px w-4 bg-[#c8922a]/50" />
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#c8922a]/70">{children}</span>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/[0.05] py-3.5">
      <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-white/36">{label}</span>
      <span className="text-right text-[14px] leading-relaxed text-white/70">{value}</span>
    </div>
  );
}
function NotePill({ note }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-white/62">
      <span className="h-1 w-1 shrink-0 rounded-full bg-[#c8922a]/60" />
      {note}
    </span>
  );
}
function CartDrawer({ open, onClose, cart, cartCount, cartTotal, onDecrease, onIncrease, onRemove, onClear }) {
  if (!open) return null;
  if (typeof document === "undefined") return null;
  const url = buildCartWhatsAppUrl(cart);
  return createPortal((
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/72 backdrop-blur-[8px]" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="relative z-[80] flex h-dvh max-h-dvh w-full max-w-md flex-col overflow-hidden border-l border-white/[0.07]"
        style={{ background: "#100e0b" }}>
        <div className="shrink-0 flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <p className="text-[17px] font-semibold tracking-[-0.02em] text-white">Your cart</p>
            <p className="mt-0.5 text-[11px] text-white/30">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white">
            <X size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {cart.length === 0
            ? <p className="mt-10 text-center text-[13px] text-white/34">Cart is empty.</p>
            : cart.map(item => (
                <div key={item.id} className="rounded-[14px] border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-white">{item.name}</p>
                      <p className="mt-0.5 text-[11px] text-white/30">{getDisplayCategory(item)} / {[item.size, item.packageLabel].filter(Boolean).join(" ")}</p>
                    </div>
                    <button type="button" onClick={() => onRemove(item.id)}
                      className="shrink-0 text-white/20 transition hover:text-white/60"><X size={13} /></button>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-white/10 px-1 py-0.5">
                      <button type="button" onClick={() => onDecrease(item.id)}
                        className="flex h-6 w-6 items-center justify-center text-white/50 transition hover:text-white">
                        <Minus size={11} />
                      </button>
                      <span className="min-w-[20px] text-center text-[13px] font-medium text-white">{item.quantity}</span>
                      <button type="button" onClick={() => onIncrease(item.id)}
                        className="flex h-6 w-6 items-center justify-center text-white/50 transition hover:text-white">
                        <Plus size={11} />
                      </button>
                    </div>
                    <p className="text-[14px] font-semibold text-white">{formatPackagePrice(item, item.quantity)}</p>
                  </div>
                </div>
              ))
          }
        </div>

        <div className="shrink-0 border-t border-white/[0.07] px-5 pt-4"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/32">Total</p>
              <p className="mt-0.5 text-[32px] font-bold tracking-[-0.045em] text-white">RM {cartTotal}</p>
            </div>
            {cart.length > 0 &&
              <button type="button" onClick={onClear}
                className="pb-1 text-[11px] text-white/22 transition hover:text-white/50">Clear all</button>}
          </div>
          <div className="flex flex-col gap-2">
            <a href={url} target="_blank" rel="noreferrer" className={cx(P, "w-full justify-center")}>
              Send order via WhatsApp
            </a>
            <button type="button" onClick={onClose} className={cx(G, "w-full justify-center")}>Keep browsing</button>
          </div>
        </div>
      </aside>
    </div>
  ), document.body);
}
function RelatedRow({ bean, onAdd }) {
  const img = bean?.image ? appendImageParams(bean.image, { w: 300, h: 300, fit: "pad", fm: "webp", q: 76 }) : "";
  const notes = safeArray(bean.notes).slice(0, 2).join(" / ");
  const badges = getDisplayBadges(bean, 2);
  return (
    <div className="group flex items-center gap-4 rounded-[13px] border border-white/[0.05] px-4 py-3 transition hover:border-white/[0.10] hover:bg-[#1c1814]">
      <Link to={`/coffee/${bean.slug}`}
        className="shrink-0 overflow-hidden rounded-[8px] bg-[#130f0a]">
        <div className="h-[52px] w-[52px]">
          {img
            ? <img src={img} alt={bean.name}
                className="h-full w-full object-contain p-1.5 transition duration-400 group-hover:scale-[1.07]" />
            : <div className="flex h-full items-center justify-center text-[9px] text-white/14">-</div>
          }
        </div>
      </Link>
      <Link to={`/coffee/${bean.slug}`} className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">{bean.name}</p>
        {notes && <p className="mt-0.5 truncate text-[12px] text-white/38">{notes}</p>}
        {badges.length > 0 && <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#d9ad59]/75">{badges.join(" / ")}</p>}
      </Link>
      <p className="shrink-0 mr-2 text-[14px] font-semibold text-white/70">{formatBeanPrice(bean)}</p>
      <button type="button" onClick={() => onAdd(bean)}
        className="shrink-0 rounded-full bg-[#c8922a]/10 border border-[#c8922a]/30 px-3.5 py-1.5 text-[11px] font-semibold text-[#c8922a] transition hover:bg-[#c8922a] hover:text-[#0e0c09]">
        + Add
      </button>
    </div>
  );
}
function getRecommendedBrew(bean) {
  if (!bean) return "";
  return getEspressoUseDescription(bean)
    ? "See espresso use note"
    : "Pour Over / French Press / Black Coffee";
}
function getWhoItsFor(bean) {
  if (!bean) return "";
  const notes = safeArray(bean.notes).join(", ").toLowerCase();
  if (getEspressoUseDescription(bean).includes("Recommended")) return "Best for a reliable everyday cup, especially espresso or milk-based drinks.";
  if (notes.includes("floral")) return "Best for lighter, tea-like cups with fragrance and lift.";
  if (["mango", "berry", "apple", "fruit", "orange"].some(n => notes.includes(n)))
    return "Best for brighter, fruit-forward coffees with expressive character.";
  return "Best for a clean, balanced cup that is easy to enjoy and repeat.";
}
// PAGE
export default function ProductDetail() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { beans, loading, error } = useBeans();
  const { cart, cartCount, cartTotal, addToCart, decreaseCartItem, increaseCartItem, removeCartItem, clearCart } = usePersistentCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [toast,    setToast]    = useState("");
  const [qty,      setQty]      = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  const bean          = useMemo(() => beans.find(b => b.slug === slug), [beans, slug]);
  const variants      = bean?.variants || [];
  const selectedVariant = variants.find((variant) => variant.size === selectedSize) || variants[0];
  const selectedBean  = bean ? selectBeanVariant(bean, selectedVariant) : null;
  const selectedPackageAvailable = isPackageAvailable(selectedBean);
  const currentIndex  = useMemo(() => beans.findIndex(b => b.slug === slug), [beans, slug]);
  const previousBean  = currentIndex > 0 ? beans[currentIndex - 1] : null;
  const nextBean      = currentIndex >= 0 && currentIndex < beans.length - 1 ? beans[currentIndex + 1] : null;
  const relatedBeans  = useMemo(() => getSimilarBeans(bean, beans, 3), [beans, bean]);

  const detailImage       = bean?.image       ? appendImageParams(bean.image,       { w: 1800, h: 1800, fit: "pad", fm: "webp", q: 86 }) : "";
  const detailFlavorImage = bean?.flavorImage ? appendImageParams(bean.flavorImage, { w: 1600, h: 1600, fit: "pad", fm: "webp", q: 86 }) : "";
  const notes             = safeArray(bean?.notes);
  const bestForLabels     = bean ? getBestForLabels(bean) : [];
  const tasteStyles       = bean ? getTasteStyles(bean) : [];
  const confidenceLevel   = bean ? getConfidenceLevel(bean) : "";
  const buyThisIf         = bean ? getBuyThisIf(bean) : "";
  const skipThisIf        = bean ? getSkipThisIf(bean) : "";
  const espressoUse       = bean ? getEspressoUseDescription(bean) : "";
  const lightboxImages = detailImage ? [{ src: detailImage, alt: bean?.name || "" }] : [];
  const { open: openLightbox, lightboxProps } = useLightbox(lightboxImages);

  const notesForSeo = notes.join(" / ");
  const productDescription = bean
    ? `Shop ${bean.name} from Drunk Coffee Roasters. ${bean.tagline ? `${bean.tagline}. ` : ""}${notesForSeo ? `Notes: ${notesForSeo}. ` : ""}Fresh-roasted specialty coffee beans in Malaysia.`
    : "Specialty coffee from Drunk Coffee Roasters.";

  useEffect(() => { if (bean) trackProductView(bean); }, [bean]);
  useEffect(() => { setSelectedSize(variants[0]?.size || ""); }, [bean?.id]);
  useEffect(() => { document.body.style.overflow = cartOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [cartOpen]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);
  // reset qty on slug change
  useEffect(() => { setQty(1); }, [slug]);

  function handleAdd(target = bean, q = 1) {
    if (!target) return;
    if (!isPackageAvailable(target)) {
      setToast("Please ask us for availability on WhatsApp");
      return;
    }
    trackAddToCart(target, "product_detail");
    for (let i = 0; i < q; i++) addToCart(target);
    setCartOpen(true);
    setToast(`${target.name} added`);
  }
  if (!loading && !bean) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ background: "#0e0c09" }}>
        <p className="mb-4 text-[10px] uppercase tracking-[0.24em] text-[#c8922a]/70">Not found</p>
        <h1 className="text-[32px] font-bold tracking-[-0.04em] text-white">Coffee not found</h1>
        <p className="mt-3 max-w-xs text-[13px] text-white/40">This coffee may have been removed or the link has changed.</p>
        <Link to="/" className={cx(P, "mt-8")}>Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={bean ? `${bean.name} - Drunk Coffee Roasters` : "Coffee Detail"}
        description={productDescription}
        url={bean ? `/coffee/${bean.slug}` : "/"}
        image={detailImage || undefined}
        imageAlt={bean ? `${bean.name} -Drunk Coffee Roasters` : undefined}
        type="product"
        jsonLd={bean ? {
          "@context": "https://schema.org", "@type": "Product",
          name: bean.name, description: productDescription,
          brand: { "@type": "Brand", name: "Drunk Coffee Roasters" },
          category: bean.category,
          url: `https://drunkcoffeeroasters.com/coffee/${bean.slug}`,
          image: detailImage || undefined,
          offers: selectedPackageAvailable
            ? { "@type": "Offer", priceCurrency: "MYR", price: String(selectedBean.price), availability: "https://schema.org/InStock" }
            : { "@type": "Offer", priceCurrency: "MYR", availability: "https://schema.org/LimitedAvailability" }
        } : null}
      />

      <div className="min-h-screen" style={{ background: "#0e0c09" }}>


        <header className="sticky top-0 z-50 border-b border-white/[0.07]"
          style={{ background: "rgba(14,12,9,0.9)", backdropFilter: "blur(20px)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate(-1)} aria-label="Back"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white">
                <ArrowLeft size={15} />
              </button>
              <Link to="/"><img src="/logo.png" alt="Drunk Coffee Roasters" className="h-11 object-contain" /></Link>
            </div>
            <div className="flex items-center gap-2">
              <a href={buildGeneralWhatsAppUrl()} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("product_detail_header", bean?.slug || "")}
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 transition hover:border-white/20 md:flex">
                <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" className="h-3.5 w-3.5 opacity-38 transition hover:opacity-80" />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/38 transition hover:text-white md:flex">
                <Instagram size={15} />
              </a>
              <button type="button" onClick={() => setCartOpen(true)} aria-label="Cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/38 transition hover:text-white">
                <ShoppingCart size={15} />
                {cartCount > 0 &&
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c8922a] text-[9px] font-bold text-[#0e0c09]">
                    {cartCount}
                  </span>}
              </button>
            </div>
          </div>
        </header>


        <main className="mx-auto max-w-6xl px-4 pb-32 pt-8 md:px-6 md:pb-16 md:pt-14">
          {error && <p className="mb-6 text-[12px] text-amber-300">{error}</p>}

          {loading ? (
            /* skeleton */
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
              <div className="aspect-square animate-pulse rounded-[24px] bg-white/[0.04]" />
              <div className="space-y-5 pt-2">
                {[60, 220, 140, 180, 100, 160].map(w =>
                  <div key={w} style={{ width: w }} className="h-3.5 animate-pulse rounded-full bg-white/[0.05]" />)}
              </div>
            </div>
          ) : bean ? (
            <>

              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-10">


                <Fade className="lg:sticky lg:top-[68px]">
                  <div className="group relative overflow-hidden rounded-[24px] border border-white/[0.07]">
                    {detailImage ? (
                      <button
                        type="button"
                        onClick={() => openLightbox(0)}
                        className="block w-full text-left"
                        aria-label="View full image"
                      >
                        <BlurImage
                          src={detailImage}
                          alt={bean.name}
                          aspect="square"
                          priority
                          className="h-full w-full object-contain p-10 md:p-14 transition duration-700 group-hover:scale-[1.03]"
                        />
                        {/* zoom hint */}
                        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/14 bg-black/50 px-3 py-1.5 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
                          <svg viewBox="0 0 16 16" className="h-3 w-3 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5l3 3"/><path d="M6.5 4.5v4M4.5 6.5h4"/>
                          </svg>
                          <span className="text-[10px] uppercase tracking-[0.12em] text-white/50">Zoom</span>
                        </div>
                      </button>
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center gap-3 bg-[#130f0a]">
                        <div className="h-10 w-10 rounded-full border border-white/10" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/18">Photo coming soon</span>
                      </div>
                    )}
                  </div>

                  {/* Prev / Next beneath image */}
                  {(previousBean || nextBean) && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {previousBean
                        ? <Link to={`/coffee/${previousBean.slug}`}
                            className="group flex items-center gap-2 rounded-[12px] border border-white/[0.06] px-4 py-3 transition hover:border-white/[0.12] hover:bg-[#1c1814]">
                            <ChevronLeft size={14} className="shrink-0 text-white/28 transition group-hover:text-white" />
                            <div className="min-w-0">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-white/34">Prev</p>
                              <p className="truncate text-[13px] font-semibold text-white/75 group-hover:text-white">{previousBean.name}</p>
                            </div>
                          </Link>
                        : <div />
                      }
                      {nextBean &&
                        <Link to={`/coffee/${nextBean.slug}`}
                          className="group flex items-center justify-end gap-2 rounded-[12px] border border-white/[0.06] px-4 py-3 text-right transition hover:border-white/[0.12] hover:bg-[#1c1814]">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.14em] text-white/34">Next</p>
                            <p className="truncate text-[13px] font-semibold text-white/75 group-hover:text-white">{nextBean.name}</p>
                          </div>
                          <ChevronRight size={14} className="shrink-0 text-white/28 transition group-hover:text-white" />
                        </Link>
                      }
                    </div>
                  )}
                </Fade>


                <div className="flex flex-col gap-0">
                  <Fade>
                    {/* breadcrumb */}
                    {bean.collection && <Eyebrow>{bean.collection}</Eyebrow>}
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/36">{getDisplayCategory(bean)}</p>

                    {/* name */}
                    <h1 className="mt-2 text-[clamp(34px,4.5vw,56px)] font-bold leading-[0.87] tracking-[-0.05em] text-white">
                      {bean.name}
                    </h1>

                    {/* tagline */}
                    {bean.tagline &&
                      <p className="mt-4 text-[16px] leading-[1.85] text-white/55">{bean.tagline}</p>}


                    {notes.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {notes.map(n => <NotePill key={n} note={n} />)}
                      </div>
                    )}

                    <div className="mt-5 rounded-[18px] border border-white/[0.07] bg-white/[0.025] p-4 md:p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#c8922a]/70">Buyer guidance</p>
                      <div className="mt-4 grid gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Best for</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {bestForLabels.map((label) => <NotePill key={label} note={label} />)}
                          </div>
                        </div>
                        {espressoUse && (
                          <div className="rounded-[14px] border border-white/[0.05] bg-black/10 p-4">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Espresso use</p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-white/66">{espressoUse}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Taste style</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tasteStyles.map((label) => <NotePill key={label} note={label} />)}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[14px] border border-white/[0.05] bg-black/10 p-4">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Buy this if</p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-white/66">{buyThisIf}</p>
                          </div>
                          <div className="rounded-[14px] border border-white/[0.05] bg-black/10 p-4">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Skip this if</p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-white/56">{skipThisIf}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-white/32">Confidence level</p>
                          <span className="rounded-full border border-[#c8922a]/25 bg-[#c8922a]/10 px-3.5 py-1.5 text-[12px] font-semibold text-[#d9ad59]">{confidenceLevel}</span>
                        </div>
                      </div>
                    </div>
                  </Fade>

                  {/* description */}
                  {bean.description && (
                    <Fade delay={60} className="mt-5 border-t border-white/[0.06] pt-5">
                      <p className="text-[15px] leading-[1.9] text-white/58">{bean.description}</p>
                    </Fade>
                  )}

                  {/* detail rows */}
                  <Fade delay={80} className="mt-5 border-t border-white/[0.06]">
                    <DetailRow label="Origin"    value={bean.origin}          />
                    <DetailRow label="Altitude"  value={bean.altitude}        />
                    <DetailRow label="Process"   value={bean.process}         />
                    <DetailRow label="Roast"     value={bean.roast}           />
                    <DetailRow label="Brew"      value={getRecommendedBrew(bean)} />
                    <DetailRow label="Espresso use" value={espressoUse} />
                    <DetailRow label="Best for"  value={getWhoItsFor(bean)}   />
                    {bean.variety && <DetailRow label="Variety" value={bean.variety} />}
                    {variants.length === 1 && <DetailRow label="Size" value={selectedBean?.size} />}
                  </Fade>


                  <Fade delay={100} className="mt-7 border-t border-white/[0.06] pt-6">
                    {variants.length > 1 && (
                      <fieldset className="mb-6">
                        <legend className="text-[11px] uppercase tracking-[0.16em] text-white/32">{bean.category === "Bundle" ? "Choose your set" : "Choose your size"}</legend>
                        {bean.category === "Bundle" ? (
                          <div className="mt-2 space-y-1 text-[12px] leading-relaxed text-white/38">
                            <p>3 x 100g Tasting Set - best for exploring all three coffees.</p>
                            <p>3 x 200g Full Set - best for filter coffee lovers who want the full experience.</p>
                          </div>
                        ) : (
                          <div className="mt-2 space-y-1 text-[12px] leading-relaxed text-white/38">
                            <p>100g Trial Pack - best for trying something new.</p>
                            <p>200g Daily Bag - best for home brewing.</p>
                            <p>1kg Value Bag - best value for daily drinkers, offices, and espresso users.</p>
                          </div>
                        )}
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {variants.map((variant) => {
                            const active = selectedVariant?.size === variant.size;
                            return (
                              <button key={variant.size} type="button" aria-pressed={active}
                                onClick={() => setSelectedSize(variant.size)}
                                className={cx("rounded-[14px] border px-4 py-3 text-left transition", active ? "border-[#c8922a] bg-[#c8922a]/10" : "border-white/10 bg-white/[0.025] hover:border-white/24")}>
                                <span className="block text-[14px] font-semibold text-white">{formatPackageLabel(variant)}</span>
                                <span className={cx("mt-0.5 block text-[12px]", active ? "text-[#e0b766]" : "text-white/38")}>{formatPackagePrice(variant)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/32">Price</p>
                        <p className="mt-1 text-[36px] font-bold tracking-[-0.05em] text-white">{formatPackagePrice(selectedBean)}</p>
                      </div>
                      {/* qty stepper desktop */}
                      {selectedPackageAvailable && <div className="hidden items-center gap-1 rounded-full border border-white/10 px-1 py-1 sm:flex">
                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:text-white">
                          <Minus size={12} />
                        </button>
                        <span className="min-w-[28px] text-center text-[14px] font-semibold text-white">{qty}</span>
                        <button type="button" onClick={() => setQty(q => q + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:text-white">
                          <Plus size={12} />
                        </button>
                      </div>}
                    </div>
                    <div className="hidden flex-col gap-2.5 sm:flex">
                      <a href={buildSingleOrderUrl(selectedBean, qty)} target="_blank" rel="noreferrer"
                        onClick={() => trackWhatsappClick("product_detail_order", selectedBean?.slug || bean.slug)}
                        className={cx(P, "w-full justify-center py-3.5 text-[13px]")}>
                        <img src="https://cdn.simpleicons.org/whatsapp/0e0c09" alt="" className="h-3.5 w-3.5" />
                        {selectedPackageAvailable ? `Order on WhatsApp - ${formatPackagePrice(selectedBean, qty)}` : "Ask for availability"}
                      </a>
                      <button type="button" onClick={() => handleAdd(selectedBean, qty)}
                        disabled={!selectedPackageAvailable}
                        className={cx(G, "w-full justify-center")}>
                        <ShoppingCart size={13} />
                        {selectedPackageAvailable ? `Add ${qty > 1 ? `${qty}x ` : ""}to cart ${formatPackagePrice(selectedBean, qty)}` : "Cart available after confirmation"}
                      </button>
                    </div>
                  </Fade>

                  {/* freshness note */}
                  <Fade delay={120} className="mt-4">
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-2 text-[12px] text-white/34">
                        <span className="h-1 w-1 rounded-full bg-[#c8922a]/50" />
                        Roasted to order - dispatched within 48 hours
                      </p>
                      <p className="text-[12px] leading-relaxed text-white/30">
                        Roasted by Drunk Coffee Roasters, Segamat. Awarded 3rd Place in HB Best Batch Roaster Contest 2026.
                      </p>
                    </div>
                  </Fade>
                </div>
              </div>


              {detailFlavorImage && (
                <Fade className="mt-6">
                  <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#17120d] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
                    <div className="flex items-end justify-between gap-4 px-4 pb-3 pt-4 md:px-5">
                      <Eyebrow>Tastes like</Eyebrow>
                      <p className="pb-3 text-right text-[10px] uppercase tracking-[0.16em] text-white/30">Flavor visual</p>
                    </div>
                    <div className="overflow-hidden rounded-[17px] bg-[#eadfce]">
                      <img src={detailFlavorImage} alt={`${bean.name} flavour`}
                        className="aspect-[4/3] w-full object-cover md:aspect-[16/10]" />
                    </div>
                  </div>
                </Fade>
              )}


              {relatedBeans.length > 0 && (
                <Fade className="mt-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-4 bg-[#c8922a]/40" />
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/26">If you like this style, you may also like</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {relatedBeans.map(item => <RelatedRow key={item.id} bean={item} onAdd={handleAdd} />)}
                  </div>
                </Fade>
              )}
            </>
          ) : null}
        </main>


        {bean && (
          <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/[0.07] px-4 py-3 sm:hidden"
            style={{ background: "rgba(14,12,9,0.97)", backdropFilter: "blur(20px)", paddingBottom: "max(0.75rem,env(safe-area-inset-bottom))" }}>
            <div className="flex items-center gap-2.5">
              {/* qty stepper mobile */}
              {selectedPackageAvailable && <div className="flex items-center gap-0.5 rounded-full border border-white/10 px-1 py-1">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center text-white/40 transition hover:text-white">
                  <Minus size={11} />
                </button>
                <span className="min-w-[22px] text-center text-[13px] font-semibold text-white">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)}
                  className="flex h-8 w-8 items-center justify-center text-white/40 transition hover:text-white">
                  <Plus size={11} />
                </button>
              </div>}
              <a href={buildSingleOrderUrl(selectedBean, qty)} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("product_detail_sticky", selectedBean?.slug || bean.slug)}
                className="flex flex-1 items-center justify-between rounded-full bg-[#c8922a] px-5 py-3.5">
                <span className="text-[13px] font-semibold text-[#0e0c09]">{selectedPackageAvailable ? "Order on WhatsApp" : "Ask for availability"}</span>
                <span className="ml-3 shrink-0 text-[13px] font-bold text-[#0e0c09]/70">
                  {selectedPackageAvailable ? formatPackagePrice(selectedBean, qty) : selectedBean?.size}
                </span>
              </a>
            </div>
          </div>
        )}

        {/* Lightbox */}
        <Lightbox {...lightboxProps} />

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
          cart={cart} cartCount={cartCount} cartTotal={cartTotal}
          onDecrease={decreaseCartItem} onIncrease={increaseCartItem}
          onRemove={removeCartItem} onClear={clearCart} />

        <Toast message={toast} />
      </div>
    </>
  );
}
