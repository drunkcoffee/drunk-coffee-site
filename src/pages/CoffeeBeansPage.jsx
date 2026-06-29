import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { trackWhatsappClick } from "../lib/analytics";
import {
  INSTAGRAM_URL,
  appendImageParams,
  buildGeneralWhatsAppUrl,
  cx,
  formatBeanPrice,
  getDisplayBadges,
  getPackageSizeSummary,
  getProductFilterMatches,
  getSimplePositioning,
  safeArray,
  useBeans,
} from "../lib/coffeeStore";
import { ArrowLeft, Instagram, ShoppingCart } from "lucide-react";

// tokens
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

function BeanRow({ bean }) {
  const img = bean.image ? appendImageParams(bean.image, { w:400, h:400, fit:"pad", fm:"webp", q:78 }) : "";
  const notes = safeArray(bean.notes).slice(0, 3);
  const positioning = getSimplePositioning(bean);
  const packageSummary = getPackageSizeSummary(bean);
  const badges = getDisplayBadges(bean, 3);
  return (
    <Link to={`/coffee/${bean.slug}`}
      className="group flex items-center gap-3 rounded-[14px] border border-white/[0.05] px-3.5 py-3.5 transition duration-200 hover:border-white/[0.12] hover:bg-[#1c1814] sm:gap-4 md:px-5">
      {/* thumbnail */}
      <div className="shrink-0 rounded-[9px] bg-[#130f0a] overflow-hidden h-[64px] w-[64px]">
        {img
          ? <img src={img} alt={bean.name} className="h-full w-full object-contain p-2 transition duration-400 group-hover:scale-[1.08]" />
          : <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-widest text-white/16">-</div>
        }
      </div>
      {/* info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white">{bean.name}</span>
          {badges.map((badge) => (
            <span key={badge} className="rounded-full border border-[#c8922a]/25 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-[#d9ad59]">{badge}</span>
          ))}
        </div>
        {notes.length > 0 && <p className="mt-1 text-[12px] leading-relaxed text-white/50">{notes.join(" / ")}</p>}
        <p className="mt-1 text-[11px] leading-relaxed text-white/34">{positioning}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/26 sm:hidden">{formatBeanPrice(bean)} / {packageSummary}</p>
      </div>
      {/* price + category */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[14px] font-semibold text-white/80">{formatBeanPrice(bean)}</p>
        <p className="text-[10px] text-white/24 mt-0.5">{packageSummary}</p>
      </div>
      <span className="shrink-0 text-[11px] text-white/24 transition group-hover:text-white/60">View</span>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-[14px] border border-white/[0.05] px-4 py-3.5">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-[9px] bg-white/[0.04]" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-32 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-white/[0.04]" />
      </div>
      <div className="h-3.5 w-10 animate-pulse rounded-full bg-white/[0.05]" />
    </div>
  );
}

const FILTERS = ["All Coffee", "Espresso Friendly", "Pour Over", "Bundles", "Limited Release"];

export default function CoffeeBeansPage() {
  const navigate = useNavigate();
  const { beans, loading, error } = useBeans();
  const [active, setActive] = useState("All Coffee");
  const waUrl = buildGeneralWhatsAppUrl();

  const filtered = beans.filter((bean) => getProductFilterMatches(bean, active));

  return (
    <>
      <Seo
        title="Coffee Beans Malaysia | Drunk Coffee Roasters"
        description="Browse fresh-roasted specialty coffee beans from Drunk Coffee Roasters in Malaysia, including filter, espresso, limited lots, and gift-friendly picks."
        url="/beans"
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
            <div className="flex items-center gap-2">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:text-white md:flex">
                <Instagram size={15} />
              </a>
              <a href={waUrl} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("beans_page_header","general")}
                className={cx(G, "hidden md:inline-flex text-[11px] px-4 py-2")}>
                Ask for help choosing
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-14 md:px-6 md:py-20">
          <Eyebrow>Coffee menu</Eyebrow>
          <h1 className="text-[clamp(32px,5vw,52px)] font-bold leading-[0.9] tracking-[-0.045em] text-white">
            Shop coffee beans
          </h1>
          <p className="mt-4 mb-8 max-w-[42ch] text-[14px] leading-[1.8] text-white/42">
            Browse by brew style. Each row shows tasting notes, best use, bag size, and price before you open the detail page.
          </p>

          {/* filter tabs */}
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/[0.06]">
            {FILTERS.map(f => {
              const on = active === f;
              return (
                <button key={f} type="button" onClick={() => setActive(f)}
                  className={cx("relative pb-3 pr-4 text-[12px] uppercase tracking-[0.1em] transition duration-200",
                    on ? "font-semibold text-white" : "text-white/30 hover:text-white/60")}>
                  {f}
                  {on && <span className="absolute bottom-0 left-0 right-4 h-[1.5px] rounded-full bg-[#c8922a]" />}
                </button>
              );
            })}
            <span className="ml-auto pb-3 text-[11px] text-white/20">{filtered.length} available</span>
          </div>

          {error && <p className="mb-4 text-[12px] text-amber-300">{error}</p>}

          <div className="flex flex-col gap-1.5">
            {loading
              ? Array.from({length:5}).map((_,i) => <SkeletonRow key={i} />)
              : filtered.map(bean => <BeanRow key={bean.id} bean={bean} />)
            }
          </div>

          {/* bottom CTA */}
          {!loading && (
            <div className="mt-12 text-center">
              <p className="text-[13px] text-white/36 mb-4">Not sure which coffee fits your brew setup? Message us and we'll recommend one.</p>
              <a href={waUrl} target="_blank" rel="noreferrer"
                onClick={() => trackWhatsappClick("beans_page_bottom","general")} className={P}>
                <img src="https://cdn.simpleicons.org/whatsapp/0e0c09" alt="" className="h-3.5 w-3.5" />
                Get a recommendation
              </a>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
