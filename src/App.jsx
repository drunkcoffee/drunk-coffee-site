import { useEffect, useMemo, useState } from "react";

const FALLBACK_BEANS = [
  {
    id: "south-blend",
    slug: "south-blend",
    name: "South Blend",
    category: "Espresso",
    price: 38,
    size: "200g",
    notes: ["Chocolate", "Nutty", "Creamy"],
    description:
      "Comforting daily espresso with low acidity and a round body.",
    roast: "Medium",
    origin: "Blend",
    featured: true,
    image: "",
  },
  {
    id: "spring-bloom",
    slug: "spring-bloom",
    name: "Spring Bloom",
    category: "Filter",
    price: 48,
    size: "200g",
    notes: ["Jasmine", "Peach", "Tea-like"],
    description:
      "Clean and floral with a soft, sweet finish for hand brew.",
    roast: "Light",
    origin: "Ethiopia",
    featured: true,
    image: "",
  },
  {
    id: "horizon",
    slug: "horizon",
    name: "Horizon",
    category: "Omni",
    price: 42,
    size: "200g",
    notes: ["Citrus", "Caramel", "Balanced"],
    description:
      "Flexible roast profile that works for both espresso and filter.",
    roast: "Medium",
    origin: "Colombia",
    featured: false,
    image: "",
  },
];

const FILTERS = ["All", "Espresso", "Filter", "Omni"];
const WHATSAPP_NUMBER = "601127060012";

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
  return `${normalized}?w=900&h=900&fit=fill&fm=webp&q=80`;
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
      name: fields.name || "Untitled Coffee",
      category: fields.category || "Filter",
      price: Number(fields.price || 0),
      size: fields.size || "200g",
      notes: safeArray(fields.notes),
      description: fields.description || "",
      roast: fields.roast || "",
      origin: fields.origin || "",
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

function buildWhatsAppUrl(bean) {
  const message = `Hi Drunk Coffee Roasters, I want to order:\n\n${bean.name} - ${bean.size}\nCategory: ${bean.category}\nPrice: RM ${bean.price}\n\nPlease share availability.\nThanks.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function runSelfChecks() {
  const checks = [
    {
      name: "safeArray handles comma-separated string",
      pass:
        JSON.stringify(safeArray("A, B, C")) === JSON.stringify(["A", "B", "C"]),
    },
    {
      name: "safeArray handles array input",
      pass:
        JSON.stringify(safeArray(["A", "B"])) === JSON.stringify(["A", "B"]),
    },
    {
      name: "normalizeContentfulImage handles empty asset",
      pass: normalizeContentfulImage(null) === "",
    },
    {
      name: "getContentfulConfig never throws without import.meta.env",
      pass: typeof getContentfulConfig() === "object",
    },
  ];

  const failed = checks.filter((check) => !check.pass);
  if (failed.length > 0) {
    console.warn("Self-checks failed:", failed);
  }
}

runSelfChecks();

export default function DrunkCoffeeRoastersStorefront() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [beans, setBeans] = useState(FALLBACK_BEANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBeans() {
      try {
        setLoading(true);
        setError("");
        const result = await fetchBeansFromContentful();
        if (!isMounted) return;
        setBeans(result.beans);
        if (result.warning) {
          setError(result.warning);
        }
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

  const openGeneralWhatsApp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Drunk Coffee Roasters, I would like to browse your coffee menu."
  )}`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <a href="#top" className="block">
            <p className="text-lg font-semibold tracking-wide md:text-2xl">
              Drunk Coffee Roasters
            </p>
            <p className="mt-1 text-xs text-white/55 md:text-sm">
              Fresh roasted coffee for espresso and filter
            </p>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="#beans"
              className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 md:inline-flex"
            >
              Shop Beans
            </a>
            <a
              href={openGeneralWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90"
            >
              WhatsApp Order
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                Johor-based specialty coffee roaster
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
                Coffee built around how people actually brew and drink.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                A simple online menu with fewer filters, clearer choices, and
                direct WhatsApp ordering. Start with brew style first, then
                choose the flavor profile you want.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#beans"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                >
                  Browse Coffee
                </a>
                <a
                  href="#about"
                  className="rounded-2xl border border-white/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  About The Roastery
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/60">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Espresso
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Filter
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Omni
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-sm text-white/45">Main filters</p>
                <p className="mt-2 text-2xl font-semibold">
                  All · Espresso · Filter · Omni
                </p>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  The first decision is brew style, not technical coffee jargon.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-sm text-white/45">CMS-ready</p>
                <p className="mt-2 text-2xl font-semibold">
                  Contentful connected
                </p>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Add beans and photos in Contentful and the site updates after a
                  new deploy.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:col-span-2">
                <p className="text-sm text-white/45">Brand direction</p>
                <p className="mt-2 text-white/78 leading-7">
                  Clean, premium, minimal. This format fits Drunk Coffee Roasters
                  better because it feels curated instead of overloaded.
                </p>
              </div>
            </div>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="mx-auto max-w-7xl px-5 pb-8 md:px-6">
            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/42">
                    Featured coffees
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
                    A few good starting points
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-white/62">
                  Keep this section short. It helps first-time buyers decide
                  faster before they browse the full menu.
                </p>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {featured.map((bean) => (
                  <div
                    key={bean.id}
                    className="rounded-[24px] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                          {bean.category}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">
                          {bean.name}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">
                        {bean.size}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/65">
                      {bean.notes.join(" · ")}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-lg font-semibold">RM {bean.price}</p>
                      <a
                        href={buildWhatsAppUrl(bean)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                      >
                        Order
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="beans" className="mx-auto max-w-7xl px-5 py-14 md:px-6 md:py-16">
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
              {loading
                ? "Loading from Contentful..."
                : "Simple filters. Clearer buying decisions."}
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
                Try another filter, or add more coffee entries in Contentful.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredBeans.map((bean) => (
                <article
                  key={bean.id}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.06]"
                >
                  <div className="aspect-square bg-white/5">
                    {bean.image ? (
                      <img
                        src={bean.image}
                        alt={bean.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/30">
                          Drunk Coffee
                        </p>
                        <p className="mt-2 text-lg font-medium text-white/70">
                          {bean.name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                          {bean.category}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">
                          {bean.name}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70">
                        {bean.size}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {bean.notes.map((note) => (
                        <span
                          key={note}
                          className="rounded-full bg-white/[0.07] px-3 py-1 text-sm text-white/75"
                        >
                          {note}
                        </span>
                      ))}
                    </div>

                    <p className="mt-5 text-sm leading-7 text-white/65">
                      {bean.description}
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/58">
                      <div className="rounded-2xl border border-white/10 p-3">
                        <p className="text-white/40">Origin</p>
                        <p className="mt-1 text-white/80">{bean.origin || "—"}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 p-3">
                        <p className="text-white/40">Roast</p>
                        <p className="mt-1 text-white/80">{bean.roast || "—"}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/45">Price</p>
                        <p className="text-xl font-semibold">RM {bean.price}</p>
                      </div>
                      <a
                        href={buildWhatsAppUrl(bean)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                      >
                        Order Now
                      </a>
                    </div>
                  </div>
                </article>
              ))}
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
                  Roasted for daily drinking and clear flavor.
                </h2>
                <p className="mt-5 text-sm leading-8 text-white/68">
                  Drunk Coffee Roasters is built around practical specialty coffee
                  — coffees that are expressive, easy to understand, and
                  enjoyable to brew at home or in a café setting.
                </p>
                <p className="mt-4 text-sm leading-8 text-white/68">
                  The goal is simple: fewer confusing choices, stronger product
                  identity, and a cleaner buying experience for both espresso
                  drinkers and filter brewers.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-lg font-semibold">Fewer tags</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Use only the main purchase filters on top. Leave processing
                    method and extra detail inside each product.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-lg font-semibold">Photo-ready cards</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Each bean can now show its own image from Contentful, so your
                    menu feels more premium and easier to browse.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 sm:col-span-2">
                  <p className="text-lg font-semibold">Netlify friendly</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    This component is ready for a Vite + Netlify setup using
                    environment variables for Contentful.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-white/55 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="font-medium text-white/80">Drunk Coffee Roasters</p>
            <p className="mt-1">Fresh roasted coffee for espresso and filter.</p>
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
              href={openGeneralWhatsApp}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/5"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
