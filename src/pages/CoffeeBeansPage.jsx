import { Instagram } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DcrAnnouncementBar, DcrKicker, PackagingProductCard } from "../components/DrunkDesignSystem";
import DcrLogo from "../components/DcrLogo";
import Seo from "../components/Seo";
import { trackWhatsappClick } from "../lib/analytics";
import {
  INSTAGRAM_URL,
  buildGeneralWhatsAppUrl,
  cx,
  getProductFilterMatches,
  useBeans,
} from "../lib/coffeeStore";
import { DCR_PRIMARY_BUTTON, DCR_SECONDARY_BUTTON } from "../lib/designSystem";

const FILTERS = [
  { label: "All Coffee", query: "all", match: "All Coffee" },
  { label: "Filter", query: "filter", match: "Pour Over" },
  { label: "Espresso", query: "espresso", match: "Espresso Friendly" },
  { label: "Limited Release", query: "limited", match: "Limited Release" },
  { label: "Bundles", query: "bundles", match: "Bundles" },
];

function ShopSkeleton() {
  return (
    <div className="dcr-product-card overflow-hidden">
      <div className="aspect-square animate-pulse bg-dcr-border/38 sm:aspect-[4/3]" />
      <div className="space-y-3 p-3 sm:p-5">
        <div className="h-3 w-16 animate-pulse bg-dcr-border/60" />
        <div className="h-5 w-4/5 animate-pulse bg-dcr-border/60" />
        <div className="h-3 w-3/5 animate-pulse bg-dcr-border/45" />
      </div>
    </div>
  );
}

export default function CoffeeBeansPage() {
  const navigate = useNavigate();
  const { beans, loading, error } = useBeans();
  const [searchParams, setSearchParams] = useSearchParams();
  const waUrl = buildGeneralWhatsAppUrl();
  const query = searchParams.get("category") || "all";
  const activeFilter = FILTERS.find((item) => item.query === query) || FILTERS[0];
  const filtered = beans.filter((bean) => getProductFilterMatches(bean, activeFilter.match));

  function selectFilter(filter) {
    if (filter.query === "all") setSearchParams({});
    else setSearchParams({ category: filter.query });
  }

  return (
    <>
      <Seo
        title="Shop Coffee | Drunk Coffee Roasters"
        description="Choose fresh-roasted specialty coffee by brew style, flavour, and how you prefer to drink it."
        url="/shop"
      />

      <div className="dcr-page min-h-screen">
        <DcrAnnouncementBar>Buy 2 bags, save 10% · Buy 4 bags, save 20%</DcrAnnouncementBar>

        <header className="border-b border-dcr-border bg-dcr-bg">
          <div className="dcr-container flex min-h-18 items-center justify-between gap-5 py-3">
            <Link to="/" className="shrink-0" aria-label="Drunk Coffee Roasters home">
              <DcrLogo className="h-11 md:h-12" showName />
            </Link>
            <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
              <Link to="/shop" className="dcr-nav-link dcr-nav-link--active">Shop</Link>
              <Link to="/shop?category=filter" className="dcr-nav-link">Filter</Link>
              <Link to="/shop?category=espresso" className="dcr-nav-link">Espresso</Link>
              <Link to="/#about" className="dcr-nav-link">About</Link>
            </nav>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackWhatsappClick("shop_header", "general")}
              className={cx(DCR_SECONDARY_BUTTON, "px-3 py-2.5 text-[9px] sm:px-4 sm:text-[10px]")}
            >
              Ask for help
            </a>
          </div>
        </header>

        <main>
          <section className="border-b border-dcr-border bg-dcr-cream">
            <div className="dcr-container py-12 md:py-20">
              <DcrKicker>Coffee List</DcrKicker>
              <h1 className="dcr-heading mt-4 max-w-[10ch] text-[clamp(48px,8vw,96px)] leading-[0.86]">Shop Coffee</h1>
              <p className="dcr-body-copy mt-5 max-w-[52ch] text-[15px] md:text-[17px]">
                Choose by brew style, flavour, and how you prefer to drink your coffee.
              </p>
            </div>
          </section>

          <section className="bg-dcr-bg">
            <div className="sticky top-0 z-30 border-b border-dcr-border bg-dcr-bg/95 backdrop-blur-md">
              <div className="dcr-container flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {FILTERS.map((filter) => {
                  const isActive = activeFilter.query === filter.query;
                  return (
                    <button
                      key={filter.query}
                      type="button"
                      onClick={() => selectFilter(filter)}
                      className={cx(
                        "shrink-0 border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] transition sm:px-4 sm:text-[10px]",
                        isActive
                          ? "border-dcr-olive bg-dcr-olive text-dcr-cream"
                          : "border-dcr-border bg-dcr-cream text-dcr-charcoal/62 hover:border-dcr-gold hover:text-dcr-olive",
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
                <span className="ml-auto hidden shrink-0 text-[11px] text-dcr-charcoal/42 sm:block">
                  {filtered.length} available
                </span>
              </div>
            </div>

            <div className="dcr-container py-8 md:py-14">
              {error && <p className="mb-5 text-[12px] text-dcr-brown">{error}</p>}

              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {loading
                  ? Array.from({ length: 8 }).map((_, index) => <ShopSkeleton key={index} />)
                  : filtered.map((bean) => (
                      <PackagingProductCard key={bean.id} bean={bean} onOpen={(slug) => navigate(`/coffee/${slug}`)} />
                    ))}
              </div>

              {!loading && filtered.length === 0 && (
                <div className="border border-dcr-border bg-dcr-cream px-5 py-12 text-center">
                  <p className="text-[17px] font-semibold text-dcr-olive">No coffee matches this filter right now.</p>
                  <p className="dcr-body-copy mt-2">View the complete list or ask us for the closest available option.</p>
                  <button type="button" onClick={() => selectFilter(FILTERS[0])} className={cx(DCR_SECONDARY_BUTTON, "mt-5")}>View all coffee</button>
                </div>
              )}

              {!loading && (
                <div className="mt-12 border-t border-dcr-border pt-10 text-center md:mt-16">
                  <DcrKicker className="justify-center">Need a recommendation?</DcrKicker>
                  <h2 className="dcr-heading mx-auto mt-4 max-w-[13ch] text-[clamp(34px,5vw,54px)] leading-[0.92]">Tell us how you drink coffee.</h2>
                  <p className="dcr-body-copy mx-auto mt-4 max-w-[46ch]">We will help you choose without turning it into a coffee exam.</p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackWhatsappClick("shop_bottom", "general")}
                    className={cx(DCR_PRIMARY_BUTTON, "mt-6")}
                  >
                    Order on WhatsApp
                  </a>
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="border-t border-dcr-border bg-dcr-cream">
          <div className="dcr-container flex flex-col gap-5 py-8 text-[12px] text-dcr-charcoal/52 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Drunk Coffee Roasters</p>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5"><Instagram size={13} /> Instagram</a>
              <a href={waUrl} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
