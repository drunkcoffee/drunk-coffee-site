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
    featured: true,
    image: "",
  },
  {
    id: "lan-chang",
    slug: "lan-chang",
    name: "Lan Chang",
    category: "Filter",
    collection: "Everyday Filter",
    price: 59,
    size: "200g",
    notes: ["Red Wine", "Raisin", "Wine Chocolate"],
    description:
      "A bold anaerobic natural from Baoshan, Yunnan. Expect red wine aromatics, raisin sweetness, and a smooth wine-chocolate finish.",
    roast: "Medium Light",
    origin: "China Yunnan",
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
    featured: false,
    image: "",
  },
];

const FILTERS = ["All", "Filter", "Espresso", "Omni"];
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
      notes: safeArray(fields.notes),
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

function buildWhatsAppUrl(bean) {
  const message = `Hi Drunk Coffee Roasters, I want to order:\n\n${bean.name} - ${bean.size}\nCategory: ${bean.category}\nPrice: RM ${bean.price}\n\nPlease share availability.\nThanks.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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
  const [selectedBean, setSelectedBean] = useState(null);

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
    const order = [
      "Seasonal Highlight",
      "Clean Filter",
      "Everyday Filter",
      "Funky Process",
      "Experimental Fruit",
      "Espresso Lovers",
      "Coffee Selection",
    ];

    return Object.keys(beansByCollection).sort((a, b) => {
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      const safeA = aIndex === -1 ? 999 : aIndex;
      const safeB = bIndex === -1 ? 999 : bIndex;
      return safeA - safeB;
    });
  }, [beansByCollection]);

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
              Fresh roasted coffee made easy to enjoy
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
              WhatsApp
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 md:inline-flex"
            >
              Instagram
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-7xl px-5 py-16 md:px-6 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/12 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/60">
                Johor Specialty Coffee Roaster
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
                Leave the complexity to the roaster. Make coffee easy to enjoy.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                Browse by brew style or coffee collection. Built for clean browsing,
                direct ordering, and better product storytelling with Contentful.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#beans"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:opacity-90"
                >
                  Browse Coffee
                </a>
                <a
                  href={openGeneralWhatsApp}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-white/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Order on WhatsApp
                </a>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-sm text-white/45">Browse</p>
                <p className="mt-2 text-2xl font-semibold">Filter · Espresso · Omni</p>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Start with how you brew, then move into flavor style and collection.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-sm text-white/45">Find us</p>
                <p className="mt-2 text-2xl font-semibold">Instagram · 小红书</p>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  @drunkcoffeeroasters · {XHS_LABEL}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 sm:col-span-2">
                <p className="text-sm text-white/45">Why this layout</p>
                <p className="mt-2 text-white/78 leading-7">
                  Built more like a specialty roaster storefront than a poster, so the
                  coffees are easier to compare, filter, and order.
                </p>
              </div>
            </div>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="mx-auto max-w-7xl px-5 pb-6 md:px-6 md:pb-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-white/42">
                  Featured coffees
                </p>
                <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Start here</h2>
              </div>
              <p className="hidden max-w-xl text-sm leading-7 text-white/62 md:block">
                Good first picks for new customers who want a shorter list.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {featured.map((bean) => (
                <button
                  key={bean.id}
                  type="button"
                  onClick={() => setSelectedBean(bean)}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] text-left transition hover:-translate-y-1 hover:bg-white/[0.06]"
                >
                  <div className="aspect-[4/3] bg-white/5">
                    {bean.image ? (
                      <img
                        src={bean.image}
                        alt={bean.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                      {bean.category}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{bean.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/62">
                      {bean.notes.join(" · ")}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-semibold">RM {bean.price}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/65">
                        {bean.size}
                      </span>
                    </div>
                  </div>
                </button>
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
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold md:text-3xl">
                          {meta.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-white/58">
                          {meta.subtitle}
                        </p>
                      </div>
                      <p className="text-sm text-white/38">
                        {collectionBeans.length} coffee{collectionBeans.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {collectionBeans.map((bean) => (
                        <button
                          key={bean.id}
                          type="button"
                          onClick={() => setSelectedBean(bean)}
                          className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] text-left shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.06]"
                        >
                          <div className="aspect-[4/3] bg-white/5">
                            {bean.image ? (
                              <img
                                src={bean.image}
                                alt={bean.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-sm text-white/35">
                                Add Contentful image
                              </div>
                            )}
                          </div>

                          <div className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                                  {bean.category}
                                </p>
                                <h3 className="mt-2 text-2xl font-semibold">{bean.name}</h3>
                              </div>
                              <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70">
                                {bean.size}
                              </span>
                            </div>

                            <p className="mt-4 text-sm font-medium leading-7 text-white/75">
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
                              <span className="text-sm text-white/45">Tap for details</span>
                            </div>
                          </div>
                        </button>
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
                  Built from training mornings into a specialty roasting journey.
                </h2>
                <p className="mt-5 text-sm leading-8 text-white/68">
                  Drunk Coffee Roasters was founded by Lun, a coffee enthusiast whose
                  journey began through fitness and early morning training sessions.
                  What started as a performance habit soon turned into a deep
                  exploration of specialty coffee and roasting.
                </p>
                <p className="mt-4 text-sm leading-8 text-white/68">
                  Our philosophy is simple: leave the complexity to the roaster,
                  and make coffee easy to enjoy.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-lg font-semibold">WhatsApp ordering</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Order directly through WhatsApp for a faster and more personal
                    buying experience.
                  </p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
                  <p className="text-lg font-semibold">Live CMS</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Update coffees, prices, notes, and images directly in Contentful.
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
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[32px] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/50">
            <div className="grid lg:grid-cols-[1fr_1fr]">
              <div className="aspect-square bg-white/5 lg:h-full lg:min-h-[560px]">
                {selectedBean.image ? (
                  <img
                    src={selectedBean.image}
                    alt={selectedBean.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
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
                  <a
                    href={buildWhatsAppUrl(selectedBean)}
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
      ) : null}

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-white/55 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <p className="font-medium text-white/80">Drunk Coffee Roasters</p>
            <p className="mt-1">Fresh roasted coffee made easy to enjoy.</p>
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
