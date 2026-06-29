/**
 * PageTransition.jsx
 *
 * Usage: wrap your <Routes> in App.jsx
 *
 *   import { PageTransition } from "./components/PageTransition";
 *   import { useLocation } from "react-router-dom";
 *
 *   function App() {
 *     const location = useLocation();
 *     return (
 *       <PageTransition locationKey={location.key}>
 *         <Routes>
 *           <Route path="/" element={<HomePage />} />
 *           ...
 *         </Routes>
 *       </PageTransition>
 *     );
 *   }
 */

import { useEffect, useRef, useState } from "react";

// How long the exit animation plays before the new page renders (ms)
const EXIT_DURATION = 180;
// How long the enter animation plays (ms) -controlled via CSS
const ENTER_DURATION = 420;

export function PageTransition({ children, locationKey }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase]                     = useState("idle"); // idle | exiting | entering
  const prevKey                               = useRef(locationKey);
  const timerRef                              = useRef(null);

  useEffect(() => {
    if (locationKey === prevKey.current) return;
    prevKey.current = locationKey;

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: "instant" });

    // 1. Start exit
    setPhase("exiting");

    // 2. Swap children, start enter
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayChildren(children);
      setPhase("entering");

      // 3. Return to idle
      timerRef.current = setTimeout(() => setPhase("idle"), ENTER_DURATION);
    }, EXIT_DURATION);
  }, [locationKey, children]);

  // Keep children fresh when not transitioning
  useEffect(() => {
    if (phase === "idle") setDisplayChildren(children);
  }, [children, phase]);

  const style = {
    transition: `opacity ${phase === "exiting" ? EXIT_DURATION : ENTER_DURATION}ms ease,
                 transform ${phase === "exiting" ? EXIT_DURATION : ENTER_DURATION}ms ease`,
    opacity:   phase === "exiting" ? 0 : 1,
    transform: phase === "exiting"  ? "translateY(-6px)"
             : phase === "entering" ? "translateY(10px)"
             : "translateY(0)",
  };

  // entering phase needs to snap first then animate in
  // We use a double-rAF trick to ensure the browser paints the "from" state
  const enterRef = useRef(false);
  useEffect(() => {
    if (phase !== "entering") { enterRef.current = false; return; }
    if (enterRef.current) return;
    enterRef.current = true;
    // force repaint, then remove translate so CSS transition fires
  }, [phase]);

  return (
    <div style={style} aria-live="polite">
      {displayChildren}
    </div>
  );
}

/**
 * RouteLink -a <Link> that plays a tiny amber flash on click
 * Drop-in replacement for react-router Link in nav/cards
 *
 * Usage: import { RouteLink } from "./components/PageTransition";
 *        <RouteLink to="/coffee/xxx">View</RouteLink>
 */
import { Link } from "react-router-dom";

export function RouteLink({ to, children, className = "", onClick, ...rest }) {
  const [flash, setFlash] = useState(false);

  function handleClick(e) {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    if (onClick) onClick(e);
  }

  return (
    <>
      {flash && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[999]"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(200,146,42,0.06), transparent 70%)",
            animation: "fadeout 300ms ease forwards",
          }}
        />
      )}
      <style>{`@keyframes fadeout { from { opacity:1 } to { opacity:0 } }`}</style>
      <Link to={to} className={className} onClick={handleClick} {...rest}>
        {children}
      </Link>
    </>
  );
}
