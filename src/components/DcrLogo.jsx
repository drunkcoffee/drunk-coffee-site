import { cx } from "../lib/coffeeStore";

export default function DcrLogo({ className = "", showName = false }) {
  return (
    <span className={cx("dcr-logo", className)}>
      <img src="/logo-mark-source.png" alt="" aria-hidden="true" className="dcr-logo__mark" />
      {showName && (
        <span className="dcr-logo__name">
          DRUNK
          <small>COFFEE ROASTERS</small>
        </span>
      )}
      <span className="sr-only">Drunk Coffee Roasters</span>
    </span>
  );
}
