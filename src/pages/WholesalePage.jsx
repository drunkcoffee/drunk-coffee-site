import { ArrowLeft, Instagram } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { trackWhatsappClick } from "../lib/analytics";
import {
  INSTAGRAM_URL,
  buildWholesaleWhatsAppUrl,
  cx,
} from "../lib/coffeeStore";

// ─── tokens ──────────────────────────────────────────────────────────────────
const P = "inline-flex items-center gap-2 rounded-full bg-[#c8922a] px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-[#0e0c09] transition hover:bg-[#d9a23a] active:scale-[0.97]";
const G = "inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-[12px] font-semibold tracking-[0.05em] text-white/60 transition hover:border-white/24 hover:text-white active:scale-[0.97]";

function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="h-px w-5 bg-[#c8922a]/50" />
      <span className="text-[10px] uppercase tracking-[0.28em] text-[#c8922a]/70">{children}</span>
    </div>
  );
}

function Chip({ label, value }) {
  return (
    <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 flex items-baseline gap-2">
      <span className="text-[13px] font-semibold text-white">{value}</span>
      <span className="text-[10px] text-white/32">{label}</span>
    </div>
  );
}

function InfoRow({ title, body }) {
  return (
    <div className="border-b border-white/[0.06] py-5 grid grid-cols-[120px_1fr] gap-6 md:grid-cols-[160px_1fr]">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/30 pt-0.5">{title}</p>
      <p className="text-[14px] leading-[1.8] text-white/65">{body}</p>
    </div>
  );
}

export default function WholesalePage() {
  const navigate = useNavigate();
  const wsUrl = buildWholesaleWhatsAppUrl();

  return (
    <>
      <Seo
        title="Wholesale Coffee Supply Malaysia | Drunk Coffee Roasters"
        description="Wholesale coffee supply for cafés, offices, events, and retail partners in Malaysia."
        url="/wholesale"
        jsonLd={{ "@context":"https://schema.org","@type":"Service",name:"Wholesale Coffee Supply",provider:{"@type":"Organization",name:"Drunk Coffee Roasters"},areaServed:"Malaysia" }}
      />

      <div className="min-h-screen" style={{ background:"#0e0c09" }}>

        {/* header */}
        <header className="sticky top-0 z-50 border-b border-white/[0.07]"
          style={{ background:"rgba(14,12,9,0.9)", backdropFilter:"blur(20px)" }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white"
                aria-label="Back">
                <ArrowLeft size={15} />
              </button>
              <Link to="/">
                <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-11 object-contain" />
              </Link>
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white">
              <Instagram size={15} />
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">

          {/* hero */}
          <div className="mb-12">
            <Eyebrow>Wholesale</Eyebrow>
            <h1 className="text-[clamp(36px,6vw,72px)] font-bold leading-[0.88] tracking-[-0.05em] text-white">
              Fresh roast,<br />
              <em className="not-italic text-[#c8922a]">at scale.</em>
            </h1>
            <p className="mt-6 max-w-[44ch] text-[15px] leading-[1.9] text-white/48">
              We supply cafés, offices, gift shops, and events across Malaysia. Small-batch roasting — consistent, repeatable, and roasted fresh per order.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={wsUrl} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("wholesale_page","hero")} className={P}>
                <img src="https://cdn.simpleicons.org/whatsapp/0e0c09" alt="" className="h-3.5 w-3.5" />
                Enquire on WhatsApp
              </a>
              <Link to="/" className={G}>Back to home</Link>
            </div>
          </div>

          {/* stat chips */}
          <div className="flex flex-wrap gap-2.5 mb-12">
            <Chip value="Min. 1 kg"    label="Starting order" />
            <Chip value="2–5 days"     label="Lead time"      />
            <Chip value="Custom"       label="Label options"  />
            <Chip value="MY · SG"      label="Ships to"       />
          </div>

          {/* what we supply */}
          <div className="mb-10">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-white/28 mb-5">What we supply</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title:"House Espresso", desc:"Balanced and consistent — works black or with milk. Repeatable for daily service." },
                { title:"Seasonal Filter", desc:"Expressive and rotating. For menus that want character without complexity." },
                { title:"Gift Sets",       desc:"Packaged for retail gifting or corporate orders. Easy to sell, easy to give." },
              ].map(item => (
                <div key={item.title} className="rounded-[16px] border border-white/[0.07] bg-[#1c1814] p-5">
                  <p className="text-[14px] font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-[12px] leading-[1.8] text-white/40">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* who we work with / how to enquire — clean row layout */}
          <div className="rounded-[18px] border border-white/[0.07] bg-[#1c1814] overflow-hidden mb-10">
            <InfoRow title="Suitable for"    body="Cafés, office coffee corners, retail shelves, events, and businesses looking for a dependable coffee offer." />
            <InfoRow title="What to tell us" body="Your use case, weekly or monthly volume, preferred brew style (espresso / filter / both), and your goal — house blend, retail bags, gifts, or event coffee." />
            <InfoRow title="How it works"    body="Send a WhatsApp message with your details. We'll guide you through options, pricing, and lead times from there. No forms, no back-and-forth." />
            <InfoRow title="Why Drunk Coffee" body="Small-batch roasting means more control and better consistency. Approachable profiles that are easy to sell. Direct communication — fast replies, no middleman." />
          </div>

          {/* final CTA */}
          <div className="rounded-[18px] border border-white/[0.07] bg-[#1c1814] p-7 md:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-[200px] w-[300px] opacity-10"
              style={{ background:"radial-gradient(ellipse at top right,#c8922a,transparent 65%)" }} />
            <div className="relative">
              <p className="text-[18px] font-bold tracking-[-0.02em] text-white">Ready to start?</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/44">
                Send us your requirements on WhatsApp and we'll get back to you quickly.
              </p>
              <a href={wsUrl} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("wholesale_page","final_cta")}
                className={cx(P,"mt-5")}>
                <img src="https://cdn.simpleicons.org/whatsapp/0e0c09" alt="" className="h-3.5 w-3.5" />
                Start wholesale enquiry
              </a>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
