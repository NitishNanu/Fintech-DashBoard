function FilterToolbar({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  dateFilter,
  onDateFilterChange,
  sortBy,
  onSortByChange,
  categories,
  onExportCsv,
  onOpenImportModal,
  onPrintStatement,
  onResetData,
  resultCount,
}) {
  return (
    <div className="filter-toolbar-card">
      {/* Top row: Search, Type toggle, Export & Reset */}
      <div className="filter-row-top">
        {/* Search Box */}
        <div className="search-input-wrap">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by merchant, note, category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="clear-search-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type Filter Buttons */}
        <div className="type-toggle-group">
          <button
            type="button"
            className={`type-tab ${typeFilter === "all" ? "active" : ""}`}
            onClick={() => onTypeFilterChange("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`type-tab ${typeFilter === "income" ? "active" : ""}`}
            onClick={() => onTypeFilterChange("income")}
          >
            + Inflow
          </button>
          <button
            type="button"
            className={`type-tab ${typeFilter === "expense" ? "active" : ""}`}
            onClick={() => onTypeFilterChange("expense")}
          >
            - Outflow
          </button>
        </div>

        {/* Action buttons: Import, Print, Export & Reset */}
        <div className="toolbar-extra-actions">
          <button
            onClick={onOpenImportModal}
            className="btn-toolbar-action"
            title="Import bank statement CSV file"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Import CSV</span>
          </button>

          <button
            onClick={onPrintStatement}
            className="btn-toolbar-action"
            title="Print or Save as PDF financial statement"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Statement</span>
          </button>

          <button
            onClick={onExportCsv}
            className="btn-toolbar-action"
            title="Download filtered transactions as CSV file"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export</span>
          </button>

          <button
            onClick={onResetData}
            className="btn-toolbar-action text-muted"
            title="Reset to default sample transactions"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Category filter, Date Range, Sort By, and Results badge */}
      <div className="filter-row-bottom">
        <div className="select-controls-group">
          {/* Category Dropdown */}
          <div className="filter-select-wrapper">
            <span className="select-label">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div className="filter-select-wrapper">
            <span className="select-label">Period:</span>
            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="this-month">This Month</option>
              <option value="last-30">Last 30 Days</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="filter-select-wrapper">
            <span className="select-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="results-badge">
          Showing <strong>{resultCount}</strong> transactions
        </div>
      </div>
    </div>
  );
}

export default FilterToolbar;
