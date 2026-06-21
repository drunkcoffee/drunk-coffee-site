export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  if (import.meta.env.DEV) {
    console.info(`[tracking] ${eventName}`, params);
  }
}

export function trackProductView(bean) {
  if (!bean) return;
  trackEvent("view_product", {
    item_id: bean.slug || bean.id,
    item_name: bean.name,
    item_category: bean.category,
    price: bean.price,
    variant: bean.size,
  });
}

export function trackAddToCart(bean, source = "") {
  if (!bean) return;
  trackEvent("add_to_cart", {
    item_id: bean.slug || bean.id,
    item_name: bean.name,
    item_category: bean.category,
    price: bean.price,
    variant: bean.size,
    source,
  });
}

export function trackSeriesView(seriesName) {
  trackEvent("view_series", {
    series_name: seriesName,
  });
}

export function trackWhatsappClick(source, label = "") {
  trackEvent("whatsapp_click", {
    source,
    label,
  });
}
