/**
 * Seo.jsx -unified meta tags for all pages
 *
 * Place at src/components/Seo.jsx (replaces existing Seo component)
 *
 * Props:
 *   title        -page title (shown in tab + OG)
 *   description  -meta description + OG description
 *   url          -canonical path e.g. "/coffee/paraiso-java"
 *   image        -OG image URL (full URL). Falls back to /og-default.jpg
 *   imageAlt     -alt text for OG image
 *   type         -"website" | "article" | "product" (default: "website")
 *   jsonLd       -structured data object (will be JSON.stringify'd)
 *   noIndex      -if true, adds noindex meta
 */

import { useEffect } from "react";

const SITE_NAME   = "Drunk Coffee Roasters";
const SITE_URL    = "https://drunkcoffeeroasters.com";
const DEFAULT_IMG = `${SITE_URL}/og-default.jpg`;   // put a 1200x630 brand image here
const TWITTER_HDL = "@drunkcoffeemy";               // update if you have one

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
  el.setAttribute("href", href);
}

function setJsonLd(data) {
  const id = "json-ld-main";
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("script"); el.id = id; el.type = "application/ld+json"; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data);
}

export default function Seo({
  title,
  description,
  url = "/",
  image,
  imageAlt,
  type = "website",
  jsonLd,
  noIndex = false,
}) {
  const fullTitle  = title ? `${title}` : SITE_NAME;
  const fullUrl    = `${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  const ogImage    = image || DEFAULT_IMG;
  const ogImageAlt = imageAlt || title || SITE_NAME;

  useEffect(() => {
    // Basic
    document.title = fullTitle;
    setMeta("description",        description);
    setMeta("robots",             noIndex ? "noindex,nofollow" : "index,follow");
    setLink("canonical",          fullUrl);

    // Open Graph
    setMeta("og:type",            type,        "property");
    setMeta("og:site_name",       SITE_NAME,   "property");
    setMeta("og:title",           fullTitle,   "property");
    setMeta("og:description",     description, "property");
    setMeta("og:url",             fullUrl,     "property");
    setMeta("og:image",           ogImage,     "property");
    setMeta("og:image:alt",       ogImageAlt,  "property");
    setMeta("og:image:width",     "1200",      "property");
    setMeta("og:image:height",    "630",       "property");
    setMeta("og:locale",          "en_MY",     "property");

    // Twitter / X card
    setMeta("twitter:card",        "summary_large_image");
    setMeta("twitter:site",        TWITTER_HDL);
    setMeta("twitter:title",       fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image",       ogImage);
    setMeta("twitter:image:alt",   ogImageAlt);

    // JSON-LD
    if (jsonLd) setJsonLd(jsonLd);
  }, [fullTitle, description, fullUrl, ogImage, ogImageAlt, type, jsonLd, noIndex]);

  return null;
}
