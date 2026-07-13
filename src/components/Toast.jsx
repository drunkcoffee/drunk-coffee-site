/**
 * Toast.jsx -animated slide-up notification
 *
 * Usage:
 *   import Toast from "../components/Toast";
 *
 *   const [toast, setToast] = useState("");
 *   // trigger: setToast("Item added"); auto-clears after 2.2s
 *
 *   <Toast message={toast} />
 *
 * The component handles its own enter/exit animation.
 * Pass an empty string to hide it.
 */

import { useEffect, useRef, useState } from "react";

export default function Toast({ message = "" }) {
  const [visible, setVisible]   = useState(false);
  const [display, setDisplay]   = useState("");
  const hideTimer = useRef(null);
  const showTimer = useRef(null);

  useEffect(() => {
    clearTimeout(hideTimer.current);
    clearTimeout(showTimer.current);

    if (message) {
      setDisplay(message);
      // micro-delay so CSS transition fires after mount
      showTimer.current = setTimeout(() => setVisible(true), 16);
    } else {
      setVisible(false);
      // keep text visible during exit animation
      hideTimer.current = setTimeout(() => setDisplay(""), 340);
    }
    return () => { clearTimeout(hideTimer.current); clearTimeout(showTimer.current); };
  }, [message]);

  if (!display) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed left-1/2 z-[80] -translate-x-1/2"
      style={{ bottom: "max(5.5rem, calc(1.25rem + env(safe-area-inset-bottom)))" }}>
      <div
        style={{
          transition: "opacity 280ms ease, transform 320ms cubic-bezier(0.34,1.4,0.64,1)",
          opacity:   visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.95)",
        }}
        className="flex items-center gap-2.5 rounded-[11px] bg-accent pl-4 pr-5 py-2.5 text-text shadow-[0_8px_24px_rgba(31,31,31,0.12)]">
        {/* checkmark */}
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8l3.5 3.5L13 5" />
        </svg>
        <span className="text-[12px] font-semibold tracking-[0.02em] text-text whitespace-nowrap">
          {display}
        </span>
      </div>
    </div>
  );
}
