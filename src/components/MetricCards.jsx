import { formatCurrency } from "../utils/formatCurrency.js";

function MetricCards({ metrics, currentCurrency }) {
  const {
    netBalance,
    totalIncome,
    totalExpenses,
    savingsRate,
    transactionCount,
    incomeCount,
    expenseCount,
  } = metrics;

  const isBalancePositive = netBalance >= 0;

  return (
    <div className="metrics-grid">
      {/* Total Balance Card */}
      <div className="metric-card balance-card-highlight">
        <div className="card-top">
          <div className="card-title">Total Net Balance</div>
          <span className={`status-pill ${isBalancePositive ? "pill-positive" : "pill-negative"}`}>
            {transactionCount} transactions
          </span>
        </div>
        <div className="card-value num-mono">
          {formatCurrency(netBalance, currentCurrency)}
        </div>
        <div className="card-footer">
          <span className="footer-label">
            {isBalancePositive ? "▲ Net Positive Position" : "▼ In Deficit"}
          </span>
        </div>
      </div>

      {/* Inflow Card */}
      <div className="metric-card">
        <div className="card-top">
          <div className="card-title">Total Inflow</div>
          <div className="icon-circle emerald-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </div>
        </div>
        <div className="card-value num-mono text-emerald">
          {formatCurrency(totalIncome, currentCurrency)}
        </div>
        <div className="card-footer">
          <span className="footer-muted">{incomeCount} income deposits</span>
        </div>
      </div>

      {/* Outflow Card */}
      <div className="metric-card">
        <div className="card-top">
          <div className="card-title">Total Outflow</div>
          <div className="icon-circle rose-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
        </div>
        <div className="card-value num-mono text-rose">
          {formatCurrency(totalExpenses, currentCurrency)}
        </div>
        <div className="card-footer">
          <span className="footer-muted">{expenseCount} expense debits</span>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="metric-card">
        <div className="card-top">
          <div className="card-title">Savings Rate</div>
          <div className="icon-circle indigo-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
        </div>
        <div className="card-value num-mono text-indigo">
          {savingsRate}%
        </div>
        <div className="card-footer">
          <div className="mini-progress-bar">
            <div
              className="mini-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricCards;
