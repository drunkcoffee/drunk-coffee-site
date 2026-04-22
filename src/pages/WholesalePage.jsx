import { ArrowLeft, Instagram } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../components/Seo";
import { trackWhatsappClick } from "../lib/analytics";
import {
  APP_BG,
  DARK_BUTTON,
  EYEBROW,
  INSTAGRAM_URL,
  LIGHT_BUTTON,
  LIGHT_BUTTON_STYLE,
  PANEL,
  SOFT_PANEL,
  buildWholesaleWhatsAppUrl,
  cx,
} from "../lib/coffeeStore";

function InfoCard({ title, body }) {
  return (
    <div className={cx("p-5 md:p-6", SOFT_PANEL)}>
      <p className="font-display text-[22px] font-semibold tracking-[-0.02em] text-white">{title}</p>
      <p className="font-body mt-3 text-sm leading-7 text-white/58">{body}</p>
    </div>
  );
}

export default function WholesalePage() {
  const navigate = useNavigate();
  const wholesaleWhatsAppUrl = buildWholesaleWhatsAppUrl();

  return (
    <>
      <Seo
        title="Wholesale Coffee Supply Malaysia | Drunk Coffee Roasters"
        description="Wholesale coffee supply for cafés, offices, events, and retail partners in Malaysia. Enquire with Drunk Coffee Roasters for espresso blends and seasonal filter coffees."
        url="/wholesale"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Wholesale Coffee Supply",
          provider: {
            "@type": "Organization",
            name: "Drunk Coffee Roasters"
          },
          areaServed: "Malaysia",
          serviceType: "Wholesale coffee supply"
        }}
      />

      <div className={cx("min-h-screen", APP_BG)}>
        <div className="pointer-events-none fixed inset-0 opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_26%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_18%,transparent_82%,rgba(255,255,255,0.02))]" />
        </div>

        <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0d0b]/88 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
              <Link to="/" className="flex items-center">
                <img src="/logo.png" alt="Drunk Coffee Roasters" className="h-14 object-contain md:h-[70px]" />
              </Link>
            </div>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/76 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white"
            >
              <Instagram size={18} />
            </a>
          </div>
        </header>

        <main className="relative z-[1] mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
          <section className={cx("p-6 md:p-8", PANEL)}>
            <p className={EYEBROW}>Wholesale</p>
            <h1 className="font-display mt-4 text-[40px] font-semibold leading-[0.94] tracking-[-0.04em] text-white md:text-[62px]">
              Coffee supply for cafés, offices, and partners.
            </h1>
            <p className="font-body mt-5 max-w-3xl text-sm leading-8 text-white/60 md:text-[16px]">
              Small-batch roasted in Johor with a stronger focus on clarity, consistency, and coffees that are easier to sell, brew, and repeat.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={wholesaleWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("wholesale_page", "hero")} className={LIGHT_BUTTON} style={LIGHT_BUTTON_STYLE}>
                Enquire on WhatsApp
              </a>
              <Link to="/" className={DARK_BUTTON}>
                Back to home
              </Link>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Suitable for"
              body="Cafés, office coffee corners, retail shelves, events, and businesses looking for a more dependable coffee offer."
            />
            <InfoCard
              title="What we roast"
              body="Approachable espresso profiles, seasonal filters, and coffees with a cleaner flavour direction and stronger repeat value."
            />
            <InfoCard
              title="How to enquire"
              body="Send us your use case, volume, and preferred style through WhatsApp and we will guide you from there."
            />
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-[1.06fr_0.94fr]">
            <div className={cx("p-6 md:p-8", PANEL)}>
              <p className={EYEBROW}>What to include</p>
              <h2 className="font-display mt-4 text-[30px] font-semibold leading-[0.94] tracking-[-0.03em] text-white md:text-[44px]">
                Help us quote you faster.
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoCard title="Business type" body="Café, office, retail, event, or reseller." />
                <InfoCard title="Volume" body="How much coffee you usually need per week or month." />
                <InfoCard title="Brew style" body="Espresso, filter, milk drinks, black coffee, or mixed use." />
                <InfoCard title="Goal" body="House blend, retail bags, guest beans, gifts, or event coffee." />
              </div>
            </div>

            <div className={cx("p-6 md:p-8", PANEL)}>
              <p className={EYEBROW}>Why Drunk Coffee</p>
              <div className="mt-5 space-y-3">
                <InfoCard title="Small-batch roasting" body="More control, better consistency, and a cleaner product direction." />
                <InfoCard title="Approachable profile" body="Coffees that are easier to serve and easier for customers to come back to." />
                <InfoCard title="Direct communication" body="Fast WhatsApp communication without unnecessary back-and-forth." />
              </div>

              <a href={wholesaleWhatsAppUrl} target="_blank" rel="noreferrer" onClick={() => trackWhatsappClick("wholesale_page", "final_cta")} className={cx(LIGHT_BUTTON, "mt-6")} style={LIGHT_BUTTON_STYLE}>
                Start wholesale enquiry
              </a>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
