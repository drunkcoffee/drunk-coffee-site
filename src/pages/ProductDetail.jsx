import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Instagram,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  buildSingleOrderUrl,
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

function InfoPill({ children }) {
  if (!children) return null;
  return (
    <span className="font-body rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/68">
      {children}
    </span>
  );
}

function DetailCard({ label, value }) {
  if (!value) return null;
  return (
    <div className={cx("p-4 md:p-5", SOFT_PANEL)}>
      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
        {label}
      </p>
      <p className="font-body mt-2 text-sm leading-7 text-white/78">{value}</p>
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
                        className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05]"
                      >
                        −
                      </button>
                      <span className="font-body min-w-6 text-center text-sm font-medium text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increaseCartItem(item.id)}
                        className="font-body flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/74 transition hover:bg-white/[0.05]"
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

function RelatedCard({ bean, onAddToCart }) {
  const image = bean?.image
    ? appendImageParams(bean.image, {
        w: 900,
        h: 900,
        fit: "pad",
        fm: "webp",
        q: 84,
      })
    : "";

  return (
    <div className={cx("group overflow-hidden", PANEL)}>
      <Link to={`/coffee/${bean.slug}`} className="block">
        <div className="aspect-[5/4] overflow-hidden bg-[#11110f]">
          {image ? (
            <div className="flex h-full w-full items-center justify-center p-5">
              <img
                src={image}
                alt={bean.name}
                className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
              />
            </div>
          ) : (
            <ImagePlaceholder className="h-full" />
          )}
        </div>
      </Link>

      <div className="p-5">
        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
          {bean.category}
        </p>
        <h3 className="font-display mt-2 text-[24px] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
          {bean.name}
        </h3>
        {bean.tagline ? (
          <p className="font-body mt-3 text-sm leading-7 text-white/58">
            {bean.tagline}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {safeArray(bean.notes)
            .slice(0, 3)
            .map((note) => (
              <InfoPill key={note}>{note}</InfoPill>
            ))}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/8 pt-5">
          <div>
            <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/34">
              Price
            </p>
            <p className="font-display mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
              RM {bean.price}
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link to={`/coffee/${bean.slug}`} className={DARK_BUTTON}>
              View
            </Link>
            <button
              type="button"
              onClick={() => onAddToCart(bean)}
              className={LIGHT_BUTTON}
              style={LIGHT_BUTTON_STYLE}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRecommendedBrew(bean) {
  if (!bean) return "";
  if (bean.category === "Espresso") return "Espresso · Milk drinks · Black";
  return "V60 · Orea · AeroPress";
}

function getRoastedFor(bean) {
  if (!bean) return "";
  if (bean.category === "Espresso") {
    return "Sweetness, texture, and a cleaner daily espresso profile.";
  }
  return "Clarity, fragrance, and an expressive cup with easy daily brewing.";
}

function getWhoItsFor(bean) {
  if (!bean) return "";
  const notes = safeArray(bean.notes).join(", ").toLowerCase();
  if (bean.category === "Espresso") {
    return "Best for drinkers who want a more reliable everyday cup, especially for espresso or milk-based drinks.";
  }
  if (notes.includes("floral")) {
    return "Best for drinkers who enjoy lighter, tea-like cups with more fragrance and lift.";
  }
  if (
    notes.includes("mango") ||
    notes.includes("berry") ||
    notes.includes("apple") ||
    notes.includes("fruit") ||
    notes.includes("orange")
  ) {
    return "Best for people who enjoy brighter, fruit-forward coffees with more character in the cup.";
  }
  return "Best for drinkers who want a clean, balanced coffee that is easy to enjoy and easy to repeat.";
}

function formatBrewGuide(text) {
  if (!text) return [];
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ProductDetail() {
  const { slug } = useParams();
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

  const bean = useMemo(
    () => beans.find((item) => item.slug === slug),
    [beans, slug],
  );

  const currentIndex = useMemo(
    () => beans.findIndex((item) => item.slug === slug),
    [beans, slug],
  );

  const previousBean = currentIndex > 0 ? beans[currentIndex - 1] : null;
  const nextBean =
    currentIndex >= 0 && currentIndex < beans.length - 1
      ? beans[currentIndex + 1]
      : null;

  const relatedBeans = useMemo(() => {
    if (!bean) return [];
    return beans
      .filter((item) => item.slug !== bean.slug && item.category === bean.category)
      .slice(0, 3);
  }, [beans, bean]);

  const monteblancoBeans = useMemo(() => {
    return beans.filter((item) =>
      [item.name, item.origin, item.collection]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes("monteblanco")),
    );
  }, [beans]);

  const isMonteblancoBean = useMemo(() => {
    if (!bean) return false;
    return [bean.name, bean.origin, bean.collection]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes("monteblanco"));
  }, [bean]);

  const monteblancoBundleUrl = useMemo(() => {
    return buildBundleOrderUrl(monteblancoBeans.slice(0, 3), "Monteblanco Series");
  }, [monteblancoBeans]);

  const detailImage = bean?.image
    ? appendImageParams(bean.image, {
        w: 1800,
        h: 1800,
        fit: "pad",
        fm: "webp",
        q: 86,
      })
    : "";

  const detailFlavorImage = bean?.flavorImage
    ? appendImageParams(bean.flavorImage, {
        w: 1600,
        h: 1600,
        fit: "pad",
        fm: "webp",
        q: 86,
      })
    : "";

  const brewGuideLines = formatBrewGuide(bean?.brewguide);

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

  function handleAddToCart(targetBean = bean) {
    if (!targetBean) return;
    addToCart(targetBean);
    setCartOpen(true);
    setToast(`${targetBean.name} added to cart`);
  }

  function handleAddMonteblancoBundle() {
    const picks = monteblancoBeans.slice(0, 3);
    if (!picks.length) return;
    picks.forEach((item) => addToCart(item));
    setCartOpen(true);
    setToast("Monteblanco bundle added to cart");
  }

  if (!loading && !bean) {
    return (
      <div className={cx("min-h-screen", APP_BG)}>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className={EYEBROW}>Not found</p>
          <h1 className="font-display mt-4 text-[40px] font-semibold tracking-[-0.04em] text-white">
            Coffee not found
          </h1>
          <p className="font-body mt-4 max-w-md text-sm leading-7 text-white/54">
            This coffee may have been unpublished or the slug has changed.
          </p>
          <Link
            to="/"
            className={cx(LIGHT_BUTTON, "mt-8")}
            style={LIGHT_BUTTON_STYLE}
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={bean ? `${bean.name} | Drunk Coffee Roasters` : "Coffee Detail"}
        description={bean?.description || "Specialty coffee from Drunk Coffee Roasters."}
        url={bean ? `/coffee/${bean.slug}` : "/"}
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
                <img
                  src="/logo.png"
                  alt="Drunk Coffee Roasters"
                  className="h-14 object-contain md:h-[70px]"
                />
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
            </div>
          </div>
        </header>

        <main className="relative z-[1] mx-auto max-w-7xl px-4 py-10 pb-28 md:px-6 md:py-14 md:pb-16">
          {error ? (
            <div className="mb-6 rounded-[22px] border border-amber-200/15 bg-amber-200/8 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className={cx("grid gap-6 lg:grid-cols-[0.95fr_1.05fr]", PANEL, "p-6 md:p-8")}>
              <div className="aspect-square animate-pulse rounded-[22px] bg-white/[0.05]" />
              <div className="space-y-4">
                <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                <div className="h-10 w-72 animate-pulse rounded bg-white/10" />
                <div className="h-5 w-80 animate-pulse rounded bg-white/10" />
                <div className="h-28 w-full animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ) : bean ? (
            <>
              <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div className={cx("overflow-hidden p-5 md:p-7", PANEL)}>
                  <div className="overflow-hidden rounded-[24px] bg-[#11110f]">
                    {detailImage ? (
                      <div className="flex aspect-square w-full items-center justify-center p-6 md:p-10">
                        <img
                          src={detailImage}
                          alt={bean.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <ImagePlaceholder className="aspect-square" />
                    )}
                  </div>
                </div>

                <div className={cx("p-6 md:p-8", PANEL)}>
                  {bean.collection ? <p className={EYEBROW}>{bean.collection}</p> : null}
                  <p className="font-body mt-2 text-[10px] uppercase tracking-[0.18em] text-white/42">
                    {bean.category}
                  </p>
                  <h1 className="font-display mt-3 text-[36px] font-semibold leading-[0.94] tracking-[-0.04em] text-white md:text-[56px]">
                    {bean.name}
                  </h1>
                  {bean.tagline ? (
                    <p className="font-body mt-4 max-w-2xl text-base leading-8 text-white/68 md:text-[18px]">
                      {bean.tagline}
                    </p>
                  ) : null}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {safeArray(bean.notes).map((note) => (
                      <InfoPill key={note}>{note}</InfoPill>
                    ))}
                  </div>

                  <p className="font-body mt-6 text-sm leading-8 text-white/60 md:text-[15px]">
                    {bean.description || "Description coming soon."}
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <DetailCard label="Roasted for" value={getRoastedFor(bean)} />
                    <DetailCard label="Best for" value={bean.bestFor || getWhoItsFor(bean)} />
                    <DetailCard label="Recommended brew" value={getRecommendedBrew(bean)} />
                    <DetailCard label="Who this is for" value={getWhoItsFor(bean)} />
                  </div>

                  <div className="mt-7 flex flex-col gap-4 border-t border-white/8 pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="font-body text-[10px] uppercase tracking-[0.16em] text-white/34">
                        Price
                      </p>
                      <p className="font-body mt-1 text-[30px] font-semibold tracking-[-0.02em] text-white">
                        RM {bean.price}
                      </p>
                    </div>

                    <div className="hidden flex-wrap gap-2.5 sm:flex sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(bean)}
                        className={DARK_BUTTON}
                      >
                        Add to cart
                      </button>
                      <a
                        href={buildSingleOrderUrl(bean)}
                        target="_blank"
                        rel="noreferrer"
                        className={LIGHT_BUTTON}
                        style={LIGHT_BUTTON_STYLE}
                      >
                        Order on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className={cx("p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Coffee details</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <DetailCard label="Origin" value={bean.origin} />
                    <DetailCard label="Process" value={bean.process} />
                    <DetailCard label="Roast" value={bean.roast} />
                    <DetailCard label="Variety" value={bean.variety} />
                    <DetailCard label="Size" value={bean.size} />
                    <DetailCard label="Category" value={bean.category} />
                  </div>
                </div>

                {detailFlavorImage ? (
                  <div className={cx("overflow-hidden p-6 md:p-8", PANEL)}>
                    <p className={EYEBROW}>Tastes like</p>
                    <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-[#11110f]">
                      <img
                        src={detailFlavorImage}
                        alt={`${bean.name} flavour visual`}
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  </div>
                ) : null}
              </section>

              {brewGuideLines.length > 0 ? (
                <section className={cx("mt-6 p-6 md:p-8", PANEL)}>
                  <p className={EYEBROW}>Brew Guide</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {brewGuideLines.map((line, index) => (
                      <div key={`${line}-${index}`} className={cx("p-4", SOFT_PANEL)}>
                        <p className="font-body text-sm leading-7 text-white/78">{line}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {isMonteblancoBean && monteblancoBeans.length >= 2 ? (
                <section className={cx("mt-6 p-6 md:p-8", PANEL)}>
                  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className={EYEBROW}>Monteblanco Series</p>
                      <h2 className="font-display mt-3 text-[28px] font-semibold leading-[0.96] tracking-[-0.03em] text-white md:text-[40px]">
                        Explore the full set
                      </h2>
                      <p className="font-body mt-4 max-w-2xl text-sm leading-8 text-white/58 md:text-[15px]">
                        Compare the fruit-forward expressions side by side and add the full set in one go.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <Link to="/series/monteblanco" className={DARK_BUTTON}>
                        View full series
                      </Link>
                      <button
                        type="button"
                        onClick={handleAddMonteblancoBundle}
                        className={DARK_BUTTON}
                      >
                        Add bundle to cart
                      </button>
                      <a
                        href={monteblancoBundleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={LIGHT_BUTTON}
                        style={LIGHT_BUTTON_STYLE}
                      >
                        Order the bundle
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {monteblancoBeans.slice(0, 3).map((item) => (
                      <RelatedCard
                        key={item.id}
                        bean={item}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {(previousBean || nextBean) ? (
                <section className="mt-6 grid gap-4 md:grid-cols-2">
                  {previousBean ? (
                    <Link
                      to={`/coffee/${previousBean.slug}`}
                      className={cx("group flex items-center justify-between p-5 md:p-6", SOFT_PANEL)}
                    >
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
                          Previous coffee
                        </p>
                        <p className="font-display mt-2 text-[20px] font-semibold text-white group-hover:text-[#efe8db]">
                          {previousBean.name}
                        </p>
                      </div>
                      <ChevronLeft className="text-white/42 transition group-hover:text-white" />
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextBean ? (
                    <Link
                      to={`/coffee/${nextBean.slug}`}
                      className={cx("group flex items-center justify-between p-5 md:p-6", SOFT_PANEL)}
                    >
                      <div>
                        <p className="font-body text-[10px] uppercase tracking-[0.18em] text-white/34">
                          Next coffee
                        </p>
                        <p className="font-display mt-2 text-[20px] font-semibold text-white group-hover:text-[#efe8db]">
                          {nextBean.name}
                        </p>
                      </div>
                      <ChevronRight className="text-white/42 transition group-hover:text-white" />
                    </Link>
                  ) : null}
                </section>
              ) : null}

              {relatedBeans.length > 0 ? (
                <section className="mt-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className={EYEBROW}>You may also like</p>
                      <h2 className="font-display mt-3 text-[28px] font-semibold leading-[0.96] tracking-[-0.03em] text-white md:text-[38px]">
                        More coffees to explore
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {relatedBeans.map((item) => (
                      <RelatedCard
                        key={item.id}
                        bean={item}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </main>

        {bean ? (
          <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-white/10 bg-[#0d0d0b]/95 p-3 backdrop-blur-xl sm:hidden">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <button
                type="button"
                onClick={() => handleAddToCart(bean)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/78 transition hover:bg-white/[0.08]"
                aria-label="Add to cart"
              >
                <ShoppingCart size={18} />
              </button>

              <a
                href={buildSingleOrderUrl(bean)}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 items-center justify-between rounded-full bg-[#efe8db] px-5 py-3.5 text-sm font-semibold"
                style={LIGHT_BUTTON_STYLE}
              >
                <span className="truncate">Order on WhatsApp</span>
                <span className="ml-4 shrink-0">RM {bean.price}</span>
              </a>
            </div>
          </div>
        ) : null}

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
            className="pointer-events-none fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-white/12 bg-[#efe8db] px-4 py-2 text-sm font-medium shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:bottom-5"
            style={LIGHT_BUTTON_STYLE}
          >
            {toast}
          </div>
        ) : null}
      </div>
    </>
  );
}
