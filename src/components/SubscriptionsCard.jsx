import { detectRecurringSubscriptions } from "../utils/subscriptions.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { getCategoryMeta } from "../utils/analytics.js";

function SubscriptionsCard({ transactions, currentCurrency }) {
  const { subscriptions, monthlyTotal, count } = detectRecurringSubscriptions(transactions);

  return (
    <div className="subscriptions-card">
      <div className="subscriptions-header">
        <div className="subs-title-wrap">
          <div className="subs-icon-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
          </div>
          <div>
            <h3>Recurring Commitments</h3>
            <p className="subs-subtitle">Active subscriptions & periodic bills</p>
          </div>
        </div>

        <div className="subs-monthly-badge">
          <span className="subs-burn-label">Committed Monthly:</span>
          <span className="subs-burn-value num-mono">{formatCurrency(monthlyTotal, currentCurrency)}</span>
        </div>
      </div>

      <div className="subscriptions-body">
        {subscriptions.length === 0 ? (
          <div className="subs-empty-state">
            <span>No recurring subscriptions identified yet. Add recurring bills like Netflix, Gym, or Utilities.</span>
          </div>
        ) : (
          <div className="subs-grid">
            {subscriptions.map((sub) => {
              const meta = getCategoryMeta(sub.category);
              return (
                <div key={sub.id} className="sub-item-card">
                  <div className="sub-left">
                    <div
                      className="sub-cat-avatar"
                      style={{ backgroundColor: meta.badgeBg, color: meta.color }}
                    >
                      {meta.icon}
                    </div>
                    <div className="sub-meta">
                      <div className="sub-name">{sub.name}</div>
                      <div className="sub-cycle">
                        <span>{sub.frequency}</span>
                        <span className="sub-dot">·</span>
                        <span className="sub-renewal-badge">Due {sub.nextBillingFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sub-right">
                    <span className="sub-amount num-mono text-rose">
                      -{formatCurrency(sub.amount, currentCurrency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="subs-footer">
        <span className="subs-hint">💡 Tracking {count} periodic services to prevent unmonitored subscription creep</span>
      </div>
    </div>
  );
}

export default SubscriptionsCard;
