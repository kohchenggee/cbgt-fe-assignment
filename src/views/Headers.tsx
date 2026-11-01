import ThemeToggle from "../ThemeToggle";

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
        <div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
