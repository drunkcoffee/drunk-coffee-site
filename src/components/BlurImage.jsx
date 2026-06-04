/**
 * BlurImage.jsx
 * 
 * Drop-in replacement for <img> that shows a blurred low-res placeholder
 * while the full image loads, then crossfades to the real image.
 * 
 * Usage:
 *   import BlurImage from "./components/BlurImage";
 * 
 *   // Basic
 *   <BlurImage src={bean.image} alt={bean.name} className="h-full w-full object-contain" />
 * 
 *   // With explicit aspect ratio wrapper
 *   <BlurImage src={img} alt="..." aspect="square" className="p-10" />
 * 
 * Props:
 *   src        — full resolution image URL
 *   alt        — alt text
 *   className  — classes forwarded to the <img>
 *   aspect     — "square" | "video" | "4/3" | undefined (no forced ratio)
 *   thumbSrc   — optional low-res thumb; if omitted we generate one via ?w=40
 *   priority   — if true, skip lazy loading (use for above-the-fold hero images)
 *   onLoad     — callback when image finishes loading
 */

import { useEffect, useRef, useState } from "react";

const ASPECT_CLASSES = {
  square: "aspect-square",
  video:  "aspect-video",
  "4/3":  "aspect-[4/3]",
};

// Tiny inline SVG used as the absolute fallback before thumb loads
const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";

export default function BlurImage({
  src,
  alt = "",
  className = "",
  aspect,
  thumbSrc,
  priority = false,
  onLoad,
  style = {},
  ...rest
}) {
  const [loaded,    setLoaded]    = useState(false);
  const [thumbDone, setThumbDone] = useState(false);
  const imgRef  = useRef(null);
  const thumbRef = useRef(null);

  // Derive thumb URL: append ?w=40&q=20 to the original
  const thumb = thumbSrc || (src ? `${src}${src.includes("?") ? "&" : "?"}w=40&q=20&blur=10` : PLACEHOLDER_SVG);

  // If the browser already has the image cached, it fires load before React
  // sets up the handler. Check synchronously.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const wrapperAspect = aspect ? ASPECT_CLASSES[aspect] ?? "" : "";

  return (
    <div
      className={`relative overflow-hidden ${wrapperAspect}`}
      style={{ background: "#130f0a" }}
    >
      {/* ── Low-res blur thumb ── */}
      <img
        ref={thumbRef}
        src={thumb}
        alt=""
        aria-hidden
        onLoad={() => setThumbDone(true)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: "blur(12px)",
          transform: "scale(1.08)",   // hide blur edges
          transition: "opacity 400ms ease",
          opacity: loaded ? 0 : 1,
        }}
      />

      {/* ── Full resolution image ── */}
      <img
        ref={imgRef}
        src={src || PLACEHOLDER_SVG}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => { setLoaded(true); if (onLoad) onLoad(); }}
        className={className}
        style={{
          ...style,
          transition: "opacity 500ms ease",
          opacity: loaded ? 1 : 0,
        }}
        {...rest}
      />

      {/* ── Shimmer overlay while neither has loaded ── */}
      {!thumbDone && !loaded && (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease infinite",
          }}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0 }
          100% { background-position:  200% 0 }
        }
      `}</style>
    </div>
  );
}
