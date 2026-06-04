import { ChevronDown, Instagram, Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { trackAddToCart, trackWhatsappClick } from "../lib/analytics";
import {
  FILTERS,
  INSTAGRAM_URL,
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

// ─── Tokens ──────────────────────────────────────────────────────────────────
const AMBER    = "#c8922a";
const AMBER_HI = "#d9a23a";
const DARK     = "#0e0c09";
const MID      = "#151210";
const PANEL    = "#1c1814";

const P = "inline-flex items-center gap-2 rounded-full bg-[#c8922a] px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#0e0c09] transition duration-150 hover:bg-[#d9a23a] active:scale-[0.97]";
const G = "inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-white/60 transition duration-150 hover:border-white/24 hover:text-white active:scale-[0.97]";

// ─── IG posts — add more entries as you post ─────────────────────────────────
// To add a post: copy an entry, update src (filename in /public/ig/) and url (IG post link)
const IG_POSTS = [
  { src: "/ig/ig-1.jpg", alt: "Drunk Coffee Roasters", url: "https://www.instagram.com/p/DUHs7jOEojf/" },
  { src: "/ig/ig-2.jpg", alt: "Drunk Coffee Roasters", url: "https://www.instagram.com/p/DUHs7jOEojf/" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function useInView(threshold = 0.08) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { threshold });
    io.observe(el); return () => io.disconnect();
  }, [threshold]);
  return [ref, v];
}

function Fade({ children, delay = 0, className = "", y = 18 }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ transitionDelay: v ? `${delay}ms` : "0ms", transform: v ? "none" : `translateY(${y}px)` }}
      className={cx("transition-all duration-700 ease-out", v ? "opacity-100" : "opacity-0", className)}>
      {children}
    </div>
  );
}

// Eyebrow label
function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="h-px w-5 bg-[#c8922a]/50" />
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#c8922a]/70">{children}</span>
    </div>
  );
}

// Grain overlay
function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] opacity-[0.022]"
      style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize:"160px 160px" }}
    />
  );
}

// Scroll progress bar
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-[100] h-[2px] w-full bg-transparent">
      <div className="h-full bg-[#c8922a] transition-none" style={{ width: `${pct}%` }} />
    </div>
  );
}



// ─── Global keyframes (injected once) ────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
    `}</style>
  );
}

// ─── Marquee ticker ───────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Roasted to order",
  "Johor · Malaysia",
  "Ships within 48 hrs",
  "Filter + Espresso",
  "Small-batch specialty",
  "WhatsApp ordering",
  "Fresh · Sweet · Approachable",
];
function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]; // double for seamless loop
  return (
    <div className="overflow-hidden border-b border-white/[0.05] py-2.5" style={{ background:"rgba(14,12,9,0.6)" }}>
      <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-0">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-4 px-4 text-[10px] uppercase tracking-[0.22em] text-white/28">
            {item}
            <span className="h-1 w-1 rounded-full bg-[#c8922a]/40" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose, cart, cartCount, cartTotal, onDecrease, onIncrease, onRemove, onClear }) {
  const url = buildCartWhatsAppUrl(cart);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" aria-label="Close" />
      <aside className="relative flex h-full w-full max-w-[340px] flex-col border-l border-white/[0.07]" style={{ background: "#100e0b" }}>
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <p className="text-[17px] font-semibold tracking-[-0.02em] text-white">Your cart</p>
            <p className="text-[11px] text-white/30">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-2">
          {cart.length === 0
            ? <div className="mt-8 text-center">
                <p className="text-[14px] text-white/40">Your cart is empty.</p>
                <p className="mt-1 text-[12px] text-white/24">Browse coffees below and add one.</p>
              </div>
            : cart.map(item => (
                <div key={item.id} className="rounded-[14px] border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{item.category} · {item.size}</p>
                    </div>
                    <button type="button" onClick={() => onRemove(item.id)} className="shrink-0 text-white/20 transition hover:text-white/60" aria-label="Remove"><X size={13} /></button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-white/10 px-1">
                      <button type="button" onClick={() => onDecrease(item.id)} className="flex h-7 w-7 items-center justify-center text-white/50 transition hover:text-white">−</button>
                      <span className="min-w-6 text-center text-[13px] text-white">{item.quantity}</span>
                      <button type="button" onClick={() => onIncrease(item.id)} className="flex h-7 w-7 items-center justify-center text-white/50 transition hover:text-white">+</button>
                    </div>
                    <p className="text-[14px] font-semibold text-white">RM {Number(item.price||0)*item.quantity}</p>
                  </div>
                </div>
              ))
          }
        </div>

        {/* footer */}
        <div className="border-t border-white/[0.07] px-5 pt-4" style={{ paddingBottom:"max(1.25rem,env(safe-area-inset-bottom))" }}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">Total</p>
              <p className="mt-0.5 text-[28px] font-bold tracking-[-0.04em] text-white">RM {cartTotal}</p>
            </div>
            {cart.length > 0 && (
              <button type="button" onClick={onClear} className="text-[11px] text-white/24 transition hover:text-white/50 pb-1">Clear all</button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <a href={url} target="_blank" rel="noreferrer" className={cx(P, "w-full justify-center")}>Send order via WhatsApp</a>
            <button type="button" onClick={onClose} className={cx(G, "w-full justify-center")}>Keep browsing</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── Coffee row ───────────────────────────────────────────────────────────────
function CoffeeRow({ bean, onOpen, onAdd, index }) {
  const img = bean.image ? appendImageParams(bean.image, { w:400, h:400, fit:"pad", fm:"webp", q:78 }) : "";
  const notes = safeArray(bean.notes).slice(0, 3).join(" · ");
  return (
    <Fade delay={index * 28}>
      <article className="group relative flex items-center gap-4 rounded-[14px] border border-white/[0.05] px-4 py-3.5 transition duration-200 hover:border-white/[0.10] hover:bg-[#1c1814] md:px-5">
        {/* thumbnail */}
        <button type="button" onClick={() => onOpen(bean.slug)} className="shrink-0 rounded-[9px] bg-[#130f0a] overflow-hidden">
          <div className="h-[64px] w-[64px]">
            {img
              ? <img src={img} alt={bean.name} className="h-full w-full object-contain p-2 transition duration-400 group-hover:scale-[1.08]" />
              : <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-widest text-white/16">—</div>
            }
          </div>
        </button>

        {/* info */}
        <button type="button" onClick={() => onOpen(bean.slug)} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">{bean.name}</span>
            {bean.badge && <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-[#c8922a]" title={bean.badge} />}
          </div>
          {notes && <p className="mt-1 truncate text-[11px] text-white/32">{notes}</p>}
        </button>

        {/* price */}
        <div className="shrink-0 text-right mr-2">
          <p className="text-[14px] font-semibold text-white/80">RM {bean.price}</p>
          <p className="text-[10px] text-white/24 mt-0.5">{bean.category}</p>
        </div>

        {/* add — slides in on hover desktop, always visible mobile */}
        <button type="button" onClick={() => onAdd(bean)} aria-label="Add to cart"
          className="shrink-0 rounded-full bg-[#c8922a] px-3.5 py-2 text-[11px] font-semibold text-[#0e0c09] transition duration-200 hover:bg-[#d9a23a] active:scale-95 md:translate-x-1.5 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
          + Add
        </button>
      </article>
    </Fade>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-white/[0.05] px-4 py-3.5">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-[9px] bg-white/[0.04]" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-white/[0.04]" />
      </div>
      <div className="h-3.5 w-10 animate-pulse rounded-full bg-white/[0.05]" />
    </div>
  );
}

// ─── Series card ──────────────────────────────────────────────────────────────
function SeriesCard({ bean, onOpen, index }) {
  const img = bean?.image ? appendImageParams(bean.image, { w:800, h:800, fit:"pad", fm:"webp", q:80 }) : "";
  return (
    <Fade delay={index * 60}>
      <button type="button" onClick={() => onOpen(bean.slug)}
        className="group w-full text-left overflow-hidden rounded-[18px] border border-white/[0.07] bg-[#1c1814] transition duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
        <div className="aspect-square overflow-hidden bg-[#130f0a] flex items-center justify-center p-8">
          {img
            ? <img src={img} alt={bean.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.06]" />
            : <div className="text-[10px] uppercase tracking-widest text-white/16">Soon</div>
          }
        </div>
        <div className="px-5 pb-5 pt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c8922a]/60">{bean.category}</p>
          <h3 className="mt-1.5 text-[18px] font-semibold tracking-[-0.02em] text-white leading-tight">{bean.name}</h3>
          {bean.tagline && <p className="mt-1.5 text-[12px] leading-relaxed text-white/38 line-clamp-2">{bean.tagline}</p>}
        </div>
      </button>
    </Fade>
  );
}

// ─── Accordion FAQ item ───────────────────────────────────────────────────────
// ─── IG tile with error fallback ────────────────────────────────────────────
function IgTile({ src, alt }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div className="aspect-square w-full flex flex-col items-center justify-center gap-2">
      <Instagram size={18} className="text-white/12" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/18">Coming soon</span>
    </div>
  );
  return (
    <img src={src} alt={alt} onError={() => setErr(true)}
      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04] group-hover:brightness-75"
      loading="lazy" />
  );
}

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <Fade delay={index * 40}>
      <div className="border-b border-white/[0.06]">
        <button type="button" onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between gap-4 py-4 text-left">
          <span className={cx("text-[14px] font-semibold tracking-[-0.01em] transition duration-200", open ? "text-white" : "text-white/65")}>{q}</span>
          <ChevronDown size={15} className={cx("shrink-0 text-white/28 transition duration-300", open ? "rotate-180 text-[#c8922a]" : "")} />
        </button>
        <div className={cx("overflow-hidden transition-all duration-300", open ? "max-h-40 pb-4" : "max-h-0")}>
          <p className="text-[13px] leading-[1.8] text-white/46">{a}</p>
        </div>
      </div>
    </Fade>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const navigate = useNavigate();
  const { beans, loading, error } = useBeans();
  const { cart, cartCount, cartTotal, addToCart, decreaseCartItem, increaseCartItem, removeCartItem, clearCart } = usePersistentCart();

  const [cartOpen,     setCartOpen]     = useState(false);
  const [navOpen,      setNavOpen]      = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [toast,        setToast]        = useState("");

  const monteblancoBeans = useMemo(() =>
    beans.filter(b => [b.name,b.origin,b.collection].filter(Boolean).some(v => String(v).toLowerCase().includes("monteblanco")))
  , [beans]);

  const filteredBeans = useMemo(() =>
    activeFilter === "All" ? beans : beans.filter(b => b.category === activeFilter)
  , [beans, activeFilter]);

  const bundleBeans = monteblancoBeans.slice(0, 3);
  const bundleUrl   = buildBundleOrderUrl(bundleBeans, "Monteblanco Series");
  const waUrl       = buildGeneralWhatsAppUrl();
  const wsUrl       = buildWholesaleWhatsAppUrl();

  useEffect(() => {
    document.body.style.overflow = (cartOpen || navOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, navOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function openCoffee(slug) { navigate(`/coffee/${slug}`); }
  function handleAdd(bean) { trackAddToCart(bean,"home"); addToCart(bean); setCartOpen(true); setToast(`${bean.name} added`); }
  function handleBundle() { if (!bundleBeans.length) return; bundleBeans.forEach(b => addToCart(b)); setCartOpen(true); setToast("Bundle added"); }

  return (
    <>
      <Seo
        title="Drunk Coffee Roasters | Specialty Coffee Roaster in Malaysia"
        description="Small-batch specialty coffee roasted in Johor, Malaysia. Sweet, approachable, and made for every day."
        url="/"
        jsonLd={{ "@context":"https://schema.org","@type":"Organization",name:"Drunk Coffee Roasters",url:"https://drunkcoffeeroasters.com",sameAs:["https://instagram.com/drunkcoffeeroasters"] }}
      />

      <Grain />
      <GlobalStyles />
      <ScrollProgress />

      <div style={{ background: DARK }} className="min-h-screen">

        {/* ── HEADER ── */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
          style={{ background:"rgba(14,12,9,0.88)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <a href="#top" className="shrink-0">
              <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-11 object-contain md:h-12" />
            </a>

            {/* desktop nav */}
            <nav className="hidden items-center gap-7 md:flex">
              {[["Shop","#shop"],["Series","#series"],["Wholesale","#wholesale"],["FAQ","#faq"]].map(([l,h]) => (
                <a key={l} href={h} className="text-[11px] uppercase tracking-[0.16em] text-white/40 transition hover:text-white/90">{l}</a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* cart */}
              <button type="button" onClick={() => setCartOpen(true)} aria-label="Cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:text-white">
                <ShoppingCart size={15} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c8922a] text-[9px] font-bold text-[#0e0c09]">{cartCount}</span>
                )}
              </button>
              {/* IG desktop */}
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white md:flex">
                <Instagram size={15} />
              </a>
              {/* WA desktop */}
              <a href={waUrl} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("header","general")}
                className="hidden items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-white/40 transition hover:text-white md:flex">
                Order now
              </a>
              {/* hamburger */}
              <button type="button" onClick={() => setNavOpen(true)} aria-label="Menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:text-white md:hidden">
                <Menu size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* ── MOBILE NAV ── */}
        {navOpen && (
          <div className="fixed inset-0 z-[90]">
            <button type="button" onClick={() => setNavOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <div className="absolute right-0 top-0 h-full w-[78vw] max-w-[280px] border-l border-white/[0.07] flex flex-col px-6 pt-6"
              style={{ background:"#100e0b" }}>
              <div className="flex items-center justify-between mb-8">
                <img src="/logo.png" alt="" className="h-10 object-contain" />
                <button type="button" onClick={() => setNavOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40"><X size={15} /></button>
              </div>
              <nav className="flex flex-col">
                {[["Shop","#shop"],["Series","#series"],["Why us","#why"],["Wholesale","#wholesale"],["FAQ","#faq"]].map(([l,h]) => (
                  <a key={l} href={h} onClick={() => setNavOpen(false)}
                    className="border-b border-white/[0.05] py-3.5 text-[14px] text-white/55 transition hover:text-white">{l}</a>
                ))}
              </nav>
              <div className="mt-auto pb-8 pt-6" style={{ paddingBottom:"max(2rem,env(safe-area-inset-bottom))" }}>
                <a href={waUrl} target="_blank" rel="noreferrer"
                  onClick={() => { trackWhatsappClick("mobile_nav","general"); setNavOpen(false); }}
                  className={cx(P,"w-full justify-center")}>Order via WhatsApp</a>
              </div>
            </div>
          </div>
        )}

        <main id="top" className="pt-[56px] md:pt-[60px]">

          {/* ══════════════════════════════════════════════════════════
              HERO
          ══════════════════════════════════════════════════════════ */}
          <section className="relative flex min-h-[94svh] flex-col overflow-hidden">
            {/* bg */}
            <div className="absolute inset-0">
              <img src="/hero-coffee.jpg" alt="" className="h-full w-full object-cover opacity-25" fetchPriority="high" />
              <div className="absolute inset-0" style={{ background:"linear-gradient(155deg,rgba(14,12,9,0.45) 0%,rgba(14,12,9,0.78) 45%,rgba(14,12,9,1) 100%)" }} />
            </div>
            {/* warm glow top-right */}
            <div className="absolute right-0 top-0 h-[80vh] w-[55vw] opacity-[0.08]"
              style={{ background:"radial-gradient(ellipse at 80% 10%,#c8922a,transparent 60%)" }} />

            <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-14 pt-24 md:px-6 md:pb-20">
              <Fade>
                <Eyebrow>Johor · Malaysia · Est. 2023</Eyebrow>
              </Fade>
              <Fade delay={60}>
                <h1 className="text-[clamp(52px,9.5vw,120px)] font-bold leading-[0.85] tracking-[-0.05em] text-white max-w-[12ch]">
                  Coffee<br />
                  <em className="not-italic" style={{ color:AMBER }}>worth</em><br />
                  getting<br />
                  drunk on.
                </h1>
              </Fade>
              <Fade delay={120}>
                <p className="mt-7 max-w-[38ch] text-[15px] leading-[1.9] text-white/48 md:text-[16px]">
                  Small-batch specialty coffee roasted in Johor. Sweet, approachable, and made for every day — not just special occasions.
                </p>
              </Fade>
              <Fade delay={180}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#shop" className={P}>Shop coffees</a>
                  <a href={waUrl} target="_blank" rel="noreferrer"
                    onClick={() => trackWhatsappClick("hero","general")} className={G}>
                    <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" className="h-3.5 w-3.5 opacity-40" />
                    Order on WhatsApp
                  </a>
                </div>
              </Fade>

              {/* stats strip */}
              <Fade delay={240}>
                <div className="mt-14 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/[0.06] pt-6">
                  {[
                    { n:"100%",   l:"Roasted to order" },
                    { n:"48 hr",  l:"Dispatch time"    },
                    { n:"MY · SG",l:"Ships to"         },
                    { n:"Filter + Espresso", l:"Brew styles" },
                  ].map(({ n,l }) => (
                    <div key={l} className="flex items-baseline gap-2">
                      <span className="text-[15px] font-semibold text-white">{n}</span>
                      <span className="text-[10px] text-white/30">{l}</span>
                    </div>
                  ))}
                </div>
              </Fade>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              SHOP — narrow list, flows naturally after hero
          ══════════════════════════════════════════════════════════ */}
          <Marquee />
          <section id="shop" className="border-t border-white/[0.06]">
            <div className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">
              <Fade>
                <Eyebrow>Coffee menu</Eyebrow>
                <h2 className="text-[clamp(26px,3.5vw,38px)] font-bold leading-[0.92] tracking-[-0.04em] text-white">Our coffees</h2>
              </Fade>

              {/* filter tabs */}
              <div className="mt-7 flex items-center gap-1 border-b border-white/[0.06]">
                {FILTERS.map(f => {
                  const active = activeFilter === f;
                  return (
                    <button key={f} type="button" onClick={() => setActiveFilter(f)}
                      className={cx("relative pb-3 pr-4 text-[12px] uppercase tracking-[0.1em] transition duration-200",
                        active ? "font-semibold text-white" : "text-white/30 hover:text-white/60")}>
                      {f}
                      {active && <span className="absolute bottom-0 left-0 right-4 h-[1.5px] rounded-full bg-[#c8922a]" />}
                    </button>
                  );
                })}
                <span className="ml-auto pb-3 text-[11px] text-white/20">
                  {filteredBeans.length} available
                </span>
              </div>

              {error && <p className="mt-4 text-[12px] text-amber-300">{error}</p>}

              <div className="mt-3 flex flex-col gap-1.5">
                {loading
                  ? Array.from({length:4}).map((_,i) => <SkeletonRow key={i} />)
                  : filteredBeans.map((bean,i) => (
                      <CoffeeRow key={bean.id} bean={bean} onOpen={openCoffee} onAdd={handleAdd} index={i} />
                    ))
                }
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              SERIES — editorial layout, not a product grid
          ══════════════════════════════════════════════════════════ */}
          <section id="series" className="border-t border-white/[0.06] overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <Fade>
                  <Eyebrow>Series focus</Eyebrow>
                  <h2 className="text-[clamp(26px,3.5vw,44px)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
                    The Monteblanco<br />Series
                  </h2>
                  <p className="mt-4 max-w-[38ch] text-[14px] leading-[1.85] text-white/42">
                    Fruit-forward, expressive. Three expressions of the same farm — compare side by side or grab the full set.
                  </p>
                </Fade>
                {bundleBeans.length > 0 && (
                  <Fade delay={80} className="flex shrink-0 flex-wrap gap-2">
                    <button type="button" onClick={handleBundle}
                      className={cx(G,"shrink-0")}>Add bundle to cart</button>
                    <a href={bundleUrl} target="_blank" rel="noreferrer"
                      onClick={() => trackWhatsappClick("series_bundle","monteblanco")}
                      className={cx(P,"shrink-0")}>Order bundle on WhatsApp</a>
                  </Fade>
                )}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {bundleBeans.length > 0
                  ? bundleBeans.map((bean,i) => <SeriesCard key={bean.id} bean={bean} onOpen={openCoffee} index={i} />)
                  : Array.from({length:3}).map((_,i) => (
                      <div key={i} className="rounded-[18px] border border-white/[0.06] bg-[#1c1814]">
                        <div className="aspect-square animate-pulse bg-white/[0.03]" />
                      </div>
                    ))
                }
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              WHY + REVIEWS — alternating rhythm
          ══════════════════════════════════════════════════════════ */}
          <section id="why" className="border-t border-white/[0.06]">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
              <Fade>
                <Eyebrow>Why us</Eyebrow>
                <h2 className="text-[clamp(26px,3.5vw,44px)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
                  Roasted small.<br />Shipped fast.
                </h2>
              </Fade>

              {/* 2-up: photo left, reasons right */}
              <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:items-start">
                <Fade className="relative overflow-hidden rounded-[20px]">
                  <img src="/editorial-drunk-coffee-roasters.jpg" alt="Roasting at Drunk Coffee"
                    className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:min-h-[420px]" loading="lazy" />
                  <div className="absolute inset-0" style={{ background:"linear-gradient(to top,rgba(14,12,9,0.88) 0%,rgba(14,12,9,0.1) 50%,transparent)" }} />
                  <div className="absolute bottom-0 p-6 md:p-7">
                    <p className="text-[20px] font-bold leading-[1.25] tracking-[-0.02em] text-white">
                      "Every bag roasted<br />after your order lands."
                    </p>
                    <p className="mt-2 text-[12px] text-white/42">No shelf stock. No stale coffee.</p>
                  </div>
                </Fade>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:gap-3">
                  {[
                    { n:"01", title:"Roasted to order",     body:"No warehouse stock. We roast each batch after your order, so you get peak freshness every time." },
                    { n:"02", title:"48-hr dispatch",        body:"Most orders packed and shipped within 48 hours. Fast, without cutting corners on the roast." },
                    { n:"03", title:"Transparent sourcing",  body:"Origin, process, tasting notes — you know exactly what you're drinking and where it came from." },
                    { n:"04", title:"Zero-friction ordering",body:"Cart → WhatsApp → done. No accounts, no complexity. Just coffee." },
                  ].map((c,i) => (
                    <Fade key={c.n} delay={i*50}>
                      <div className="flex gap-4 rounded-[14px] border border-white/[0.05] bg-white/[0.02] p-4 md:p-5">
                        <span className="mt-0.5 text-[10px] font-bold tracking-[0.14em] text-[#c8922a]/40 shrink-0">{c.n}</span>
                        <div>
                          <p className="text-[14px] font-semibold tracking-[-0.01em] text-white">{c.title}</p>
                          <p className="mt-1.5 text-[12px] leading-[1.75] text-white/40">{c.body}</p>
                        </div>
                      </div>
                    </Fade>
                  ))}
                </div>
              </div>

              {/* reviews — inlined below WHY for narrative flow */}
              <div className="mt-14 grid gap-4 md:grid-cols-3">
                {[
                  { init:"M", handle:"@coffeewithmei",     source:"Instagram", tag:"Repeat order", quote:"The beans were really fragrant and tasted super fresh. I really liked them." },
                  { init:"J", handle:"@joeydrinkscoffee",  source:"WhatsApp",  tag:"Gift",         quote:"Perfect as a gift. My friend really loved it." },
                  { init:"L", handle:"@linaroundtheworld", source:"Instagram", tag:"Souvenir",      quote:"Amazing as a souvenir to bring back to China." },
                ].map((r,i) => (
                  <Fade key={r.handle} delay={i*70}>
                    <div className="flex h-full flex-col rounded-[18px] border border-white/[0.06] bg-[#1c1814] p-5">
                      {/* stars */}
                      <div className="flex gap-0.5 mb-4">
                        {[0,1,2,3,4].map(s => (
                          <svg key={s} viewBox="0 0 12 12" className="h-2.5 w-2.5" fill={AMBER}><path d="M6 0l1.5 4H12l-3.7 2.7 1.4 4.3L6 8.7l-3.7 2.3 1.4-4.3L0 4h4.5z"/></svg>
                        ))}
                      </div>
                      <p className="flex-1 text-[18px] font-bold leading-[1.25] tracking-[-0.02em] text-white/88">"{r.quote}"</p>
                      <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] border border-white/10">
                            <span className="text-[12px] font-bold text-white/55">{r.init}</span>
                          </div>
                          <div>
                            <p className="text-[12px] text-white/60">{r.handle}</p>
                            <p className="text-[10px] text-white/26">{r.tag}</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-white/24 border border-white/[0.07] rounded-full px-2.5 py-1">{r.source}</span>
                      </div>
                    </div>
                  </Fade>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              INSTAGRAM — full-bleed mosaic
          ══════════════════════════════════════════════════════════ */}
          <section className="border-t border-white/[0.06]">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
              <div className="flex flex-col gap-5 mb-8 md:flex-row md:items-end md:justify-between">
                <Fade>
                  <Eyebrow>Instagram</Eyebrow>
                  <h2 className="text-[clamp(26px,3.5vw,44px)] font-bold leading-[0.92] tracking-[-0.04em] text-white">Follow the process</h2>
                </Fade>
                <Fade delay={60}>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                    className={cx(G,"shrink-0 self-start")}>
                    <Instagram size={13} />
                    @drunkcoffeeroasters
                  </a>
                </Fade>
              </div>

              {/* Grid: auto-adapts to number of posts */}
              <div className={
                IG_POSTS.length === 1 ? "max-w-xs mx-auto" :
                IG_POSTS.length === 2 ? "grid grid-cols-2 gap-3 max-w-xl mx-auto" :
                IG_POSTS.length === 3 ? "grid grid-cols-3 gap-3" :
                "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              }>
                {IG_POSTS.map((p,i) => (
                  <Fade key={i} delay={i*50} className="overflow-hidden rounded-[14px] bg-[#1c1814] border border-white/[0.06]">
                    <a href={p.url} target="_blank" rel="noreferrer" className="group relative block">
                      <IgTile src={p.src} alt={p.alt} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="rounded-full bg-black/50 p-2.5 backdrop-blur-sm"><Instagram size={15} className="text-white" /></div>
                      </div>
                    </a>
                  </Fade>
                ))}
              </div>

              <Fade className="mt-7 text-center">
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={cx(P,"mx-auto")}>
                  <Instagram size={13} />
                  Follow on Instagram
                </a>
              </Fade>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              WHOLESALE — cinematic full-width banner
          ══════════════════════════════════════════════════════════ */}
          <section id="wholesale" className="border-t border-white/[0.06]">
            <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
              <Fade>
                <div className="relative overflow-hidden rounded-[22px] border border-white/[0.07]" style={{ background:PANEL }}>
                  {/* amber glow top-right */}
                  <div className="absolute right-0 top-0 h-[300px] w-[400px] opacity-10"
                    style={{ background:"radial-gradient(ellipse at top right,#c8922a,transparent 65%)" }} />

                  <div className="relative grid gap-10 p-7 md:p-10 lg:grid-cols-[1fr_280px]">
                    {/* left */}
                    <div>
                      <Eyebrow>Wholesale</Eyebrow>
                      <h2 className="text-[clamp(26px,3.5vw,48px)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
                        Fresh roast,<br />at scale.
                      </h2>
                      <p className="mt-5 max-w-[44ch] text-[14px] leading-[1.9] text-white/46">
                        We supply cafés, offices, gift shops, and events across Malaysia. House espresso or seasonal filters — tell us what you need.
                      </p>

                      {/* stat chips */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {[
                          {v:"Min. 1 kg", l:"Starting order"},
                          {v:"2–5 days",  l:"Lead time"},
                          {v:"Custom",    l:"Label options"},
                        ].map(({v,l}) => (
                          <div key={l} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 flex items-baseline gap-2">
                            <span className="text-[13px] font-semibold text-white">{v}</span>
                            <span className="text-[10px] text-white/32">{l}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-7 flex flex-wrap gap-3">
                        <a href={wsUrl} target="_blank" rel="noreferrer"
                          onClick={() => trackWhatsappClick("wholesale","wholesale")}
                          className={P}>
                          <img src="https://cdn.simpleicons.org/whatsapp/0e0c09" alt="" className="h-3.5 w-3.5" />
                          Enquire on WhatsApp
                        </a>
                        <Link to="/wholesale" className={G}>View wholesale page</Link>
                      </div>
                    </div>

                    {/* right — supply types */}
                    <div className="flex flex-col gap-3">
                      {[
                        { title:"House Espresso", desc:"Consistent and balanced — works black or with milk." },
                        { title:"Seasonal Filter", desc:"Expressive and rotating, for menus with character." },
                        { title:"Gift Sets",       desc:"Packaged for retail or corporate gifting." },
                      ].map(item => (
                        <div key={item.title} className="rounded-[13px] border border-white/[0.06] bg-white/[0.025] p-4">
                          <p className="text-[13px] font-semibold text-white">{item.title}</p>
                          <p className="mt-1 text-[12px] leading-relaxed text-white/36">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Fade>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FAQ — accordion, narrow column
          ══════════════════════════════════════════════════════════ */}
          <section id="faq" className="border-t border-white/[0.06]">
            <div className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">
              <Fade>
                <Eyebrow>FAQ</Eyebrow>
                <h2 className="text-[clamp(26px,3.5vw,38px)] font-bold leading-[0.92] tracking-[-0.04em] text-white">Good to know</h2>
              </Fade>
              <div className="mt-8">
                {[
                  { q:"How do I place an order?",      a:"Add coffees to cart, then send through WhatsApp. We'll confirm availability and roasting schedule there." },
                  { q:"When will my coffee ship?",     a:"Most orders pack and ship within 1–3 working days depending on roast schedule and volume." },
                  { q:"Filter or espresso — which?",   a:"Every coffee is labelled by brew style and best use so you can choose without guessing." },
                  { q:"Do you do wholesale?",          a:"Yes — cafés, offices, events, retail. Hit the wholesale section above or message us directly." },
                  { q:"Do you ship outside Malaysia?", a:"We currently ship to Malaysia and Singapore. DM us on WhatsApp if you're elsewhere and we'll see what we can do." },
                ].map((f,i) => <FaqItem key={f.q} q={f.q} a={f.a} index={i} />)}
              </div>
            </div>
          </section>

        </main>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <footer className="border-t border-white/[0.06]">
          {/* ambient glow behind footer */}
          <div className="relative overflow-hidden">
            <div className="absolute bottom-0 left-1/2 h-[200px] w-[600px] -translate-x-1/2 opacity-[0.06]"
              style={{ background:"radial-gradient(ellipse,#c8922a,transparent 70%)" }} />
            <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
              <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
                {/* brand */}
                <div>
                  <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-10 object-contain" />
                  <p className="mt-5 max-w-[260px] text-[13px] leading-[1.9] text-white/34">
                    Drunk Coffee Roasters started as a passion for roasting coffees that are sweet, approachable and enjoyable every day.
                  </p>
                  <p className="mt-2 text-[11px] text-white/20">Based in Johor, Malaysia.</p>
                </div>

                {/* pages */}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] text-white/20 mb-4">Pages</p>
                  {[["Shop","#shop"],["Series","#series"],["Why us","#why"],["Wholesale","#wholesale"],["FAQ","#faq"]].map(([l,h]) => (
                    <a key={l} href={h} className="block py-1.5 text-[13px] text-white/36 transition hover:text-white">{l}</a>
                  ))}
                </div>

                {/* contact */}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] text-white/20 mb-4">Find us</p>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="block py-1.5 text-[13px] text-white/36 transition hover:text-white">@drunkcoffeeroasters ↗</a>
                  <span className="block py-1.5 text-[13px] text-white/36">小红书 · {XHS_LABEL}</span>
                  <a href={waUrl} target="_blank" rel="noreferrer"
                    onClick={() => trackWhatsappClick("footer","general")}
                    className="block py-1.5 text-[13px] text-white/36 transition hover:text-white">WhatsApp ↗</a>
                  <span className="block py-1.5 text-[13px] text-white/36">Johor, Malaysia</span>
                </div>
              </div>

              {/* bottom bar */}
              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-6 md:flex-row">
                <p className="text-[11px] text-white/18">© {new Date().getFullYear()} Drunk Coffee Roasters · All rights reserved</p>
                <div className="flex gap-2.5">
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] text-white/22 transition hover:text-white/60">
                    <Instagram size={13} />
                  </a>
                  <a href={waUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp"
                    onClick={() => trackWhatsappClick("footer_icon","general")}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] transition hover:border-white/16">
                    <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="" className="h-3.5 w-3.5 opacity-20 transition hover:opacity-50" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Cart */}
      <CartDrawer
        open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} cartCount={cartCount} cartTotal={cartTotal}
        onDecrease={decreaseCartItem} onIncrease={increaseCartItem}
        onRemove={removeCartItem} onClear={clearCart}
      />

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[#c8922a] px-5 py-2.5 text-[12px] font-semibold text-[#0e0c09] shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-opacity"
          style={{ bottom:"max(5rem,calc(1rem + env(safe-area-inset-bottom)))" }}>
          {toast}
        </div>
      )}
    </>
  );
}
