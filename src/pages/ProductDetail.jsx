import { ArrowLeft, ChevronLeft, ChevronRight, Instagram, Minus, Plus, ShoppingCart, X } from "lucide-react";
import BlurImage from "../components/BlurImage";
import Toast from "../components/Toast";
import { Lightbox, useLightbox } from "../components/Lightbox";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Seo from "../components/Seo";
import { trackAddToCart, trackProductView, trackWhatsappClick } from "../lib/analytics";
import {
  INSTAGRAM_URL,
  appendImageParams,
  buildBundleOrderUrl,
  buildCartWhatsAppUrl,
  buildGeneralWhatsAppUrl,
  buildSingleOrderUrl,
  cx,
  safeArray,
  useBeans,
  usePersistentCart,
} from "../lib/coffeeStore";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const AMBER = "#c8922a";
const P = "inline-flex items-center gap-2 rounded-full bg-[#c8922a] px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#0e0c09] transition hover:bg-[#d9a23a] active:scale-[0.97]";
const G = "inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-white/55 transition hover:border-white/24 hover:text-white active:scale-[0.97]";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Note pill with amber dot ─────────────────────────────────────────────────
function NotePill({ note }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-white/62">
      <span className="h-1 w-1 shrink-0 rounded-full bg-[#c8922a]/60" />
      {note}
    </span>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, cart, cartCount, cartTotal, onDecrease, onIncrease, onRemove, onClear }) {
  if (!open) return null;
  const url = buildCartWhatsAppUrl(cart);
  return (
    <div className="fixed inset-0 z-[70] flex justify-end" style={{ position: "sticky" }}>
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/72 backdrop-blur-[8px]" />
      <aside
        className="relative flex w-full max-w-[340px] flex-col border-l border-white/[0.07]"
        style={{ background: "#100e0b", height: "100dvh" }}>
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
                      <p className="mt-0.5 text-[11px] text-white/30">{item.category} · {item.size}</p>
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
                    <p className="text-[14px] font-semibold text-white">RM {Number(item.price || 0) * item.quantity}</p>
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
  );
}

// ─── Related coffee row ────────────────────────────────────────────────────────
function RelatedRow({ bean, onAdd }) {
  const img = bean?.image ? appendImageParams(bean.image, { w: 300, h: 300, fit: "pad", fm: "webp", q: 76 }) : "";
  const notes = safeArray(bean.notes).slice(0, 2).join(" · ");
  return (
    <div className="group flex items-center gap-4 rounded-[13px] border border-white/[0.05] px-4 py-3 transition hover:border-white/[0.10] hover:bg-[#1c1814]">
      <Link to={`/coffee/${bean.slug}`}
        className="shrink-0 overflow-hidden rounded-[8px] bg-[#130f0a]">
        <div className="h-[52px] w-[52px]">
          {img
            ? <img src={img} alt={bean.name}
                className="h-full w-full object-contain p-1.5 transition duration-400 group-hover:scale-[1.07]" />
            : <div className="flex h-full items-center justify-center text-[9px] text-white/14">—</div>
          }
        </div>
      </Link>
      <Link to={`/coffee/${bean.slug}`} className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-white">{bean.name}</p>
        {notes && <p className="mt-0.5 truncate text-[12px] text-white/38">{notes}</p>}
      </Link>
      <p className="shrink-0 mr-2 text-[14px] font-semibold text-white/70">RM {bean.price}</p>
      <button type="button" onClick={() => onAdd(bean)}
        className="shrink-0 rounded-full bg-[#c8922a]/10 border border-[#c8922a]/30 px-3.5 py-1.5 text-[11px] font-semibold text-[#c8922a] transition hover:bg-[#c8922a] hover:text-[#0e0c09]">
        + Add
      </button>
    </div>
  );
}

// ─── Utility fns ──────────────────────────────────────────────────────────────
function getRecommendedBrew(bean) {
  if (!bean) return "";
  return bean.category === "Espresso" ? "Espresso · Milk drinks · Black" : "V60 · Orea · AeroPress";
}
function getWhoItsFor(bean) {
  if (!bean) return "";
  const notes = safeArray(bean.notes).join(", ").toLowerCase();
  if (bean.category === "Espresso") return "Best for a reliable everyday cup — especially espresso or milk-based drinks.";
  if (notes.includes("floral")) return "Best for lighter, tea-like cups with fragrance and lift.";
  if (["mango", "berry", "apple", "fruit", "orange"].some(n => notes.includes(n)))
    return "Best for brighter, fruit-forward coffees with expressive character.";
  return "Best for a clean, balanced cup that is easy to enjoy and repeat.";
}
function formatBrewGuide(text) {
  if (!text) return [];
  return String(text).split("\n").map(l => l.trim()).filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProductDetail() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const { beans, loading, error } = useBeans();
  const { cart, cartCount, cartTotal, addToCart, decreaseCartItem, increaseCartItem, removeCartItem, clearCart } = usePersistentCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [toast,    setToast]    = useState("");
  const [qty,      setQty]      = useState(1);

  const bean          = useMemo(() => beans.find(b => b.slug === slug), [beans, slug]);
  const currentIndex  = useMemo(() => beans.findIndex(b => b.slug === slug), [beans, slug]);
  const previousBean  = currentIndex > 0 ? beans[currentIndex - 1] : null;
  const nextBean      = currentIndex >= 0 && currentIndex < beans.length - 1 ? beans[currentIndex + 1] : null;
  const relatedBeans  = useMemo(() => !bean ? [] : beans.filter(b => b.slug !== bean.slug && b.category === bean.category).slice(0, 3), [beans, bean]);
  const monteblancoBeans = useMemo(() =>
    beans.filter(b => [b.name, b.origin, b.collection].filter(Boolean).some(v => String(v).toLowerCase().includes("monteblanco")))
  , [beans]);
  const isMonteblancoBean = useMemo(() =>
    !bean ? false : [bean.name, bean.origin, bean.collection].filter(Boolean).some(v => String(v).toLowerCase().includes("monteblanco"))
  , [bean]);
  const monteblancoBundleUrl = useMemo(() =>
    buildBundleOrderUrl(monteblancoBeans.slice(0, 3), "Monteblanco Series")
  , [monteblancoBeans]);

  const detailImage       = bean?.image       ? appendImageParams(bean.image,       { w: 1800, h: 1800, fit: "pad", fm: "webp", q: 86 }) : "";
  const detailFlavorImage = bean?.flavorImage ? appendImageParams(bean.flavorImage, { w: 1600, h: 1600, fit: "pad", fm: "webp", q: 86 }) : "";
  const brewGuideLines    = formatBrewGuide(bean?.brewguide);
  const notes             = safeArray(bean?.notes);

  // Lightbox — must come after detailImage is declared
  const lightboxImages = detailImage ? [{ src: detailImage, alt: bean?.name || "" }] : [];
  const { open: openLightbox, lightboxProps } = useLightbox(lightboxImages);

  const notesForSeo = notes.join(", ");
  const productDescription = bean
    ? `Shop ${bean.name} from Drunk Coffee Roasters. ${bean.tagline ? `${bean.tagline}. ` : ""}${notesForSeo ? `Notes: ${notesForSeo}. ` : ""}Freshly roasted in Malaysia.`
    : "Specialty coffee from Drunk Coffee Roasters.";

  useEffect(() => { if (bean) trackProductView(bean); }, [bean]);
  useEffect(() => { document.body.style.overflow = cartOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [cartOpen]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);
  // reset qty on slug change
  useEffect(() => { setQty(1); }, [slug]);

  function handleAdd(target = bean, q = 1) {
    if (!target) return;
    trackAddToCart(target, "product_detail");
    for (let i = 0; i < q; i++) addToCart(target);
    setCartOpen(true);
    setToast(`${target.name} added`);
  }
  function handleBundle() {
    const picks = monteblancoBeans.slice(0, 3);
    if (!picks.length) return;
    picks.forEach(b => addToCart(b));
    setCartOpen(true);
    setToast("Bundle added");
  }

  // ── Not found ──
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
        title={bean ? `${bean.name} | Drunk Coffee Roasters` : "Coffee Detail"}
        description={productDescription}
        url={bean ? `/coffee/${bean.slug}` : "/"}
        image={detailImage || undefined}
        imageAlt={bean ? `${bean.name} — Drunk Coffee Roasters` : undefined}
        type="product"
        jsonLd={bean ? {
          "@context": "https://schema.org", "@type": "Product",
          name: bean.name, description: productDescription,
          brand: { "@type": "Brand", name: "Drunk Coffee Roasters" },
          category: bean.category,
          url: `https://drunkcoffeeroasters.com/coffee/${bean.slug}`,
          image: detailImage || undefined,
          offers: { "@type": "Offer", priceCurrency: "MYR", price: String(bean.price), availability: "https://schema.org/InStock" }
        } : null}
      />

      <div className="min-h-screen" style={{ background: "#0e0c09" }}>

        {/* ── HEADER ── */}
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

        {/* ── MAIN ── */}
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 md:px-6 md:pb-16 md:pt-14">
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
              {/* ════════════════════════════════════════
                  PRODUCT HERO — sticky image left
              ════════════════════════════════════════ */}
              <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">

                {/* ── Image panel — sticky on desktop, click to lightbox ── */}
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

                {/* ── Info panel — scrolls ── */}
                <div className="flex flex-col gap-0">
                  <Fade>
                    {/* breadcrumb */}
                    {bean.collection && <Eyebrow>{bean.collection}</Eyebrow>}
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/36">{bean.category}</p>

                    {/* name */}
                    <h1 className="mt-2 text-[clamp(34px,4.5vw,56px)] font-bold leading-[0.87] tracking-[-0.05em] text-white">
                      {bean.name}
                    </h1>

                    {/* tagline */}
                    {bean.tagline &&
                      <p className="mt-4 text-[16px] leading-[1.85] text-white/55">{bean.tagline}</p>}

                    {/* notes — visual pills */}
                    {notes.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {notes.map(n => <NotePill key={n} note={n} />)}
                      </div>
                    )}
                  </Fade>

                  {/* description */}
                  {bean.description && (
                    <Fade delay={60} className="mt-5 border-t border-white/[0.06] pt-5">
                      <p className="text-[14px] leading-[1.95] text-white/52">{bean.description}</p>
                    </Fade>
                  )}

                  {/* detail rows */}
                  <Fade delay={80} className="mt-5 border-t border-white/[0.06]">
                    <DetailRow label="Origin"    value={bean.origin}          />
                    <DetailRow label="Process"   value={bean.process}         />
                    <DetailRow label="Roast"     value={bean.roast}           />
                    <DetailRow label="Brew"      value={getRecommendedBrew(bean)} />
                    <DetailRow label="Best for"  value={getWhoItsFor(bean)}   />
                    {bean.variety && <DetailRow label="Variety" value={bean.variety} />}
                    <DetailRow label="Size"      value={bean.size}            />
                  </Fade>

                  {/* ── Price + Qty + CTA (desktop) ── */}
                  <Fade delay={100} className="mt-7 border-t border-white/[0.06] pt-6">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-white/32">Price</p>
                        <p className="mt-1 text-[36px] font-bold tracking-[-0.05em] text-white">RM {bean.price}</p>
                      </div>
                      {/* qty stepper desktop */}
                      <div className="hidden items-center gap-1 rounded-full border border-white/10 px-1 py-1 sm:flex">
                        <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:text-white">
                          <Minus size={12} />
                        </button>
                        <span className="min-w-[28px] text-center text-[14px] font-semibold text-white">{qty}</span>
                        <button type="button" onClick={() => setQty(q => q + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition hover:text-white">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="hidden flex-col gap-2.5 sm:flex">
                      <a href={buildSingleOrderUrl(bean)} target="_blank" rel="noreferrer"
                        onClick={() => trackWhatsappClick("product_detail_order", bean.slug)}
                        className={cx(P, "w-full justify-center py-3.5 text-[13px]")}>
                        <img src="https://cdn.simpleicons.org/whatsapp/0e0c09" alt="" className="h-3.5 w-3.5" />
                        Order on WhatsApp · RM {Number(bean.price) * qty}
                      </a>
                      <button type="button" onClick={() => handleAdd(bean, qty)}
                        className={cx(G, "w-full justify-center")}>
                        <ShoppingCart size={13} />
                        Add {qty > 1 ? `${qty}× ` : ""}to cart
                      </button>
                    </div>
                  </Fade>

                  {/* freshness note */}
                  <Fade delay={120} className="mt-4">
                    <p className="flex items-center gap-2 text-[12px] text-white/34">
                      <span className="h-1 w-1 rounded-full bg-[#c8922a]/50" />
                      Roasted to order · dispatched within 48 hours
                    </p>
                  </Fade>
                </div>
              </div>

              {/* ════════════════════════════════════════
                  BREW GUIDE
              ════════════════════════════════════════ */}
              {brewGuideLines.length > 0 && (
                <Fade className="mt-10">
                  <div className="rounded-[20px] border border-white/[0.07] bg-[#1c1814] p-6 md:p-8">
                    <Eyebrow>Brew guide</Eyebrow>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {brewGuideLines.map((line, i) => (
                        <div key={i} className="rounded-[12px] border border-white/[0.05] bg-white/[0.025] p-4">
                          <p className="text-[14px] leading-[1.8] text-white/62">{line}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Fade>
              )}

              {/* ════════════════════════════════════════
                  FLAVOR IMAGE
              ════════════════════════════════════════ */}
              {detailFlavorImage && (
                <Fade className="mt-6">
                  <div className="overflow-hidden rounded-[20px] border border-white/[0.07]">
                    <div className="px-6 pt-5 pb-3"><Eyebrow>Tastes like</Eyebrow></div>
                    <img src={detailFlavorImage} alt={`${bean.name} flavour`} className="w-full object-cover" />
                  </div>
                </Fade>
              )}

              {/* ════════════════════════════════════════
                  MONTEBLANCO SERIES UPSELL
              ════════════════════════════════════════ */}
              {isMonteblancoBean && monteblancoBeans.length >= 2 && (
                <Fade className="mt-6">
                  <div className="relative overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#1c1814] p-6 md:p-8">
                    {/* amber glow */}
                    <div className="absolute right-0 top-0 h-[180px] w-[280px] opacity-10"
                      style={{ background: "radial-gradient(ellipse at top right,#c8922a,transparent 65%)" }} />
                    <div className="relative">
                      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
                        <div>
                          <Eyebrow>Monteblanco Series</Eyebrow>
                          <h2 className="text-[22px] font-bold tracking-[-0.03em] text-white">Explore the full set</h2>
                          <p className="mt-1.5 text-[14px] text-white/44">Compare the expressions. Order the bundle.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <Link to="/series/monteblanco" className={G}>View series</Link>
                          <button type="button" onClick={handleBundle} className={G}>Add bundle</button>
                          <a href={monteblancoBundleUrl} target="_blank" rel="noreferrer"
                            onClick={() => trackWhatsappClick("product_detail_bundle", "monteblanco")} className={P}>
                            Order bundle
                          </a>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {monteblancoBeans.slice(0, 3).map(item => <RelatedRow key={item.id} bean={item} onAdd={handleAdd} />)}
                      </div>
                    </div>
                  </div>
                </Fade>
              )}

              {/* ════════════════════════════════════════
                  RELATED
              ════════════════════════════════════════ */}
              {relatedBeans.length > 0 && (
                <Fade className="mt-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-4 bg-[#c8922a]/40" />
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/26">You may also like</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {relatedBeans.map(item => <RelatedRow key={item.id} bean={item} onAdd={handleAdd} />)}
                  </div>
                </Fade>
              )}
            </>
          ) : null}
        </main>

        {/* ── MOBILE STICKY BAR ── */}
        {bean && (
          <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/[0.07] px-4 py-3 sm:hidden"
            style={{ background: "rgba(14,12,9,0.97)", backdropFilter: "blur(20px)", paddingBottom: "max(0.75rem,env(safe-area-inset-bottom))" }}>
            <div className="flex items-center gap-2.5">
              {/* qty stepper mobile */}
              <div className="flex items-center gap-0.5 rounded-full border border-white/10 px-1 py-1">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center text-white/40 transition hover:text-white">
                  <Minus size={11} />
                </button>
                <span className="min-w-[22px] text-center text-[13px] font-semibold text-white">{qty}</span>
                <button type="button" onClick={() => setQty(q => q + 1)}
                  className="flex h-8 w-8 items-center justify-center text-white/40 transition hover:text-white">
                  <Plus size={11} />
                </button>
              </div>
              <a href={buildSingleOrderUrl(bean)} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("product_detail_sticky", bean.slug)}
                className="flex flex-1 items-center justify-between rounded-full bg-[#c8922a] px-5 py-3.5">
                <span className="text-[13px] font-semibold text-[#0e0c09]">Order on WhatsApp</span>
                <span className="ml-3 shrink-0 text-[13px] font-bold text-[#0e0c09]/70">
                  RM {Number(bean.price) * qty}
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
