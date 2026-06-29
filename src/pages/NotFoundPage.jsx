import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buildGeneralWhatsAppUrl, cx } from "../lib/coffeeStore";
import { trackWhatsappClick } from "../lib/analytics";
import Seo from "../components/Seo";

const P = "inline-flex items-center gap-2 rounded-full bg-[#c8922a] px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#0e0c09] transition hover:bg-[#d9a23a] active:scale-[0.97]";
const G = "inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-white/60 transition hover:border-white/24 hover:text-white active:scale-[0.97]";

// Animated coffee drip SVG
function CoffeeDrip() {
  return (
    <svg viewBox="0 0 120 160" className="h-28 w-auto opacity-70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* cup */}
      <path d="M28 72 L32 132 Q32 140 42 140 L78 140 Q88 140 88 132 L92 72 Z"
        fill="#1c1814" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
      {/* handle */}
      <path d="M88 84 Q108 84 108 100 Q108 116 88 116"
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
      {/* liquid */}
      <path d="M34 82 L36 128 Q36 134 44 134 L76 134 Q84 134 84 128 L86 82 Z"
        fill="#c8922a" opacity="0.15" />
      {/* steam lines */}
      <path d="M50 60 Q53 50 50 42" stroke="rgba(200,146,42,0.35)" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 56 Q63 44 60 34" stroke="rgba(200,146,42,0.25)" strokeWidth="2" strokeLinecap="round" />
      <path d="M70 60 Q67 50 70 42" stroke="rgba(200,146,42,0.35)" strokeWidth="2" strokeLinecap="round" />
      {/* saucer */}
      <ellipse cx="60" cy="144" rx="42" ry="6" fill="#1c1814" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      {/* 404 on cup */}
      <text x="60" y="112" textAnchor="middle" fill="rgba(200,146,42,0.55)" fontSize="18" fontWeight="700" fontFamily="system-ui" letterSpacing="-1">404</text>
    </svg>
  );
}

// Particle dots
function Particles() {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 4,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <div key={i}
          className="absolute rounded-full bg-[#c8922a]"
          style={{
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.size, height: d.size,
            opacity: 0.12,
            animation: `float-dot ${d.dur}s ${d.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes float-dot {
          from { transform: translateY(0px); opacity: 0.08; }
          to   { transform: translateY(-12px); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

export default function NotFoundPage() {
  const navigate  = useNavigate();
  const waUrl     = buildGeneralWhatsAppUrl();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 60);
    return () => clearTimeout(t);
  }, []);

  const SUGGESTIONS = [
    { label: "Shop coffees",         href: "/#shop"         },
    { label: "Bundles",              href: "/#series"       },
    { label: "Wholesale",            href: "/wholesale"     },
  ];

  return (
    <>
      <Seo
        title="Page not found | Drunk Coffee Roasters"
        description="The page you're looking for doesn't exist. Browse our specialty coffee range instead."
        url="/404"
      />

      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20"
        style={{ background: "#0e0c09" }}>

        <Particles />

        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #c8922a, transparent 65%)" }} />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col items-center text-center"
          style={{
            transition: "opacity 500ms ease, transform 500ms ease",
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
          }}>

          <CoffeeDrip />

          <div className="mt-8 flex items-center gap-2.5">
            <span className="h-px w-8 bg-[#c8922a]/40" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#c8922a]/60">Page not found</span>
            <span className="h-px w-8 bg-[#c8922a]/40" />
          </div>

          <h1 className="mt-4 text-[clamp(28px,5vw,44px)] font-bold leading-[0.92] tracking-[-0.04em] text-white">
            We lost this page<br />
            <em className="not-italic text-[#c8922a]">but not the coffee.</em>
          </h1>

          <p className="mt-5 max-w-[34ch] text-[14px] leading-[1.85] text-white/42">
            The link may have changed or the page no longer exists.
            Head back home and browse what's fresh.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className={P}>Back to home</Link>
            <button type="button" onClick={() => navigate(-1)} className={G}>Go back</button>
          </div>

          {/* Suggestions */}
          <div className="mt-10 w-full max-w-xs">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/24">Or try one of these</p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map(s => (
                <Link key={s.href} to={s.href}
                  className="flex items-center justify-between rounded-[12px] border border-white/[0.06] px-4 py-3 text-left transition hover:border-white/[0.14] hover:bg-[#1c1814]">
                  <span className="text-[13px] text-white/60">{s.label}</span>
                  <span className="text-[12px] text-white/24">View</span>
                </Link>
              ))}
            </div>
          </div>

          {/* WhatsApp fallback */}
          <p className="mt-8 text-[12px] text-white/28">
            Can't find what you need?{" "}
            <a href={waUrl} target="_blank" rel="noreferrer"
              onClick={() => trackWhatsappClick("404_page", "general")}
              className="text-[#c8922a]/70 underline underline-offset-2 transition hover:text-[#c8922a]">
              Message us on WhatsApp
            </a>
          </p>

        </div>

        {/* Footer note */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <Link to="/">
            <img src="/logo.png" alt="Drunk Coffee Roasters" className="mx-auto h-8 object-contain opacity-20 transition hover:opacity-40" />
          </Link>
        </div>

      </div>
    </>
  );
}
