import { ArrowLeft, Instagram, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import {
  APP_BG,
  DARK_BUTTON,
  EYEBROW,
  INSTAGRAM_URL,
  LIGHT_BUTTON,
  LIGHT_BUTTON_STYLE,
  PANEL,
  SOFT_PANEL,
  appendImageParams,
  buildBundleOrderUrl,
  buildCartWhatsAppUrl,
  buildGeneralWhatsAppUrl,
  cx,
  safeArray,
  useBeans,
  usePersistentCart,
} from "../lib/coffeeStore";

function ImagePlaceholder({ className = "" }) {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-white/[0.04] to-transparent",
        className,
      )}
    >
      <div className="h-10 w-10 rounded-full border border-white/10" />
      <span className="font-body text-[10px] uppercase tracking-[0.16em] text-white/22">
        Photo coming soon
      </span>
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
                      <p className="font-display text-[17px] font-semibold tracking-[-0.02em] text-white">{item.name}</p>
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
                        className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05]"
                      >
                        −
                      </button>
                      <span className="font-body min-w-6 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseCartItem(item.id)}
                        className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05]"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-body text-sm font-semibold text-white">RM {Number(item.price || 0) * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-white/8 px-4 py-4 md:px-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/34">Total</p>
              <p className="font-display mt-1 text-[28px] font-semibold tracking-[-0.03em] text-white">RM {cartTotal}</p>
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

function SeriesCard({ bean, onAddToCart }) {
  const image = bean?.image
    ? appendImageParams(bean.image, { w: 1200, h: 1200, fit: "pad", fm: "webp", q: 84 })
    : "";

  return (
    <article className={cx("group overflow-hidden", PANEL)}>
      <Link to={`/coffee/${bean.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-[#11110f]">
          {image ? (
            <div className="flex h-full w-full items-center justify-center p-5">
              <img src={image} alt={bean.name} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]" />
            </div>
          ) : (
            <ImagePlaceholder className="aspect-square" />
          )}
        </div>
      </Link>

      <div className="p-5 md:p-6">
        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">{bean.category}</p>
        <h3 className="font-display mt-2 text-[28px] font-semibold leading-[0.96] tracking-[-0.03em] text-white">
          {bean.name}
        </h3>
        {bean.tagline ? (
          <p className="font-body mt-3 text-sm leading-7 text-white/58">{bean.tagline}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {safeArray(bean.notes).slice(0, 3).map((note) => (
            <span
              key={note}
              className="font-body rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/68"
            >
              {note}
            </span>
          ))}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <div className={cx("p-4", SOFT_PANEL)}>
            <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Process</p>
            <p className="font-body mt-2 text-sm leading-7 text-white/78">{bean.process || "—"}</p>
          </div>
          <div className={cx("p-4", SOFT_PANEL)}>
            <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">Price</p>
            <p className="font-display mt-2 text-[24px] font-semibold tracking-[-0.03em] text-white">RM {bean.price}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5 border-t border-white/8 pt-5">
          <Link to={`/coffee/${bean.slug}`} className={DARK_BUTTON}>
            View details
          </Link>
          <button type="button" onClick={() => onAddToCart(bean)} className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

function FlavorCompareCard({ title, body }) {
  return (
    <div className={cx("p-5 md:p-6", SOFT_PANEL)}>
      <p className="font-display text-[22px] font-semibold tracking-[-0.02em] text-white">{title}</p>
      <p className="font-body mt-3 text-sm leading-7 text-white/58">{body}</p>
    </div>
  );
}

export default function MonteblancoSeriesPage() {
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

  const monteblancoBeans = useMemo(() => {
    return beans.filter((item) =>
      [item.name, item.origin, item.collection]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes("monteblanco")),
    );
  }, [beans]);

  const bundleUrl = useMemo(
    () => buildBundleOrderUrl(monteblancoBeans.slice(0, 3), "Monteblanco Series"),
    [monteblancoBeans],
  );

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timeout);
  }, [toast]);

  function handleAddToCart(bean) {
    addToCart(bean);
    setCartOpen(true);
    setToast(`${bean.name} added to cart`);
  }

  function handleAddBundle() {
    const picks = monteblancoBeans.slice(0, 3);
    if (!picks.length) return;
    picks.forEach((item) => addToCart(item));
    setCartOpen(true);
    setToast("Monteblanco bundle added to cart");
  }

  return (
    <>
      <Seo
        title="Monteblanco Series | Drunk Coffee Roasters"
        description="Explore the Monteblanco Series by Drunk Coffee Roasters — fruit-forward coffees with expressive flavour profiles, available as single bags or bundle sets in Malaysia."
        url="/series/monteblanco"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Monteblanco Series",
          url: "https://drunkcoffeeroasters.com/series/monteblanco",
          description:
            "Fruit-forward coffees from the Monteblanco Series by Drunk Coffee Roasters."
        }}
      />

      <div className={cx("min-h-screen", APP_BG)}>
        <div className="pointer-events-none fixed inset-0 opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
        </div>

        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0d0b]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-14 object-contain md:h-[70px]" />
              </Link>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={buildGeneralWhatsAppUrl()}
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
            </div>
          </div>
        </header>

        <main className="relative z-[1] mx-auto max-w-7xl px-4 py-10 pb-28 md:px-6 md:py-14 md:pb-16">
          {error ? (
            <div className="mb-6 rounded-[22px] border border-amber-200/15 bg-amber-200/8 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          <section className={cx("p-6 md:p-8", PANEL)}>
            <p className={EYEBROW}>Series Page</p>
            <h1 className="font-display mt-4 text-[40px] font-semibold leading-[0.94] tracking-[-0.04em] text-white md:text-[62px]">
              The Monteblanco Series
            </h1>
            <p className="font-body mt-5 max-w-3xl text-sm leading-8 text-white/60 md:text-[16px]">
              A comparison-friendly set built around expressive fermentation, fruit-forward profiles, and the kind of coffees people buy as gifts, souvenirs, or for a more memorable daily brew.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={handleAddBundle} className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                Add full bundle to cart
              </button>
              <a href={bundleUrl} target="_blank" rel="noreferrer" className={DARK_BUTTON}>
                Order the bundle
              </a>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <FlavorCompareCard
              title="Fruit-forward"
              body="Built for drinkers who enjoy brighter, more expressive coffees with clearer fruit character in the cup."
            />
            <FlavorCompareCard
              title="Easy to compare"
              body="A better way to taste the producer line side by side and decide which profile you want to keep ordering."
            />
            <FlavorCompareCard
              title="Giftable"
              body="The kind of coffees people like to give away, bring home, or share with friends who want something more memorable."
            />
          </section>

          <section className="mt-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={EYEBROW}>Included coffees</p>
                <h2 className="font-display mt-3 text-[30px] font-semibold leading-[0.96] tracking-[-0.03em] text-white md:text-[42px]">
                  Explore the full set
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className={cx("h-[420px]", PANEL)} />
                <div className={cx("h-[420px]", PANEL)} />
                <div className={cx("h-[420px]", PANEL)} />
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {monteblancoBeans.slice(0, 3).map((bean) => (
                  <SeriesCard key={bean.id} bean={bean} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
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
          <div className="pointer-events-none fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/12 bg-[#efe8db] px-4 py-2 text-sm font-medium shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:bottom-5" style={LIGHT_BUTTON_STYLE}>
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}
