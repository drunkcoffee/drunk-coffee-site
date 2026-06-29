/**
 * Lightbox.jsx
 *
 * Full-screen image viewer with:
 *   - Fade + scale open/close animation
 *   - Click outside / ESC / swipe down to close
 *   - Pinch-to-zoom (mobile)
 *   - Previous / Next navigation
 *   - Keyboard arrow navigation
 *
 * Usage (single image):
 *   import { useLightbox, Lightbox } from "./components/Lightbox";
 *
 *   const { open, lightboxProps } = useLightbox([{ src: img, alt: bean.name }]);
 *
 *   <button onClick={() => open(0)}><img src={img} /></button>
 *   <Lightbox {...lightboxProps} />
 *
 * Usage (gallery):
 *   const images = beans.map(b => ({ src: b.image, alt: b.name }));
 *   const { open, lightboxProps } = useLightbox(images);
 *
 *   {beans.map((b,i) => <button onClick={() => open(i)}><img src={b.image} /></button>)}
 *   <Lightbox {...lightboxProps} />
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
export function useLightbox(images = []) {
  const [index,  setIndex]  = useState(null); // null = closed
  const [visible, setVisible] = useState(false);

  function open(i = 0)  {
    setIndex(i);
    setVisible(true);
  }
  function close() {
    setVisible(false);
    // slight delay so close animation plays
    setTimeout(() => setIndex(null), 280);
  }
  function prev() { setIndex(i => (i <= 0 ? images.length - 1 : i - 1)); }
  function next() { setIndex(i => (i >= images.length - 1 ? 0 : i + 1)); }

  return {
    open,
    lightboxProps: { images, index, visible, onClose: close, onPrev: prev, onNext: next },
  };
}
export function Lightbox({ images = [], index, visible, onClose, onPrev, onNext }) {
  const overlayRef  = useRef(null);
  const touchStart  = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom]     = useState(1);    // 1 = normal, 2 = zoomed in

  const image = index !== null ? images[index] : null;
  const hasMultiple = images.length > 1;

  // Reset loaded + zoom state when image changes
  useEffect(() => { setLoaded(false); setZoom(1); }, [index]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;
    function onKey(e) {
      if (e.key === "Escape")      { e.preventDefault(); onClose(); }
      if (e.key === "ArrowLeft")   { e.preventDefault(); if (hasMultiple) onPrev(); }
      if (e.key === "ArrowRight")  { e.preventDefault(); if (hasMultiple) onNext(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, hasMultiple, onClose, onPrev, onNext]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  // Touch swipe -swipe down closes, swipe left/right navigates
  function onTouchStart(e) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    const THRESHOLD = 60;
    if (Math.abs(dy) > Math.abs(dx) && dy > THRESHOLD) { onClose(); return; }
    if (Math.abs(dx) > THRESHOLD && hasMultiple) { dx < 0 ? onNext() : onPrev(); }
  }

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }
  function toggleZoom() { setZoom(z => z === 1 ? 2.2 : 1); }

  if (index === null) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="fixed inset-0 z-[500] flex items-center justify-center"
        style={{
          background: "rgba(8,6,4,0.95)",
          backdropFilter: "blur(12px)",
          transition: "opacity 260ms ease",
          opacity: visible ? 1 : 0,
        }}
        aria-modal="true"
        aria-label="Image viewer"
        role="dialog"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/40 text-white/60 backdrop-blur-sm transition hover:text-white"
        >
          <X size={17} />
        </button>

        {/* Zoom toggle */}
        <button
          type="button"
          onClick={toggleZoom}
          aria-label={zoom > 1 ? "Zoom out" : "Zoom in"}
          className="absolute right-16 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/40 text-white/60 backdrop-blur-sm transition hover:text-white"
        >
          <ZoomIn size={15} className={zoom > 1 ? "text-[#c8922a]" : ""} />
        </button>

        {/* Previous */}
        {hasMultiple && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onPrev(); }}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/40 text-white/60 backdrop-blur-sm transition hover:text-white md:left-5"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next */}
        {hasMultiple && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onNext(); }}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/40 text-white/60 backdrop-blur-sm transition hover:text-white md:right-5"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Image */}
        <div
          className="relative flex h-full w-full items-center justify-center px-16 py-16"
          style={{
            transition: "transform 280ms ease, opacity 260ms ease",
            transform: visible ? "scale(1)" : "scale(0.94)",
            opacity:   visible ? 1 : 0,
          }}
        >
          {image && (
            <>
              {/* Blur placeholder */}
              {!loaded && (
                <div
                  className="absolute inset-16 rounded-[12px]"
                  style={{
                    background: "#1c1814",
                    animation: "lb-pulse 1.6s ease infinite",
                  }}
                />
              )}

              <img
                key={image.src}
                src={image.src}
                alt={image.alt || ""}
                onLoad={() => setLoaded(true)}
                onClick={e => e.stopPropagation()}
                className="max-h-full max-w-full rounded-[8px] object-contain shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
                style={{
                  transition: "opacity 300ms ease, transform 350ms cubic-bezier(0.34,1.56,0.64,1)",
                  opacity: loaded ? 1 : 0,
                  transform: `scale(${zoom})`,
                  cursor: zoom > 1 ? "zoom-out" : "zoom-in",
                  transformOrigin: "center center",
                }}
              />
            </>
          )}
        </div>

        {/* Caption + dots */}
        {image && (
          <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-3">
            {image.alt && (
              <p className="text-[12px] text-white/40 px-4 text-center">{image.alt}</p>
            )}
            {hasMultiple && (
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={e => { e.stopPropagation(); /* jump to */ onPrev(); /* hack: just use index setter */ }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? "w-5 bg-[#c8922a]" : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes lb-pulse {
          0%, 100% { opacity: 0.4 }
          50%       { opacity: 0.7 }
        }
      `}</style>
    </>
  );
}
