import {
  appendImageParams,
  cx,
  formatBeanPrice,
  getBestForLabels,
  getEspressoUse,
  isPackageAvailable,
  safeArray,
  selectBeanVariant,
} from "../lib/coffeeStore";
import { DCR_PRIMARY_BUTTON, DCR_SECONDARY_BUTTON } from "../lib/designSystem";
import packagingBagGold from "../assets/dcr/packaging/packaging-bag-gold-v1.png";

export function DcrKicker({ children, className = "" }) {
  return <p className={cx("dcr-kicker", className)}>{children}</p>;
}

export function DcrSectionHeader({ kicker, title, copy, actions, className = "" }) {
  return (
    <div className={cx("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {kicker && <DcrKicker>{kicker}</DcrKicker>}
        <h2 className="dcr-heading mt-3 max-w-[12ch] text-[clamp(34px,5vw,64px)] leading-[0.9]">
          {title}
        </h2>
        {copy && <p className="dcr-body-copy mt-4 max-w-[54ch]">{copy}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function DcrAnnouncementBar({ children }) {
  return (
    <div className="whitespace-nowrap border-b border-dcr-border bg-dcr-olive px-2 py-2.5 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-dcr-cream/78 sm:px-4 sm:text-[10px] sm:tracking-[0.18em]">
      {children}
    </div>
  );
}

export function DcrTasteCard({ title, body, active = false, onClick, className = "" }) {
  const Component = onClick ? "button" : "article";
  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cx(
        "dcr-card group h-full w-full p-5 text-left transition duration-200",
        active ? "border-dcr-gold bg-dcr-olive text-dcr-cream" : "hover:-translate-y-0.5 hover:border-dcr-gold/60",
        className,
      )}
    >
      <p className={cx("text-[15px] font-semibold tracking-[-0.01em]", active ? "text-dcr-cream" : "text-dcr-olive")}>
        {title}
      </p>
      <p className={cx("mt-2 text-[13px] leading-relaxed", active ? "text-dcr-cream/68" : "text-dcr-charcoal/58")}>
        {body}
      </p>
    </Component>
  );
}

function getProductCardBadge(bean) {
  if (getEspressoUse(bean) === "Espresso Friendly") return "Espresso Friendly";
  if (getBestForLabels(bean).includes("Limited Release")) return "Limited Release";
  return "Pour Over";
}

function productMeta(value, fallback = "To be confirmed") {
  return String(value || fallback).trim();
}

export function PackagingProductCard({ bean, onOpen, onAdd, className = "" }) {
  if (!bean) return null;

  const badge = getProductCardBadge(bean);
  const firstAvailableVariant =
    bean.variants?.find((variant) => isPackageAvailable(variant)) ||
    bean.variants?.[0];
  const addBean = selectBeanVariant(bean, firstAvailableVariant);
  const canAdd = onAdd && isPackageAvailable(addBean);
  const notes = safeArray(bean.notes).slice(0, 3);
  const origin = productMeta(bean.collection || bean.origin, "Coffee selection");

  return (
    <article className={cx("dcr-product-card group flex h-full min-w-0 flex-col overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => onOpen?.(bean.slug)}
        className="dcr-product-media flex aspect-square w-full items-center justify-center overflow-hidden p-3 text-left sm:aspect-[4/3] sm:p-5"
      >
        <PackagingMockup bean={bean} />
      </button>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="border border-dcr-border bg-dcr-bg px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-dcr-brown sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">
            {badge}
          </span>
          <span className="text-[13px] font-bold text-dcr-olive sm:text-[15px]">{formatBeanPrice(bean)}</span>
        </div>

        <button
          type="button"
          onClick={() => onOpen?.(bean.slug)}
          className="text-left text-[16px] font-semibold leading-[1.08] tracking-[-0.02em] text-dcr-charcoal transition hover:text-dcr-brown sm:text-[20px]"
        >
          {bean.name}
        </button>

        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-dcr-brown/62 sm:text-[11px]">{origin}</p>
        {notes.length > 0 && (
          <p className="mt-2 line-clamp-2 text-[11px] leading-[1.55] text-dcr-charcoal/58 sm:text-[13px]">
            {notes.join(" · ")}
          </p>
        )}

        <div className="mt-auto flex flex-col items-stretch gap-2 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:pt-5">
          <button
            type="button"
            onClick={() => onOpen?.(bean.slug)}
            className={cx(DCR_SECONDARY_BUTTON, "w-full px-3 py-2.5 text-[9px] sm:w-auto sm:px-4 sm:text-[10px]")}
          >
            View coffee
          </button>
          {onAdd && (
            <button
              type="button"
              onClick={() => canAdd ? onAdd(addBean) : onOpen?.(bean.slug)}
              className={cx(DCR_PRIMARY_BUTTON, "w-full px-3 py-2.5 text-[9px] sm:w-auto sm:px-4 sm:text-[10px]")}
            >
              {canAdd ? "Add to cart" : "Ask first"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function PackagingMockup({ bean, className = "" }) {
  const flavorImage = bean?.flavorImage || "";
  const notes = safeArray(bean?.notes).slice(0, 3);
  const origin = productMeta(bean?.origin || bean?.collection, "Coffee selection");

  return (
    <div className={cx("dcr-packaging-composite", className)}>
      <img
        src={packagingBagGold}
        alt=""
        aria-hidden="true"
        className="dcr-packaging-bag"
        loading="lazy"
      />

      <div className="dcr-packaging-flavor-card">
        <span className="dcr-packaging-paperclip" aria-hidden="true" />

        <div className="dcr-packaging-flavor-visual">
          {flavorImage ? (
            <img
              src={appendImageParams(flavorImage, { w: 700, h: 520, fit: "fill", fm: "webp", q: 82 })}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="dcr-packaging-flavor-fallback" aria-hidden="true">
              <span>DRUNK</span>
            </div>
          )}
        </div>

        <div className="dcr-packaging-label-copy">
          <p className="dcr-packaging-label-name">{bean?.name || "Coffee"}</p>
          <p className="dcr-packaging-label-origin">{origin}</p>
          {notes.length > 0 && <p className="dcr-packaging-label-notes">{notes.join(" · ")}</p>}
        </div>
      </div>
    </div>
  );
}
