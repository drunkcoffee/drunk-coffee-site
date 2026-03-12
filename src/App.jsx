import { useEffect, useMemo, useState } from "react";

const FALLBACK_BEANS = [
  {
    id: "spring-bloom-blend",
    slug: "spring-bloom-blend",
    name: "Spring Bloom Blend",
    category: "Filter",
    price: 49,
    size: "200g",
    notes: ["Floral", "Citrus", "Silky Body"],
    description:
      "A clean and expressive filter blend with floral lift, citrus brightness, and a silky body.",
    roast: "Light",
    origin: "Blend",
    featured: true,
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
              className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/5"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com/drunkcoffeeroasters"
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
