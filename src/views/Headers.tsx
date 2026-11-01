import ThemeToggle from "../ThemeToggle";
import AvatarLogo from "./Avatar";

export default function Headers() {
  return (
    <header className="app-header">
      <div className="app-header__top">
        <div className="brand-logo">
          <div className="brand-logo__symbol">M</div>

          <div className="brand-logo__content">
            <span className="brand-logo__name">MERIDIAN</span>
          </div>
        </div>
        <nav className="app-header__nav" aria-label="Main navigation">
          <a href="/" aria-current="page">
            Overview
          </a>
          <span className="nav-link nav-link--disabled" aria-disabled="true">
            Cards
          </span>
          <span className="nav-link nav-link--disabled" aria-disabled="true">
            Payments
          </span>
          <span className="nav-link nav-link--disabled" aria-disabled="true">
            Insights
          </span>
        </nav>
        <div className="header-right">
          <ThemeToggle />
          <AvatarLogo />
        </div>
      </div>
    </header>
  );
}
