import { calculateFinancialHealth } from "../utils/financialHealth.js";

function HealthScoreCard({ transactions, monthlyBudget, currentCurrency }) {
  const health = calculateFinancialHealth(transactions, monthlyBudget, currentCurrency);
  const { score, grade, gradeTitle, gradeColor, factors, insights } = health;

  // SVG Circular Gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="health-score-card">
      <div className="health-card-header">
        <div className="health-title-wrap">
          <div className="health-icon-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div>
            <h3>Financial Health Index</h3>
            <p className="health-subtitle">Algorithmic spending & liquidity score</p>
          </div>
        </div>
        <span className="health-grade-pill" style={{ color: gradeColor, borderColor: `${gradeColor}40` }}>
          Grade {grade}
        </span>
      </div>

      <div className="health-card-content">
        {/* Circular Radial Score Gauge */}
        <div className="radial-score-container">
          <svg className="radial-svg" width="120" height="120" viewBox="0 0 120 120">
            {/* Background track circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="radial-bg-track"
              strokeWidth="10"
            />
            {/* Value fill circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="radial-fill"
              stroke={gradeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="radial-inner-label">
            <span className="radial-score-num num-mono">{score}</span>
            <span className="radial-score-denom">/ 100</span>
          </div>
        </div>

        {/* Score Details & Breakdown Factors */}
        <div className="health-details">
          <div className="health-status-heading">
            <h4 style={{ color: gradeColor }}>{gradeTitle}</h4>
            <p className="health-factor-sub">Weighted across 3 core liquidity pillars</p>
          </div>

          <div className="health-pillars-grid">
            <div className="pillar-item">
              <div className="pillar-label-row">
                <span>Savings Discipline</span>
                <span className="num-mono">{factors.savingsScore}/35</span>
              </div>
              <div className="pillar-track">
                <div
                  className="pillar-bar"
                  style={{ width: `${(factors.savingsScore / 35) * 100}%`, backgroundColor: "var(--emerald)" }}
                ></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-label-row">
                <span>Budget Adherence</span>
                <span className="num-mono">{factors.budgetScore}/35</span>
              </div>
              <div className="pillar-track">
                <div
                  className="pillar-bar"
                  style={{ width: `${(factors.budgetScore / 35) * 100}%`, backgroundColor: "#38bdf8" }}
                ></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-label-row">
                <span>Cashflow Stability</span>
                <span className="num-mono">{factors.cashflowScore}/30</span>
              </div>
              <div className="pillar-track">
                <div
                  className="pillar-bar"
                  style={{ width: `${(factors.cashflowScore / 30) * 100}%`, backgroundColor: "var(--indigo)" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Insights Strip */}
      {insights.length > 0 && (
        <div className="insights-strip">
          <div className="insights-strip-header">
            <span className="insights-badge">⚡ AI Insights</span>
          </div>
          <div className="insights-list">
            {insights.map((ins, idx) => (
              <div key={idx} className={`insight-card insight-${ins.type}`}>
                <span className="insight-icon">{ins.icon}</span>
                <div className="insight-text">
                  <strong>{ins.title}: </strong>
                  <span>{ins.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthScoreCard;
