import { useEffect } from "react";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

export default function AnalyticsBootstrap() {
  useEffect(() => {
    if (!GA_ID || typeof document === "undefined") return;

    const existingScript = document.querySelector(`script[data-ga-id="${GA_ID}"]`);
    if (existingScript) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.setAttribute("data-ga-id", GA_ID);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);

    return () => {};
  }, []);

  return null;
}
