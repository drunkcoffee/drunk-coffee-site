import { ShoppingCart, Instagram } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FALLBACK_BEANS = [
  {
    id: "spring-bloom-blend",
    slug: "spring-bloom-blend",
    name: "Spring Bloom Blend",
    category: "Filter",
    collection: "Seasonal Highlight",
    price: 49,
    size: "200g",
    notes: ["Floral", "Citrus", "Silky Body"],
    description:
      "A clean and expressive blend that feels festive, floral, and easy to enjoy.",
    roast: "Light",
    origin: "Ethiopia Hambella Guji Goro · China Yunnan Lan Chang",
    process: "Washed + Anaerobic Natural Blend",
    featured: true,
    image: "",
  },
  {
    id: "lan-chang",
    slug: "lan-chang",
    name: "Lan Chang",
    category: "Filter",
    collection: "Experimental Fruit",
    price: 59,
    size: "200g",
    notes: ["Red Wine", "Raisin", "Wine Chocolate"],
    description:
      "A bold anaerobic natural from Baoshan, Yunnan. Expect red wine aromatics, raisin sweetness, and a smooth wine-chocolate finish.",
    roast: "Medium Light",
    origin: "China Yunnan",
    process: "Anaerobic Natural",
    featured: true,
    image: "",
  },
  {
    id: "south-blend",
    slug: "south-blend",
    name: "South Blend",
    category: "Espresso",
    collection: "Espresso Lovers",
    price: 49,
    size: "200g",
    notes: ["Mix Nut", "Chocolate", "Cherry"],
    description:
      "Comforting espresso blend built for daily milk drinks and approachable black coffee.",
    roast: "Medium",
    origin: "Brazil Fazendal Pinhal · Colombia Supremo",
    process: "Washed + Natural Blend",
    featured: false,
    image: "",
  },
];

const FILTERS = ["All", "Filter", "Espresso", "Omni"];
const COLLECTION_ORDER = [
  "Seasonal Highlight",
  "Clean Filter",
  "Everyday Filter",
  "Funky Process",
  "Experimental Fruit",
  "Espresso Lovers",
  "Coffee Selection",
];
const WHATSAPP_NUMBER = "601127060012";
const INSTAGRAM_URL = "https://instagram.com/drunkcoffeeroasters";
const XHS_LABEL = "Drunkcoffeeroasters";

function getEnv() {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }
  return {};
}

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeContentfulImage(asset) {
  const url = asset?.fields?.file?.url || asset?.url || "";
  if (!url) return "";
  const normalized = url.startsWith("//") ? `https:${url}` : url;
  return `${normalized}?w=1400&h=1400&fit=fill&fm=webp&q=85`;
}

function mapContentfulEntries(data) {
  const items = data?.items || [];
  const includes = data?.includes?.Asset || [];

  const assetMap = includes.reduce((acc, asset) => {
    acc[asset.sys.id] = asset;
    return acc;
  }, {});

  return items.map((item) => {
    const fields = item.fields || {};
    const imageId = fields.image?.sys?.id;
    const asset = imageId ? assetMap[imageId] : null;

    return {
      id: item.sys.id,
      slug: fields.slug || item.sys.id,
      name: fields.beanName || fields.name || "Untitled Coffee",
      category: fields.category || "Filter",
      collection: fields.collection || "Coffee Selection",
      price: Number(fields.price || 0),
      size: fields.size || "200g",
      notes: safeArray(fields.tastingNotes || fields.notes),
      description: fields.description || "",
      roast: fields.roast || "",
      origin: fields.origin || "",
      process: fields.process || "",
      featured: Boolean(fields.featured),
      image: normalizeContentfulImage(asset),
    };
  });
}

function getContentfulConfig() {
  const env = getEnv();

  return {
    spaceId: env.VITE_CONTENTFUL_SPACE_ID || "",
    environment: env.VITE_CONTENTFUL_ENVIRONMENT || "master",
    accessToken: env.VITE_CONTENTFUL_DELIVERY_TOKEN || "",
    contentType: env.VITE_CONTENTFUL_CONTENT_TYPE || "coffeeBean",
  };
}

async function fetchBeansFromContentful() {
  const { spaceId, environment, accessToken, contentType } =
    getContentfulConfig();

  if (!spaceId || !accessToken) {
    return {
      beans: FALLBACK_BEANS,
      warning:
        "Contentful environment variables are missing. Showing fallback coffee list.",
    };
  }

  const endpoint = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=${contentType}&include=2&order=fields.name`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Contentful request failed with status ${response.status}`);
  }

  const data = await response.json();
  const mapped = mapContentfulEntries(data);

  return {
    beans: mapped.length ? mapped : FALLBACK_BEANS,
    warning: mapped.length
      ? ""
      : "Contentful returned no coffee entries. Showing fallback coffee list.",
  };
}

function buildSingleOrderUrl(bean) {
  const message = `Hi Drunk Coffee Roasters, I want to order:\n\n${bean.name} - ${bean.size}\nCategory: ${bean.category}\nPrice: RM ${bean.price}\n\nPlease share availability.\nThanks.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function collectionAccentClasses(name) {
  const map = {
    "Seasonal Highlight": "from-amber-200/15 to-rose-200/10",
    "Clean Filter": "from-sky-200/12 to-white/5",
    "Everyday Filter": "from-emerald-200/12 to-white/5",
    "Funky Process": "from-fuchsia-200/12 to-violet-200/10",
    "Experimental Fruit": "from-orange-200/12 to-pink-200/10",
    "Espresso Lovers": "from-amber-900/18 to-stone-200/5",
  };
  return map[name] || "from-white/[0.04] to-white/[0.02]";
}

function runSelfChecks() {
  const checks = [
    {
      name: "safeArray handles comma-separated string",
      pass:
        JSON.stringify(safeArray("A, B, C")) ===
        JSON.stringify(["A", "B", "C"]),
    },
    {
      name: "safeArray handles array input",
      pass:
        JSON.stringify(safeArray(["A", "B"])) ===
        JSON.stringify(["A", "B"]),
    },
    {
      name: "normalizeContentfulImage handles empty asset",
      pass: normalizeContentfulImage(null) === "",
    },
    {
      name: "getContentfulConfig never throws without import.meta.env",
      pass: typeof getContentfulConfig() === "object",
    },
    {
      name: "single order url includes bean name",
      pass: buildSingleOrderUrl(FALLBACK_BEANS[0]).includes("Spring%20Bloom%20Blend"),
    },
  ];

  const failed = checks.filter((check) => !check.pass);
  if (failed.length > 0) {
    console.warn("Self-checks failed:", failed);
  }
}

runSelfChecks();

function CoffeeCard({ bean, onOpen, onAddToCart }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.06]">
      <button
        type="button"
        onClick={() => onOpen(bean)}
        className="block w-full text-left"
      >
        <div className="aspect-[4/3] overflow-hidden bg-white/5">
          {bean.image ? (
            <img
              src={bean.image}
              alt={bean.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/35">
              Add Contentful image
            </div>
          )}
        </div>
      </button>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">
              {bean.category}
            </p>
            <h3 className="mt-2 text-xl font-semibold md:text-2xl">{bean.name}</h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70">
            {bean.size}
          </span>
        </div>

        <p className="mt-4 line-clamp-2 text-sm font-medium leading-7 text-white/75">
          {bean.origin || "Origin TBC"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {bean.notes.map((note) => (
            <span
              key={note}
              className="rounded-full bg-white/[0.08] px-3 py-1 text-sm text-white/75"
            >
              {note}
            </span>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Price</p>
            <p className="text-xl font-semibold">RM {bean.price}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpen(bean)}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5"
            >
              Details
            </button>
            <button
              type="button"
              onClick={() => onAddToCart(bean)}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function DrunkCoffeeRoastersStorefront() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [beans, setBeans] = useState(FALLBACK_BEANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBean, setSelectedBean] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadBeans() {
      try {
        setLoading(true);
        setError("");
        const result = await fetchBeansFromContentful();
        if (!isMounted) return;
        setBeans(result.beans);
        if (result.warning) setError(result.warning);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setBeans(FALLBACK_BEANS);
          setError(
            "Could not load Contentful content. Showing fallback coffee list."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBeans();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBeans = useMemo(() => {
    if (activeFilter === "All") return beans;
    return beans.filter((bean) => bean.category === activeFilter);
  }, [activeFilter, beans]);

  const featured = useMemo(
    () => beans.filter((bean) => bean.featured).slice(0, 3),
    [beans]
  );

  const collectionMeta = {
    "Seasonal Highlight": {
      title: "Seasonal Highlight",
      subtitle: "Limited coffees and seasonal releases worth starting with.",
    },
    "Clean Filter": {
      title: "Clean Filter",
      subtitle: "Elegant, structured cups with classic specialty clarity.",
    },
    "Everyday Filter": {
      title: "Everyday Filter",
      subtitle: "Expressive daily drinkers that stay easy to enjoy.",
    },
    "Funky Process": {
      title: "Funky Process",
      subtitle: "Fermentation-forward coffees with extra character and fruit.",
    },
    "Experimental Fruit": {
      title: "Experimental Fruit",
      subtitle: "Fruit-driven coffees with modern processing and louder profiles.",
    },
    "Espresso Lovers": {
      title: "Espresso Lovers",
      subtitle: "Comforting coffees for espresso, milk drinks, and daily use.",
    },
  };

  const beansByCollection = useMemo(() => {
    return filteredBeans.reduce((acc, bean) => {
      const key = bean.collection || "Coffee Selection";
      if (!acc[key]) acc[key] = [];
      acc[key].push(bean);
      return acc;
    }, {});
  }, [filteredBeans]);

  const orderedCollections = useMemo(() => {
    return Object.keys(beansByCollection).sort((a, b) => {
      const aIndex = COLLECTION_ORDER.indexOf(a);
      const bIndex = COLLECTION_ORDER.indexOf(b);
      const safeA = aIndex === -1 ? 999 : aIndex;
      const safeB = bIndex === -1 ? 999 : bIndex;
      return safeA - safeB;
    });
  }, [beansByCollection]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  function addToCart(bean) {
    setCart((current) => {
      const existing = current.find((item) => item.id === bean.id);
      if (existing) {
        return current.map((item) =>
          item.id === bean.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          id: bean.id,
          name: bean.name,
          price: bean.price,
          size: bean.size,
          category: bean.category,
          quantity: 1,
        },
      ];
    });
    setCartOpen(true);
  }

  function decreaseCartItem(itemId) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseCartItem(itemId) {
    setCart((current) =>
      current.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function removeCartItem(itemId) {
    setCart((current) => current.filter((item) => item.id !== itemId));
  }

  function clearCart() {
    setCart([]);
  }

  const openGeneralWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I would like to browse your coffee menu."
  )}`;

  const cartWhatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    cart.length
      ? `Hi Drunk Coffee Roasters, I want to place an order:\n\n${cart
          .map(
            (item) =>
              `• ${item.name} (${item.size}) x${item.quantity} — RM ${
                Number(item.price || 0) * item.quantity
              }`
          )
          .join("\n")}\n\nTotal: RM ${cartTotal}\n\nPlease confirm availability. Thanks.`
      : "Hi Drunk Coffee Roasters, I would like to place an order."
  )}`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <a href="#top" className="block">
            <img
              src="/logo.png"
              alt="Drunk Coffee Roasters"
              className="h-12 object-contain md:h-14"
            />
          </a>

          <div className="flex items-center gap-4">
            <a
              href="#beans"
              className="hidden text-sm text-white/80 transition hover:text-white md:block"
            >
              Shop
            </a>

            <a
              href="#about"
              className="hidden text-sm text-white/80 transition hover:text-white md:block"
            >
              About
            </a>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center text-white/80 transition hover:text-white"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-black">
                  {cartCount}
                </span>
              )}
            </button>

            <a
              href={openGeneralWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="transition hover:scale-110"
              aria-label="WhatsApp"
            >
              <img
                src="https://cdn.simpleicons.org/whatsapp/ffffff"
                alt="WhatsApp"
                className="h-5 w-5 opacity-80 transition hover:opacity-100"
              />
            </a>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="transition hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram
                size={20}
                className="opacity-80 transition hover:opacity-100"
              />
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-7xl px-5 py-14 md:px-6 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                Johor Specialty Coffee Roaster
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] md:text-6xl">
                Specialty coffee, roasted to make brewing easier.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-white/68 md:text-lg">
                Espresso, filter, and omni-roast coffees built for cleaner choices,
                simpler ordering, and better daily cups.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#beans"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                >
                  Shop Beans
                </a>

                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="rounded-2xl border border-white/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Open Cart
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Espresso
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Filter
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                  Omni
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[38px] bg-white/5 blur-3xl" />

              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
                <img
                  src="/hero-coffee.jpg"
                  alt="Drunk Coffee Roasters specialty coffee"
                  className="h-[560px] w-full object-cover md:h-[620px]"
                />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 md:p-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">
                    Drunk Coffee Roasters
                  </p>
                  <p className="mt-2 max-w-md text-2xl font-semibold leading-tight md:text-3xl">
                    Roasted for everyday brewing, with less guesswork and more clarity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="mx-auto max-w-7xl px-5 pb-6 md:px-6 md:pb-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/42">
                  Featured coffees
                </p>
                <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
                  Start with these picks
                </h2>
              </div>

              <p className="max-w-xl text-sm leading-7 text-white/62">
                A shorter starting point for customers who want the most approachable coffees first.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {featured.map((bean) => (
                <CoffeeCard
                  key={bean.id}
                  bean={bean}
                  onOpen={setSelectedBean}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section id="beans" className="mx-auto max-w-7xl px-5 py-12 md:px-6 md:py-16">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/42">
                Coffee menu
              </p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
                Shop by brew style
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      isActive
                        ? "bg-white text-neutral-950"
                        : "border border-white/10 text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 border-b border-white/10 pb-5 text-sm text-white/50">
            <p>
              Showing <span className="text-white/80">{filteredBeans.length}</span>{" "}
              coffee{filteredBeans.length > 1 ? "s" : ""}
            </p>
            <p className="hidden md:block">
              {loading ? "Loading from Contentful..." : "Live from Contentful."}
            </p>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              {error}
            </div>
          ) : null}

          {filteredBeans.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center">
              <p className="text-lg font-semibold">No beans found</p>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Try another filter, or publish more coffee entries in Contentful.
              </p>
            </div>
          ) : (
            <div className="mt-10 space-y-12">
              {orderedCollections.map((collectionKey) => {
                const collectionBeans = beansByCollection[collectionKey] || [];
                const meta = collectionMeta[collectionKey] || {
                  title: collectionKey,
                  subtitle: "Coffee selection",
                };

                return (
                  <section key={collectionKey} className="space-y-6">
                    <div
                      className={`rounded-[32px] border border-white/10 bg-gradient-to-br p-6 md:p-8 ${collectionAccentClasses(
                        collectionKey
                      )}`}
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.22em] text-white/45">
                            Collection
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold md:text-3xl">
                            {meta.title}
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">
                            {meta.subtitle}
                          </p>
                        </div>
                        <p className="text-sm text-white/38">
                          {collectionBeans.length} coffee{collectionBeans.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {collectionBeans.map((bean) => (
                        <CoffeeCard
                          key={bean.id}
                          bean={bean}
                          onOpen={setSelectedBean}
                          onAddToCart={addToCart}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>

        <section id="about" className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-7">
                <p className="text-sm uppercase tracking-[0.22em] text-white/42">
                  About
                </p>
                <h2 className="mt-2 text-3xl font-semibold">
                  From training mornings to specialty roasting.
                </h2>
                <p className="mt-5 text-sm leading-8 text-white/68">
                  Drunk Coffee Roasters was founded by Lun, whose coffee journey began through
                  fitness, early mornings, and the search for better daily coffee.
                </p>
                <p className="mt-4 text-sm leading-8 text-white/68">
                  Today, the goal is simple: roast coffees that are easier to choose, easier to
                  brew, and more enjoyable to drink.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-lg font-semibold">WhatsApp ordering</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Build your cart first, then send one cleaner order request through WhatsApp.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-lg font-semibold">Fresh Roasted</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Roasted in small batches to keep clarity, sweetness and consistency in every cup.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:col-span-2">
                  <p className="text-lg font-semibold">Where to find us</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Instagram: @drunkcoffeeroasters · 小红书: {XHS_LABEL}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selectedBean ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 md:items-center">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[32px] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="aspect-square bg-white/5 lg:h-full lg:min-h-[620px]">
                {selectedBean.image ? (
                  <img
                    src={selectedBean.image}
                    alt={selectedBean.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/35">
                    Add Contentful image
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                      {selectedBean.collection || selectedBean.category}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold md:text-4xl">
                      {selectedBean.name}
                    </h3>
                    <p className="mt-3 text-sm font-medium text-white/70">
                      {selectedBean.origin || "Origin TBC"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBean(null)}
                    className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedBean.notes.map((note) => (
                    <span
                      key={note}
                      className="rounded-full bg-white/[0.08] px-3 py-1 text-sm text-white/75"
                    >
                      {note}
                    </span>
                  ))}
                </div>

                <p className="mt-6 text-base leading-8 text-white/68">
                  {selectedBean.description || "Description coming soon."}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white/40">Origin</p>
                    <p className="mt-2 text-white/85">{selectedBean.origin || "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white/40">Roast</p>
                    <p className="mt-2 text-white/85">{selectedBean.roast || "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white/40">Process</p>
                    <p className="mt-2 text-white/85">{selectedBean.process || "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white/40">Size</p>
                    <p className="mt-2 text-white/85">{selectedBean.size || "—"}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/40">Price</p>
                    <p className="mt-2 text-3xl font-semibold">RM {selectedBean.price}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => addToCart(selectedBean)}
                      className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                    >
                      Add to cart
                    </button>
                    <a
                      href={buildSingleOrderUrl(selectedBean)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                    >
                      Order on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cartOpen ? (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/60">
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="flex-1 cursor-default"
            aria-label="Close cart overlay"
          />
          <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-neutral-950 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-lg font-semibold">Your cart</p>
                <p className="mt-1 text-sm text-white/50">
                  {cartCount} item{cartCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/5"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-5">
              {cart.length === 0 ? (
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center">
                  <p className="text-lg font-semibold">Cart is empty</p>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    Add a few coffees, then send one combined order through WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{item.name}</p>
                          <p className="mt-1 text-sm text-white/55">
                            {item.category} · {item.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="text-sm text-white/45 transition hover:text-white"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decreaseCartItem(item.id)}
                            className="h-9 w-9 rounded-full border border-white/10 text-sm text-white/80 transition hover:bg-white/5"
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => increaseCartItem(item.id)}
                            className="h-9 w-9 rounded-full border border-white/10 text-sm text-white/80 transition hover:bg-white/5"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-base font-semibold">
                          RM {Number(item.price || 0) * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-5 py-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-white/55">Total</p>
                <p className="text-2xl font-semibold">RM {cartTotal}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 transition hover:bg-white/5"
                >
                  Clear
                </button>
                <a
                  href={cartWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex-1 rounded-2xl px-4 py-3 text-center text-sm font-medium transition ${
                    cart.length
                      ? "bg-white text-neutral-950 hover:opacity-90"
                      : "pointer-events-none border border-white/10 text-white/35"
                  }`}
                >
                  Order all on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-white/55 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="font-medium text-white/80">Drunk Coffee Roasters</p>
            <p className="mt-1">
              Specialty coffee roasted for espresso, filter, and everyday brewing.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="#beans"
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/5"
            >
              Shop
            </a>
            <a
              href="#about"
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/5"
            >
              About
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/5"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}