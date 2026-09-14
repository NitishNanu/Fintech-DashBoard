import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency.js";
import { calculateBudgetHealth, CATEGORY_META, getCategoryMeta } from "../utils/analytics.js";

const DEFAULT_CATEGORY_CAPS = {
  Food: 12000,
  Utilities: 5000,
  Shopping: 10000,
  Entertainment: 4000,
  Health: 3000,
  Travel: 6000,
  General: 5000,
};

function BudgetTracker({
  transactions,
  monthlyBudget,
  onUpdateBudget,
  categoryBudgets = {},
  onUpdateCategoryBudgets,
  currentCurrency,
}) {
  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(monthlyBudget);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryDrafts, setCategoryDrafts] = useState({});

  const { spent, budget, remaining, percentUsed, isOverBudget, isWarning } =
    calculateBudgetHealth(transactions, monthlyBudget);

  // Calculate current month's expenses by category
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthCatSpend = {};

  for (const t of transactions) {
    if (t.date && t.date.startsWith(currentYearMonth) && Number(t.amount) < 0) {
      const cat = t.category || "General";
      currentMonthCatSpend[cat] = (currentMonthCatSpend[cat] || 0) + Math.abs(Number(t.amount));
    }
  }

  const effectiveCategoryBudgets = {
    ...DEFAULT_CATEGORY_CAPS,
    ...categoryBudgets,
  };

  const trackedCategories = Object.keys(DEFAULT_CATEGORY_CAPS);

  function handleSaveOverall(e) {
    e.preventDefault();
    const num = Number(newBudgetVal);
    if (!isNaN(num) && num > 0) {
      onUpdateBudget(num);
      setIsEditingOverall(false);
    }
  }

  function handleOpenCategoryManager() {
    setCategoryDrafts({ ...effectiveCategoryBudgets });
    setShowCategoryManager(true);
  }

  function handleSaveCategoryBudgets(e) {
    e.preventDefault();
    if (onUpdateCategoryBudgets) {
      onUpdateCategoryBudgets(categoryDrafts);
    }
    setShowCategoryManager(false);
  }

  let progressColor = "var(--emerald)";
  if (isOverBudget) {
    progressColor = "var(--rose)";
  } else if (isWarning) {
    progressColor = "var(--amber)";
  }

  return (
    <div className="budget-card">
      <div className="budget-header">
        <div className="budget-title-wrap">
          <div className="budget-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3>Monthly Budget & Category Limits</h3>
            <p className="budget-subtitle">
              Current month spending against target thresholds
            </p>
          </div>
        </div>

        <div className="budget-actions">
          {isEditingOverall ? (
            <form onSubmit={handleSaveOverall} className="budget-edit-form">
              <input
                type="number"
                value={newBudgetVal}
                onChange={(e) => setNewBudgetVal(e.target.value)}
                min="100"
                step="100"
                className="budget-input"
                autoFocus
              />
              <button type="submit" className="btn-xs btn-primary">Save</button>
              <button
                type="button"
                onClick={() => {
                  setNewBudgetVal(monthlyBudget);
                  setIsEditingOverall(false);
                }}
                className="btn-xs btn-secondary"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="budget-btn-row">
              <button
                onClick={() => {
                  setNewBudgetVal(monthlyBudget);
                  setIsEditingOverall(true);
                }}
                className="btn-outline-sm"
                title="Change monthly overall spending cap"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit Overall Cap</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCategoryManager}
                className="btn-outline-sm"
                title="Configure spending limits per category"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Category Caps</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="budget-body">
        {/* Overall Budget Progress */}
        <div className="budget-stats">
          <div>
            <span className="stat-label">Spent This Month</span>
            <div className="stat-val num-mono">{formatCurrency(spent, currentCurrency)}</div>
          </div>
          <div className="stat-middle">
            <span className="stat-label">Target Limit</span>
            <div className="stat-val num-mono">{formatCurrency(budget, currentCurrency)}</div>
          </div>
          <div className="stat-right">
            <span className="stat-label">
              {isOverBudget ? "Over Budget By" : "Remaining Allowance"}
            </span>
            <div className={`stat-val num-mono ${isOverBudget ? "text-rose" : "text-emerald"}`}>
              {isOverBudget
                ? formatCurrency(spent - budget, currentCurrency)
                : formatCurrency(remaining, currentCurrency)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="budget-progress-wrap">
          <div className="budget-bar-bg">
            <div
              className="budget-bar-fill"
              style={{
                width: `${percentUsed}%`,
                backgroundColor: progressColor,
              }}
            ></div>
          </div>
          <div className="budget-bar-labels">
            <span>{percentUsed}% spent</span>
            {isOverBudget && <span className="alert-text danger">⚠️ Exceeded Monthly Cap!</span>}
            {isWarning && <span className="alert-text warning">⚠️ 80%+ Budget Consumed</span>}
            {!isOverBudget && !isWarning && <span className="alert-text success">✓ Spending on target</span>}
          </div>
        </div>

        {/* Category Budget Caps Breakdown */}
        <div className="category-budgets-section">
          <div className="cat-budgets-title-bar">
            <h4>Category Spending Limits</h4>
            <span className="cat-budgets-sub">Paced against monthly individual caps</span>
          </div>

          <div className="category-budgets-grid">
            {trackedCategories.map((cat) => {
              const meta = getCategoryMeta(cat);
              const catSpent = currentMonthCatSpend[cat] || 0;
              const catCap = effectiveCategoryBudgets[cat] || 5000;
              const catPct = Math.min(100, Math.round((catSpent / catCap) * 100));
              const isOver = catSpent > catCap;
              const isNear = catPct >= 80 && !isOver;

              let barColor = "var(--emerald)";
              if (isOver) barColor = "var(--rose)";
              else if (isNear) barColor = "var(--amber)";

              return (
                <div key={cat} className="cat-budget-row">
                  <div className="cat-budget-header">
                    <span className="cat-budget-name">
                      <span className="cat-bullet" style={{ color: meta.color }}>{meta.icon}</span>
                      {cat}
                    </span>
                    <span className="cat-budget-vals num-mono">
                      <strong className={isOver ? "text-rose" : ""}>{formatCurrency(catSpent, currentCurrency)}</strong>
                      <span className="cat-cap-denom"> / {formatCurrency(catCap, currentCurrency)}</span>
                    </span>
                  </div>

                  <div className="cat-bar-track">
                    <div
                      className="cat-bar-fill"
                      style={{ width: `${catPct}%`, backgroundColor: barColor }}
                    ></div>
                  </div>

                  <div className="cat-bar-footer">
                    <span className="cat-pct-label">{catPct}% consumed</span>
                    {isOver && <span className="cat-over-badge">Over Limit</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="modal-overlay" onClick={() => setShowCategoryManager(false)}>
          <div className="modal-container cat-manager-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge">🎯</div>
                <div>
                  <h2>Configure Category Budgets</h2>
                  <p className="modal-subtitle">Set maximum monthly spending allowances per category</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowCategoryManager(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCategoryBudgets} className="modal-body">
              <div className="cat-manager-inputs">
                {trackedCategories.map((cat) => {
                  const meta = getCategoryMeta(cat);
                  return (
                    <div key={cat} className="cat-input-row">
                      <label className="cat-input-label">
                        <span>{meta.icon}</span>
                        <strong>{cat} Cap</strong>
                      </label>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={categoryDrafts[cat] || ""}
                        onChange={(e) =>
                          setCategoryDrafts({
                            ...categoryDrafts,
                            [cat]: Number(e.target.value),
                          })
                        }
                        className="modal-input"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setShowCategoryManager(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Category Caps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetTracker;
