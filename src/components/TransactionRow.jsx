import { formatCurrency } from "../utils/formatCurrency.js";
import { getCategoryMeta } from "../utils/analytics.js";

function TransactionRow({ transaction, currentCurrency, onEdit, onDelete }) {
  const { id, name, category, date, amount, notes } = transaction;
  const isPositive = Number(amount) >= 0;
  const meta = getCategoryMeta(category);

  // Formatted human-readable date (e.g. Sep 10, 2026)
  let formattedDate = date;
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  } catch {
    formattedDate = date;
  }

  return (
    <div className="transaction-row-card">
      <div className="row-left">
        {/* Category Avatar */}
        <div
          className="category-badge-avatar"
          style={{ backgroundColor: meta.badgeBg, color: meta.color }}
          title={category}
        >
          {meta.icon}
        </div>

        {/* Details: Name, Category, Date, Notes */}
        <div className="row-info">
          <div className="row-title-line">
            <span className="row-merchant-name">{name}</span>
            <span
              className="row-category-pill"
              style={{ color: meta.color, borderColor: `${meta.color}40` }}
            >
              {category}
            </span>
            {Boolean(transaction.isRecurring) && (
              <span className="row-recurring-pill" title="Recurring periodic commitment">
                🔄 Recurring
              </span>
            )}
          </div>
          <div className="row-meta-line">
            <span className="row-date">{formattedDate}</span>
            {notes && <span className="row-notes">· {notes}</span>}
          </div>
        </div>
      </div>

      <div className="row-right">
        {/* Amount */}
        <span className={`row-amount num-mono ${isPositive ? "text-emerald" : "text-rose"}`}>
          {isPositive ? "+" : ""}
          {formatCurrency(amount, currentCurrency)}
        </span>

        {/* Action buttons */}
        <div className="row-actions">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            className="row-action-btn edit-btn"
            title="Edit Transaction"
            aria-label={`Edit ${name}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onDelete(transaction)}
            className="row-action-btn delete-btn"
            title="Delete Transaction"
            aria-label={`Delete ${name}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionRow;
