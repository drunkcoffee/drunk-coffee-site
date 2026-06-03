import { ArrowLeft, ChevronLeft, ChevronRight, Instagram, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

// tokens
const P = "inline-flex items-center gap-2 rounded-full bg-[#c8922a] px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#0e0c09] transition hover:bg-[#d9a23a] active:scale-[0.97]";
const G = "inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-white/60 transition hover:border-white/24 hover:text-white active:scale-[0.97]";

function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="h-px w-4 bg-[#c8922a]/50" />
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#c8922a]/70">{children}</span>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.05] py-3">
      <span className="text-[11px] uppercase tracking-[0.14em] text-white/28 shrink-0 pt-0.5">{label}</span>
      <span className="text-[13px] text-white/65 text-right">{value}</span>
    </div>
  );
}

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

function RelatedRow({ bean, onAdd }) {
  const img = bean?.image ? appendImageParams(bean.image, { w:300, h:300, fit:"pad", fm:"webp", q:76 }) : "";
  const notes = safeArray(bean.notes).slice(0,3).join(" · ");
  return (
    <div className="group flex items-center gap-4 rounded-[14px] border border-white/[0.05] px-4 py-3.5 transition hover:border-white/[0.10] hover:bg-[#1c1814]">
      <Link to={`/coffee/${bean.slug}`} className="shrink-0 rounded-[9px] bg-[#130f0a] overflow-hidden">
        <div className="h-[56px] w-[56px]">
          {img ? <img src={img} alt={bean.name} className="h-full w-full object-contain p-1.5 transition group-hover:scale-[1.06]" />
               : <div className="flex h-full items-center justify-center text-[9px] text-white/14">—</div>}
        </div>
      </Link>
      <Link to={`/coffee/${bean.slug}`} className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-white">{bean.name}</p>
        {notes && <p className="mt-0.5 truncate text-[11px] text-white/30">{notes}</p>}
      </Link>
      <p className="shrink-0 text-[13px] font-semibold text-white/70 mr-2">RM {bean.price}</p>
      <button type="button" onClick={() => onAdd(bean)} className="shrink-0 rounded-full bg-[#c8922a] px-3.5 py-1.5 text-[11px] font-semibold text-[#0e0c09] transition hover:bg-[#d9a23a]">+ Add</button>
    </div>
  );
}

function getRecommendedBrew(bean) {
  if (!bean) return "";
  return bean.category === "Espresso" ? "Espresso · Milk drinks · Black" : "V60 · Orea · AeroPress";
}
function getWhoItsFor(bean) {
  if (!bean) return "";
  const notes = safeArray(bean.notes).join(", ").toLowerCase();
  if (bean.category === "Espresso") return "Best for a reliable everyday cup — especially espresso or milk-based drinks.";
  if (notes.includes("floral")) return "Best for drinkers who enjoy lighter, tea-like cups with fragrance and lift.";
  if (["mango","berry","apple","fruit","orange"].some(n => notes.includes(n))) return "Best for people who enjoy brighter, fruit-forward coffees with character.";
  return "Best for a clean, balanced coffee that is easy to enjoy and easy to repeat.";
}
function formatBrewGuide(text) {
  if (!text) return [];
  return String(text).split("\n").map(l => l.trim()).filter(Boolean);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { beans, loading, error } = useBeans();
  const { cart, cartCount, cartTotal, addToCart, decreaseCartItem, increaseCartItem, removeCartItem, clearCart } = usePersistentCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [toast,    setToast]    = useState("");

  const bean         = useMemo(() => beans.find(b => b.slug === slug), [beans, slug]);
  const currentIndex = useMemo(() => beans.findIndex(b => b.slug === slug), [beans, slug]);
  const previousBean = currentIndex > 0 ? beans[currentIndex-1] : null;
  const nextBean     = currentIndex >= 0 && currentIndex < beans.length-1 ? beans[currentIndex+1] : null;
  const relatedBeans = useMemo(() => !bean ? [] : beans.filter(b => b.slug!==bean.slug && b.category===bean.category).slice(0,3), [beans, bean]);
  const monteblancoBeans = useMemo(() => beans.filter(b => [b.name,b.origin,b.collection].filter(Boolean).some(v => String(v).toLowerCase().includes("monteblanco"))), [beans]);
  const isMonteblancoBean = useMemo(() => !bean ? false : [bean.name,bean.origin,bean.collection].filter(Boolean).some(v => String(v).toLowerCase().includes("monteblanco")), [bean]);
  const monteblancoBundleUrl = useMemo(() => buildBundleOrderUrl(monteblancoBeans.slice(0,3),"Monteblanco Series"), [monteblancoBeans]);

  const detailImage      = bean?.image       ? appendImageParams(bean.image,       { w:1800, h:1800, fit:"pad", fm:"webp", q:86 }) : "";
  const detailFlavorImage= bean?.flavorImage ? appendImageParams(bean.flavorImage, { w:1600, h:1600, fit:"pad", fm:"webp", q:86 }) : "";
  const brewGuideLines   = formatBrewGuide(bean?.brewguide);

  const notesForSeo = safeArray(bean?.notes).join(", ");
  const productDescription = bean
    ? `Shop ${bean.name} from Drunk Coffee Roasters. ${bean.tagline?`${bean.tagline}. `:""}${notesForSeo?`Notes: ${notesForSeo}. `:""}Freshly roasted in Malaysia.`
    : "Specialty coffee from Drunk Coffee Roasters.";

  useEffect(() => { if (bean) trackProductView(bean); }, [bean]);
  useEffect(() => { document.body.style.overflow = cartOpen?"hidden":""; return () => { document.body.style.overflow=""; }; }, [cartOpen]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2000); return () => clearTimeout(t); }, [toast]);

  function handleAdd(target=bean) { if (!target) return; trackAddToCart(target,"product_detail"); addToCart(target); setCartOpen(true); setToast(`${target.name} added`); }
  function handleBundle() { const p=monteblancoBeans.slice(0,3); if (!p.length) return; p.forEach(b=>addToCart(b)); setCartOpen(true); setToast("Bundle added"); }

  if (!loading && !bean) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background:"#0e0c09" }}>
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#c8922a]/70 mb-4">Not found</p>
        <h1 className="text-[32px] font-bold tracking-[-0.04em] text-white">Coffee not found</h1>
        <p className="mt-3 text-[13px] text-white/44 max-w-xs">This coffee may have been removed or the link has changed.</p>
        <Link to="/" className={cx(P,"mt-7")}>Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={bean ? `${bean.name} | Drunk Coffee Roasters` : "Coffee Detail"}
        description={productDescription}
        url={bean ? `/coffee/${bean.slug}` : "/"}
        jsonLd={bean ? {
          "@context":"https://schema.org","@type":"Product",name:bean.name,description:productDescription,
          brand:{"@type":"Brand",name:"Drunk Coffee Roasters"},category:bean.category,
          url:`https://drunkcoffeeroasters.com/coffee/${bean.slug}`,image:detailImage||undefined,
          offers:{"@type":"Offer",priceCurrency:"MYR",price:String(bean.price),availability:"https://schema.org/InStock"}
        } : null}
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
                onClick={() => trackWhatsappClick("product_detail_header", bean?.slug||"")}
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

        <main className="mx-auto max-w-5xl px-4 py-12 pb-28 md:px-6 md:py-16 md:pb-16">
          {error && <p className="mb-6 text-[12px] text-amber-300">{error}</p>}

          {loading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="aspect-square animate-pulse rounded-[20px] bg-white/[0.04]" />
              <div className="space-y-4 pt-4">
                {[80,160,120,200].map(w => <div key={w} className={`h-4 animate-pulse rounded-full bg-white/[0.05]`} style={{ width:w }} />)}
              </div>
            </div>
          ) : bean ? (
            <>
              {/* ── HERO PRODUCT ── */}
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start mb-10">
                {/* image */}
                <div className="overflow-hidden rounded-[20px] bg-[#130f0a] border border-white/[0.07]">
                  {detailImage
                    ? <div className="flex aspect-square items-center justify-center p-8 md:p-12">
                        <img src={detailImage} alt={bean.name} className="h-full w-full object-contain" />
                      </div>
                    : <div className="aspect-square flex items-center justify-center text-[11px] uppercase tracking-widest text-white/16">Photo coming soon</div>
                  }
                </div>

                {/* info */}
                <div className="lg:pt-2">
                  {bean.collection && <Eyebrow>{bean.collection}</Eyebrow>}
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2">{bean.category}</p>
                  <h1 className="text-[clamp(32px,4.5vw,52px)] font-bold leading-[0.88] tracking-[-0.05em] text-white">{bean.name}</h1>

                  {bean.tagline && <p className="mt-4 text-[15px] leading-[1.85] text-white/55">{bean.tagline}</p>}

                  {/* notes */}
                  {safeArray(bean.notes).length>0 && (
                    <p className="mt-4 text-[12px] text-white/36">
                      {safeArray(bean.notes).join(" · ")}
                    </p>
                  )}

                  {bean.description && (
                    <p className="mt-5 text-[13px] leading-[1.9] text-white/50 border-t border-white/[0.06] pt-5">{bean.description}</p>
                  )}

                  {/* details table */}
                  <div className="mt-6 border-t border-white/[0.06] pt-1">
                    <DetailRow label="Origin"    value={bean.origin}   />
                    <DetailRow label="Process"   value={bean.process}  />
                    <DetailRow label="Roast"     value={bean.roast}    />
                    <DetailRow label="Best for"  value={getWhoItsFor(bean)} />
                    <DetailRow label="Brew"      value={getRecommendedBrew(bean)} />
                    <DetailRow label="Size"      value={bean.size}     />
                  </div>

                  {/* price + CTA (desktop) */}
                  <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">Price</p>
                      <p className="mt-1 text-[32px] font-bold tracking-[-0.04em] text-white">RM {bean.price}</p>
                    </div>
                    <div className="hidden gap-2.5 sm:flex">
                      <button type="button" onClick={() => handleAdd(bean)} className={G}>Add to cart</button>
                      <a href={buildSingleOrderUrl(bean)} target="_blank" rel="noreferrer"
                        onClick={() => trackWhatsappClick("product_detail_order", bean.slug)} className={P}>
                        Order on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BREW GUIDE ── */}
              {brewGuideLines.length>0 && (
                <div className="mb-8 rounded-[18px] border border-white/[0.07] bg-[#1c1814] p-6 md:p-7">
                  <Eyebrow>Brew guide</Eyebrow>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {brewGuideLines.map((line,i) => (
                      <div key={i} className="rounded-[12px] border border-white/[0.05] bg-white/[0.02] p-3.5">
                        <p className="text-[12px] leading-[1.75] text-white/60">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FLAVOR IMAGE ── */}
              {detailFlavorImage && (
                <div className="mb-8 overflow-hidden rounded-[18px] border border-white/[0.07]">
                  <div className="px-6 pt-5 pb-3"><Eyebrow>Tastes like</Eyebrow></div>
                  <img src={detailFlavorImage} alt={`${bean.name} flavour`} className="w-full object-cover" />
                </div>
              )}

              {/* ── MONTEBLANCO SERIES ── */}
              {isMonteblancoBean && monteblancoBeans.length>=2 && (
                <div className="mb-8 rounded-[18px] border border-white/[0.07] bg-[#1c1814] p-6 md:p-7">
                  <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                      <Eyebrow>Monteblanco Series</Eyebrow>
                      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-white">Explore the full set</h2>
                      <p className="mt-2 text-[13px] text-white/40">Compare the expressions side by side.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 shrink-0">
                      <Link to="/series/monteblanco" className={G}>View series</Link>
                      <button type="button" onClick={handleBundle} className={G}>Add bundle</button>
                      <a href={monteblancoBundleUrl} target="_blank" rel="noreferrer"
                        onClick={() => trackWhatsappClick("product_detail_bundle","monteblanco")} className={P}>Order bundle</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {monteblancoBeans.slice(0,3).map(item => <RelatedRow key={item.id} bean={item} onAdd={handleAdd} />)}
                  </div>
                </div>
              )}

              {/* ── PREV / NEXT ── */}
              {(previousBean || nextBean) && (
                <div className="mb-8 grid gap-3 sm:grid-cols-2">
                  {previousBean
                    ? <Link to={`/coffee/${previousBean.slug}`}
                        className="group flex items-center justify-between rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition hover:border-white/[0.12] hover:bg-[#1c1814]">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">Previous</p>
                          <p className="mt-1.5 text-[15px] font-semibold text-white">{previousBean.name}</p>
                        </div>
                        <ChevronLeft size={16} className="text-white/30 transition group-hover:text-white" />
                      </Link>
                    : <div />
                  }
                  {nextBean && (
                    <Link to={`/coffee/${nextBean.slug}`}
                      className="group flex items-center justify-between rounded-[14px] border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition hover:border-white/[0.12] hover:bg-[#1c1814]">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">Next</p>
                        <p className="mt-1.5 text-[15px] font-semibold text-white">{nextBean.name}</p>
                      </div>
                      <ChevronRight size={16} className="text-white/30 transition group-hover:text-white" />
                    </Link>
                  )}
                </div>
              )}

              {/* ── RELATED ── */}
              {relatedBeans.length>0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/24 mb-4">You may also like</p>
                  <div className="flex flex-col gap-2">
                    {relatedBeans.map(item => <RelatedRow key={item.id} bean={item} onAdd={handleAdd} />)}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </main>

        {/* mobile sticky bar */}
        {bean && (
          <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/[0.07] px-4 py-3 sm:hidden"
            style={{ background:"rgba(14,12,9,0.96)", backdropFilter:"blur(16px)", paddingBottom:"max(0.75rem,env(safe-area-inset-bottom))" }}>
            <div className="flex items-center gap-2.5">
              <button type="button" onClick={() => handleAdd(bean)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 text-white/60 transition hover:text-white">
                <ShoppingCart size={17} />
              </button>
              <a href={buildSingleOrderUrl(bean)} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("product_detail_sticky", bean.slug)}
                className="flex flex-1 items-center justify-between rounded-full bg-[#c8922a] px-5 py-3.5 font-semibold">
                <span className="text-[13px] text-[#0e0c09] truncate">Order on WhatsApp</span>
                <span className="text-[13px] text-[#0e0c09]/70 shrink-0 ml-3">RM {bean.price}</span>
              </a>
            </div>
          </div>
        )}

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
