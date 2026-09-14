import { CURRENCY_CONFIGS } from "../utils/formatCurrency.js";

function Header({
  userEmail,
  currentCurrency,
  onCurrencyChange,
  theme,
  onToggleTheme,
  onOpenAddModal,
  onLogout,
}) {
  const userInitial = (userEmail ? userEmail.charAt(0) : "U").toUpperCase();

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-title">Ledger</span>
          <span className="brand-badge">PRO</span>
        </div>
        <div className="db-status-pill" title="Connected to PostgreSQL 17 on localhost:5432 / fintech_db">
          <span className="db-status-dot"></span>
          <span>PostgreSQL 17</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Currency Switcher */}
        <div className="currency-selector" title="Change display currency">
          <label htmlFor="currency-select" className="sr-only">Currency</label>
          <select
            id="currency-select"
            value={currentCurrency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="currency-dropdown"
          >
            {Object.keys(CURRENCY_CONFIGS).map((code) => (
              <option key={code} value={code}>
                {CURRENCY_CONFIGS[code].symbol} {code}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="icon-btn theme-toggle"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* Add Transaction Primary Button */}
        <button onClick={onOpenAddModal} className="btn-primary add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>New Transaction</span>
        </button>

        {/* User Chip & Logout */}
        <div className="user-profile-chip">
          <div className="user-avatar" title={userEmail}>
            {userInitial}
          </div>
          <span className="user-email-text">{userEmail}</span>
          <button onClick={onLogout} className="logout-btn" title="Log out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
