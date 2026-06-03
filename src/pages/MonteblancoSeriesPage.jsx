import { ArrowLeft, Instagram, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { trackAddToCart, trackWhatsappClick } from "../lib/analytics";
import {
  INSTAGRAM_URL,
  appendImageParams,
  buildBundleOrderUrl,
  buildCartWhatsAppUrl,
  buildGeneralWhatsAppUrl,
  cx,
  safeArray,
  useBeans,
  usePersistentCart,
} from "../lib/coffeeStore";

// tokens
const P = "inline-flex items-center gap-2 rounded-full bg-[#c8922a] px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#0e0c09] transition hover:bg-[#d9a23a] active:scale-[0.97]";
const G = "inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-white/60 transition hover:border-white/24 hover:text-white active:scale-[0.97]";

function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="h-px w-5 bg-[#c8922a]/50" />
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#c8922a]/70">{children}</span>
    </div>
  );
}

// shared cart drawer
function CartDrawer({ open, onClose, cart, cartCount, cartTotal, onDecrease, onIncrease, onRemove, onClear }) {
  if (!open) return null;
  const url = buildCartWhatsAppUrl(cart);
  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-[6px]" />
      <aside className="relative flex h-full w-full max-w-[340px] flex-col border-l border-white/[0.07]" style={{ background:"#100e0b" }}>
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <p className="text-[17px] font-semibold text-white">Your cart</p>
            <p className="text-[11px] text-white/30">{cartCount} item{cartCount!==1?"s":""}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-4 space-y-2">
          {cart.length===0
            ? <p className="mt-8 text-center text-[13px] text-white/36">Cart is empty.</p>
            : cart.map(item => (
                <div key={item.id} className="rounded-[14px] border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{item.category} · {item.size}</p>
                    </div>
                    <button type="button" onClick={() => onRemove(item.id)} className="text-white/20 transition hover:text-white/60"><X size={13} /></button>
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
        <div className="border-t border-white/[0.07] px-5 pt-4" style={{ paddingBottom:"max(1.25rem,env(safe-area-inset-bottom))" }}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">Total</p>
              <p className="text-[28px] font-bold tracking-[-0.04em] text-white mt-0.5">RM {cartTotal}</p>
            </div>
            {cart.length>0 && <button type="button" onClick={onClear} className="text-[11px] text-white/24 pb-1 transition hover:text-white/50">Clear</button>}
          </div>
          <div className="flex flex-col gap-2">
            <a href={url} target="_blank" rel="noreferrer" className={cx(P,"w-full justify-center")}>Send order via WhatsApp</a>
            <button type="button" onClick={onClose} className={cx(G,"w-full justify-center")}>Keep browsing</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SeriesCard({ bean, onAdd }) {
  const img = bean?.image ? appendImageParams(bean.image, { w:1000, h:1000, fit:"pad", fm:"webp", q:82 }) : "";
  const notes = safeArray(bean.notes).slice(0,3).join(" · ");
  return (
    <article className="group flex flex-col overflow-hidden rounded-[18px] border border-white/[0.07] bg-[#1c1814] transition duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
      <Link to={`/coffee/${bean.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-[#130f0a] flex items-center justify-center p-8">
          {img
            ? <img src={img} alt={bean.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.05]" />
            : <div className="text-[10px] uppercase tracking-widest text-white/16">Soon</div>
          }
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c8922a]/60">{bean.category}</p>
        <Link to={`/coffee/${bean.slug}`}>
          <h3 className="mt-1.5 text-[20px] font-semibold tracking-[-0.02em] text-white leading-tight hover:text-white/80 transition">{bean.name}</h3>
        </Link>
        {notes && <p className="mt-2 text-[12px] text-white/36">{notes}</p>}
        {bean.tagline && <p className="mt-2.5 text-[12px] leading-relaxed text-white/42 line-clamp-2 flex-1">{bean.tagline}</p>}
        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <p className="text-[16px] font-semibold text-white">RM {bean.price}</p>
          <button type="button" onClick={() => onAdd(bean)} className={cx(P,"px-4 py-2 text-[11px]")}>+ Add</button>
        </div>
      </div>
    </article>
  );
}

export default function MonteblancoSeriesPage() {
  const navigate = useNavigate();
  const { beans, loading, error } = useBeans();
  const { cart, cartCount, cartTotal, addToCart, decreaseCartItem, increaseCartItem, removeCartItem, clearCart } = usePersistentCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");

  const monteblancoBeans = useMemo(() =>
    beans.filter(b => [b.name,b.origin,b.collection].filter(Boolean).some(v => String(v).toLowerCase().includes("monteblanco")))
  , [beans]);

  const bundleUrl = buildBundleOrderUrl(monteblancoBeans.slice(0,3), "Monteblanco Series");

  useEffect(() => { document.body.style.overflow = cartOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [cartOpen]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2000); return () => clearTimeout(t); }, [toast]);

  function handleAdd(bean) { trackAddToCart(bean,"series_page"); addToCart(bean); setCartOpen(true); setToast(`${bean.name} added`); }
  function handleBundle() {
    const picks = monteblancoBeans.slice(0,3);
    if (!picks.length) return;
    picks.forEach(b => addToCart(b));
    setCartOpen(true);
    setToast("Bundle added to cart");
  }

  return (
    <>
      <Seo
        title="Monteblanco Series | Drunk Coffee Roasters"
        description="Fruit-forward coffees from the Monteblanco Series. Available as single bags or bundle sets in Malaysia."
        url="/series/monteblanco"
        jsonLd={{ "@context":"https://schema.org","@type":"CollectionPage",name:"Monteblanco Series",url:"https://drunkcoffeeroasters.com/series/monteblanco" }}
      />

      <div className="min-h-screen" style={{ background:"#0e0c09" }}>

        {/* header */}
        <header className="sticky top-0 z-50 border-b border-white/[0.07]"
          style={{ background:"rgba(14,12,9,0.9)", backdropFilter:"blur(20px)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white" aria-label="Back">
                <ArrowLeft size={15} />
              </button>
              <Link to="/"><img src="/logo.png" alt="Drunk Coffee Roasters" className="h-11 object-contain" /></Link>
            </div>
            <div className="flex items-center gap-2">
              <a href={buildGeneralWhatsAppUrl()} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("series_header","monteblanco")}
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 transition hover:border-white/20 md:flex">
                <img src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" className="h-3.5 w-3.5 opacity-40 transition hover:opacity-80" />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white md:flex">
                <Instagram size={15} />
              </a>
              <button type="button" onClick={() => setCartOpen(true)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white">
                <ShoppingCart size={15} />
                {cartCount>0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c8922a] text-[9px] font-bold text-[#0e0c09]">{cartCount}</span>}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-14 pb-24 md:px-6 md:py-20 md:pb-16">
          {error && <p className="mb-6 text-[12px] text-amber-300">{error}</p>}

          {/* hero */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Series</Eyebrow>
              <h1 className="text-[clamp(32px,5vw,60px)] font-bold leading-[0.88] tracking-[-0.05em] text-white">
                The Monteblanco<br />
                <em className="not-italic text-[#c8922a]">Series</em>
              </h1>
              <p className="mt-5 max-w-[44ch] text-[14px] leading-[1.9] text-white/46">
                Fruit-forward profiles from a single farm. Compare the expressions side by side, or grab the full set in one go.
              </p>
            </div>
            {monteblancoBeans.length>0 && (
              <div className="flex flex-wrap gap-3 shrink-0">
                <button type="button" onClick={handleBundle} className={G}>Add bundle to cart</button>
                <a href={bundleUrl} target="_blank" rel="noreferrer"
                  onClick={() => trackWhatsappClick("series_bundle","monteblanco")} className={P}>
                  Order bundle on WhatsApp
                </a>
              </div>
            )}
          </div>

          {/* what makes it special */}
          <div className="mb-10 grid gap-3 sm:grid-cols-3">
            {[
              { title:"Fruit-forward",  body:"Brighter, more expressive profiles with clear fruit character in the cup." },
              { title:"Easy to compare",body:"Taste the producer line side by side and find your preferred profile." },
              { title:"Giftable",       body:"The kind of coffee people like to give, bring home, or share." },
            ].map(c => (
              <div key={c.title} className="rounded-[14px] border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[13px] font-semibold text-white">{c.title}</p>
                <p className="mt-1.5 text-[12px] leading-[1.75] text-white/38">{c.body}</p>
              </div>
            ))}
          </div>

          {/* cards */}
          {loading
            ? <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">{Array.from({length:3}).map((_,i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-[18px] bg-white/[0.04]" />)}</div>
            : <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">{monteblancoBeans.slice(0,3).map(bean => <SeriesCard key={bean.id} bean={bean} onAdd={handleAdd} />)}</div>
          }
        </main>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} cartCount={cartCount} cartTotal={cartTotal}
          onDecrease={decreaseCartItem} onIncrease={increaseCartItem} onRemove={removeCartItem} onClear={clearCart} />

        {toast && (
          <div className="pointer-events-none fixed left-1/2 z-[80] -translate-x-1/2 rounded-full bg-[#c8922a] px-5 py-2.5 text-[12px] font-semibold text-[#0e0c09]"
            style={{ bottom:"max(5rem,calc(1rem + env(safe-area-inset-bottom)))" }}>
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
