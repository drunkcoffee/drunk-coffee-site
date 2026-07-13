import { Instagram, Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import packagingMockupStanding from "../assets/dcr/packaging/packaging-mockup-standing.png";
import DcrLogo from "../components/DcrLogo";
import {
  DcrAnnouncementBar,
  DcrKicker,
  PackagingProductCard,
} from "../components/DrunkDesignSystem";
import Seo from "../components/Seo";
import Toast from "../components/Toast";
import { trackAddToCart, trackWhatsappClick } from "../lib/analytics";
import {
  INSTAGRAM_URL,
  XHS_LABEL,
  appendImageParams,
  buildCartWhatsAppUrl,
  buildGeneralWhatsAppUrl,
  cx,
  formatPackagePrice,
  getDisplayCategory,
  safeArray,
  useBeans,
  usePersistentCart,
} from "../lib/coffeeStore";
import {
  DCR_PRIMARY_BUTTON,
  DCR_SECONDARY_BUTTON,
} from "../lib/designSystem";

const NAV_ITEMS = [
  { label: "Shop", to: "/shop" },
  { label: "Filter", to: "/shop?category=filter" },
  { label: "Espresso", to: "/shop?category=espresso" },
  { label: "About", to: "#about" },
];

function findNiu(beans) {
  return beans.find((bean) => /\bniu\b/i.test(`${bean.name} ${bean.slug}`));
}

function CartDrawer({ open, onClose, cart, cartCount, cartTotal, onDecrease, onIncrease, onRemove, onClear }) {
  const url = buildCartWhatsAppUrl(cart);
  if (!open || typeof document === "undefined") return null;

  return createPortal((
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/65 backdrop-blur-[4px]" aria-label="Close cart" />
      <aside role="dialog" aria-modal="true" aria-label="Shopping cart" className="dcr-cart-surface relative z-[90] flex h-dvh w-full max-w-md flex-col overflow-hidden border-l border-dcr-border">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[18px] font-semibold text-white">Your cart</p>
            <p className="text-[11px] text-white/40">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/55 hover:text-white" aria-label="Close cart">
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-[14px] text-white/48">Your cart is empty.</p>
              <button type="button" onClick={onClose} className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#d8b36a]">Keep browsing</button>
            </div>
          ) : cart.map((item) => (
            <div key={item.id} className="border border-white/10 bg-white/[0.025] p-4">
              <div className="flex justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-[11px] text-white/40">{getDisplayCategory(item)} · {[item.size, item.packageLabel].filter(Boolean).join(" ")}</p>
                </div>
                <button type="button" onClick={() => onRemove(item.id)} className="shrink-0 text-white/35 hover:text-white" aria-label={`Remove ${item.name}`}><X size={14} /></button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center border border-white/10">
                  <button type="button" onClick={() => onDecrease(item.id)} className="flex h-8 w-8 items-center justify-center text-white/55 hover:text-white" aria-label={`Decrease ${item.name}`}>−</button>
                  <span className="min-w-7 text-center text-[13px] text-white">{item.quantity}</span>
                  <button type="button" onClick={() => onIncrease(item.id)} className="flex h-8 w-8 items-center justify-center text-white/55 hover:text-white" aria-label={`Increase ${item.name}`}>+</button>
                </div>
                <p className="text-[14px] font-semibold text-white">{formatPackagePrice(item, item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-white/10 px-5 pt-4" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">Total</p>
              <p className="mt-1 text-[30px] font-bold tracking-[-0.04em] text-white">RM {cartTotal}</p>
            </div>
            {cart.length > 0 && <button type="button" onClick={onClear} className="pb-1 text-[11px] text-white/38 hover:text-white">Clear all</button>}
          </div>
          <div className="flex flex-col gap-2">
            <a href={url} target="_blank" rel="noreferrer" className={cx(DCR_PRIMARY_BUTTON, "w-full justify-center")}>Send order via WhatsApp</a>
            <button type="button" onClick={onClose} className="dcr-button w-full justify-center border-white/15 bg-transparent text-white hover:border-white/35">Keep browsing</button>
          </div>
        </div>
      </aside>
    </div>
  ), document.body);
}

function Header({ cartCount, onCartOpen }) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);

  return (
    <>
      <header className="relative z-50 border-b border-dcr-border bg-dcr-bg">
        <DcrAnnouncementBar>Buy 2 bags, save 10% · Buy 4 bags, save 20%</DcrAnnouncementBar>
        <div className="dcr-container grid min-h-17 grid-cols-[1fr_auto_1fr] items-center py-2 md:flex md:min-h-20 md:justify-between md:gap-8">
          <button type="button" onClick={() => setNavOpen(true)} className="flex h-10 w-10 items-center justify-center border border-dcr-border text-dcr-olive md:hidden" aria-label="Open menu">
            <Menu size={17} />
          </button>
          <a href="#top" className="justify-self-center md:justify-self-auto" aria-label="Drunk Coffee Roasters home">
            <DcrLogo className="h-11 md:h-13" showName />
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => item.to.startsWith("#") ? (
              <a key={item.label} href={item.to} className="dcr-nav-link">{item.label}</a>
            ) : (
              <Link key={item.label} to={item.to} className="dcr-nav-link">{item.label}</Link>
            ))}
          </nav>
          <button type="button" onClick={onCartOpen} className="relative flex h-10 w-10 items-center justify-center justify-self-end border border-dcr-border bg-dcr-cream text-dcr-olive hover:border-dcr-gold" aria-label="Open cart">
            <ShoppingCart size={16} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-dcr-gold px-1 text-[9px] font-bold text-dcr-charcoal">{cartCount}</span>}
          </button>
        </div>
      </header>

      {navOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button type="button" onClick={() => setNavOpen(false)} className="absolute inset-0 bg-dcr-charcoal/45" aria-label="Close menu" />
          <aside className="absolute left-0 top-0 flex h-full w-[82vw] max-w-[320px] flex-col border-r border-dcr-border bg-dcr-cream p-5">
            <div className="flex items-center justify-between border-b border-dcr-border pb-5">
              <DcrLogo className="h-11" showName />
              <button type="button" onClick={() => setNavOpen(false)} className="flex h-10 w-10 items-center justify-center border border-dcr-border text-dcr-olive" aria-label="Close menu"><X size={16} /></button>
            </div>
            <nav className="flex flex-col pt-3" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => item.to.startsWith("#") ? (
                <a key={item.label} href={item.to} onClick={() => setNavOpen(false)} className="border-b border-dcr-border py-4 text-[18px] font-semibold text-dcr-olive">{item.label}</a>
              ) : (
                <Link key={item.label} to={item.to} onClick={() => setNavOpen(false)} className="border-b border-dcr-border py-4 text-[18px] font-semibold text-dcr-olive">{item.label}</Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
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
  const [toast, setToast] = useState("");
  const waUrl = buildGeneralWhatsAppUrl();

  const monthlyBean = useMemo(() => findNiu(beans) || beans[0], [beans]);
  const featuredBeans = useMemo(() => {
    const preferred = beans.filter((bean) => bean.featured).slice(0, 3);
    const fill = beans.filter((bean) => !preferred.some((item) => item.id === bean.id));
    return [...preferred, ...fill].slice(0, 3);
  }, [beans]);
  const heroNotes = safeArray(monthlyBean?.notes).slice(0, 3);
  const heroImage = monthlyBean?.image
    ? appendImageParams(monthlyBean.image, { w: 1200, h: 1200, fit: "pad", fm: "webp", q: 88 })
    : packagingMockupStanding;

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function openCoffee(slug) {
    navigate(`/coffee/${slug}`);
  }

  function handleAdd(bean) {
    trackAddToCart(bean, "home_featured");
    addToCart(bean);
    setToast(`${bean.name} added`);
  }

  return (
    <>
      <Seo
        title="Drunk Coffee Roasters | Specialty Coffee Roaster in Malaysia"
        description="Coffee roasted for the way you drink. Shop filter, espresso-friendly, and limited-release coffee from Drunk Coffee Roasters."
        url="/"
        image="https://drunkcoffeeroasters.com/og-default.jpg"
        imageAlt="Drunk Coffee Roasters specialty coffee"
        jsonLd={{ "@context": "https://schema.org", "@type": "Organization", name: "Drunk Coffee Roasters", url: "https://drunkcoffeeroasters.com", sameAs: ["https://instagram.com/drunkcoffeeroasters"] }}
      />

      <div id="top" className="dcr-page">
        <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} />

        <main>
          <section className="border-b border-dcr-border bg-dcr-cream">
            <div className="dcr-container grid gap-9 py-10 md:grid-cols-[0.82fr_1.18fr] md:items-center md:gap-14 md:py-16 lg:py-20">
              <div>
                <DcrKicker>Monthly Highlight</DcrKicker>
                <h1 className="dcr-heading mt-4 max-w-[9ch] text-[clamp(64px,10vw,128px)] leading-[0.78]">
                  {monthlyBean?.name || "NIU"}
                </h1>
                <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.15em] text-dcr-brown/68">
                  {monthlyBean?.collection || monthlyBean?.origin || "Colombia Monteblanco"}
                </p>
                <p className="dcr-body-copy mt-4 max-w-[44ch] text-[15px] md:text-[17px]">
                  {heroNotes.length > 0
                    ? `A vibrant coffee with ${heroNotes.join(", ").toLowerCase()}.`
                    : "A vibrant coffee with grape, floral and candy-like sweetness."}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {monthlyBean && <button type="button" onClick={() => openCoffee(monthlyBean.slug)} className={DCR_PRIMARY_BUTTON}>Shop this coffee</button>}
                  <Link to="/shop" className={DCR_SECONDARY_BUTTON}>View all coffee</Link>
                </div>
              </div>

              <div className="relative min-h-[320px] overflow-hidden border border-dcr-border bg-dcr-bg p-4 sm:min-h-[420px] md:min-h-[520px] md:p-8">
                <img src={heroImage} alt={monthlyBean?.name || "Drunk Coffee Roasters coffee packaging"} className="h-full max-h-[560px] w-full object-contain" fetchPriority="high" />
                <span className="absolute bottom-4 left-4 border border-dcr-border bg-dcr-cream px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-dcr-brown md:bottom-6 md:left-6">Roasted to order</span>
              </div>
            </div>
          </section>

          <section className="border-b border-dcr-border bg-dcr-bg">
            <div className="dcr-container py-12 md:py-18">
              <div className="mb-7 flex items-end justify-between gap-5">
                <div>
                  <DcrKicker>Shop by brew style</DcrKicker>
                  <h2 className="dcr-heading mt-3 text-[clamp(38px,6vw,68px)] leading-[0.88]">Choose how you drink it.</h2>
                </div>
                <Link to="/shop" className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-dcr-brown underline underline-offset-4 sm:block">All coffee</Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Link to="/shop?category=filter" className="group border border-dcr-border bg-dcr-cream p-6 transition hover:border-dcr-gold md:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-dcr-brown/65">01 / Filter Coffee</p>
                  <h3 className="dcr-heading mt-8 text-[clamp(38px,5vw,62px)] leading-[0.88]">Clear and expressive.</h3>
                  <p className="dcr-body-copy mt-4 max-w-[36ch]">For pour over, clarity and expressive flavours.</p>
                  <span className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-dcr-olive underline decoration-dcr-gold underline-offset-4">Shop Filter</span>
                </Link>
                <Link to="/shop?category=espresso" className="group border border-dcr-border bg-dcr-olive p-6 text-dcr-cream transition hover:border-dcr-gold md:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-dcr-gold">02 / Espresso Coffee</p>
                  <h3 className="mt-8 max-w-[11ch] font-dcr-heading text-[clamp(38px,5vw,62px)] font-bold leading-[0.88] tracking-[-0.025em] text-dcr-cream">Built for body and sweetness.</h3>
                  <p className="mt-4 max-w-[36ch] text-[14px] leading-[1.75] text-dcr-cream/68">For espresso, Americano and milk-based drinks.</p>
                  <span className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-dcr-cream underline decoration-dcr-gold underline-offset-4">Shop Espresso</span>
                </Link>
              </div>
            </div>
          </section>

          <section className="border-b border-dcr-border bg-dcr-cream">
            <div className="dcr-container py-12 md:py-18">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <DcrKicker>Featured Coffee</DcrKicker>
                  <h2 className="dcr-heading mt-3 text-[clamp(38px,6vw,68px)] leading-[0.88]">Three coffees to start with.</h2>
                </div>
                <Link to="/shop" className={cx(DCR_SECONDARY_BUTTON, "self-start sm:self-auto")}>View all coffee</Link>
              </div>

              {error && <p className="mt-5 text-[12px] text-dcr-brown">{error}</p>}
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                  ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="dcr-product-card h-[420px] animate-pulse bg-dcr-bg" />)
                  : featuredBeans.map((bean) => (
                      <PackagingProductCard key={bean.id} bean={bean} onOpen={openCoffee} onAdd={handleAdd} />
                    ))}
              </div>
            </div>
          </section>

          <section id="about" className="scroll-mt-5 border-b border-dcr-border bg-dcr-bg">
            <div className="dcr-container grid gap-9 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-16 md:py-18">
              <div>
                <DcrKicker>Drunk Coffee Roasters</DcrKicker>
                <h2 className="dcr-heading mt-4 max-w-[12ch] text-[clamp(44px,7vw,82px)] leading-[0.84]">Leave the complexity to the roaster.</h2>
                <p className="dcr-body-copy mt-5 max-w-[49ch] text-[15px] md:text-[17px]">We roast distinctive coffees to make choosing and brewing them easier.</p>
              </div>
              <div className="grid gap-3 border-t border-dcr-border pt-5 sm:grid-cols-2 md:grid-cols-1">
                <div className="flex items-baseline justify-between gap-5 border-b border-dcr-border pb-3">
                  <span className="text-[13px] font-semibold text-dcr-olive">HB Best Batch Roaster 2026</span>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-dcr-brown/62">3rd Place</span>
                </div>
                <div className="flex items-baseline justify-between gap-5 border-b border-dcr-border pb-3">
                  <span className="text-[13px] font-semibold text-dcr-olive">PCA Brewing</span>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.12em] text-dcr-brown/62">3rd Place</span>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-dcr-border bg-dcr-cream text-dcr-charcoal">
            <div className="dcr-container grid gap-7 py-12 md:grid-cols-[1fr_auto] md:items-end md:py-16">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-dcr-brown">Direct order</p>
                <h2 className="mt-4 max-w-[12ch] font-dcr-heading text-[clamp(40px,6vw,72px)] font-bold leading-[0.86] tracking-[-0.025em]">Prefer ordering directly?</h2>
                <p className="mt-4 max-w-[48ch] text-[14px] leading-[1.8] text-dcr-charcoal/62">Browse the coffee list and place your order through WhatsApp.</p>
              </div>
              <a href={waUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("homepage_direct_order", "general")} className={cx(DCR_PRIMARY_BUTTON, "shrink-0")}>Order on WhatsApp</a>
            </div>
          </section>
        </main>

        <footer className="border-t border-dcr-border bg-dcr-cream">
          <div className="dcr-container grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:py-12">
            <div>
              <DcrLogo className="h-12" showName />
              <p className="mt-4 max-w-[34ch] text-[13px] leading-[1.75] text-dcr-charcoal/55">Coffee roasted for the way you drink.</p>
            </div>
            <div>
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-dcr-brown/60">Explore</p>
              <Link to="/shop" className="block py-1.5 text-[13px] text-dcr-charcoal/62 hover:text-accent">Shop</Link>
              <Link to="/shop?category=filter" className="block py-1.5 text-[13px] text-dcr-charcoal/62 hover:text-accent">Filter</Link>
              <Link to="/shop?category=espresso" className="block py-1.5 text-[13px] text-dcr-charcoal/62 hover:text-accent">Espresso</Link>
              <a href="#about" className="block py-1.5 text-[13px] text-dcr-charcoal/62 hover:text-accent">About</a>
            </div>
            <div>
              <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-dcr-brown/60">Find us</p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-1.5 text-[13px] text-dcr-charcoal/62 hover:text-accent"><Instagram size={13} /> Instagram</a>
              <a href={waUrl} target="_blank" rel="noreferrer" className="block py-1.5 text-[13px] text-dcr-charcoal/62 hover:text-accent">WhatsApp</a>
              <span className="block py-1.5 text-[13px] text-dcr-charcoal/52">Xiaohongshu: {XHS_LABEL}</span>
            </div>
          </div>
          <div className="border-t border-dcr-border">
            <div className="dcr-container py-5 text-[11px] text-dcr-charcoal/42">© {new Date().getFullYear()} Drunk Coffee Roasters. Johor, Malaysia.</div>
          </div>
        </footer>
      </div>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onDecrease={decreaseCartItem}
        onIncrease={increaseCartItem}
        onRemove={removeCartItem}
        onClear={clearCart}
      />
      <Toast message={toast} />
    </>
  );
}
