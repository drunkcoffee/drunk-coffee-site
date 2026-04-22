import { useEffect } from "react";

const SITE_NAME = "Drunk Coffee Roasters";
const SITE_URL = "https://drunkcoffeeroasters.com";
const DEFAULT_TITLE = "Drunk Coffee Roasters | Specialty Coffee Roaster in Malaysia";
const DEFAULT_DESCRIPTION =
  "Small-batch specialty coffee roasted in Johor, Malaysia. Shop filter and espresso coffees, explore the Monteblanco Series, and order fresh roast via WhatsApp.";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

function upsertJsonLd(jsonLd) {
  let element = document.head.querySelector('script[data-seo-jsonld="true"]');
  if (!jsonLd) {
    if (element) element.remove();
    return;
  }
  if (!element) {
    element = document.createElement("script");
    element.setAttribute("type", "application/ld+json");
    element.setAttribute("data-seo-jsonld", "true");
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(jsonLd);
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  url = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd = null,
}) {
  useEffect(() => {
    const absoluteUrl = url.startsWith("http") ? url : `${SITE_URL}${url}`;
    const absoluteImage = image?.startsWith("http")
      ? image
      : `${SITE_URL}${image || "/og-default.jpg"}`;

    document.title = title || DEFAULT_TITLE;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description || DEFAULT_DESCRIPTION,
    });

    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });

    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title || DEFAULT_TITLE,
    });

    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description || DEFAULT_DESCRIPTION,
    });

    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: absoluteUrl,
    });

    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: absoluteImage,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });

    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title || DEFAULT_TITLE,
    });

    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description || DEFAULT_DESCRIPTION,
    });

    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: absoluteImage,
    });

    if (noindex) {
      upsertMeta('meta[name="robots"]', {
        name: "robots",
        content: "noindex,nofollow",
      });
    } else {
      upsertMeta('meta[name="robots"]', {
        name: "robots",
        content: "index,follow,max-image-preview:large",
      });
    }

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: absoluteUrl,
    });

    upsertJsonLd(jsonLd);
  }, [title, description, url, image, noindex, jsonLd]);

  return null;
}
