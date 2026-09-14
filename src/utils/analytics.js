export const CATEGORY_META = {
  Income: { icon: "💰", color: "#10b981", badgeBg: "rgba(16, 185, 129, 0.15)" },
  Food: { icon: "🍔", color: "#f59e0b", badgeBg: "rgba(245, 158, 11, 0.15)" },
  Utilities: { icon: "⚡", color: "#6366f1", badgeBg: "rgba(99, 102, 241, 0.15)" },
  Shopping: { icon: "🛍️", color: "#ec4899", badgeBg: "rgba(236, 72, 153, 0.15)" },
  Entertainment: { icon: "🎬", color: "#8b5cf6", badgeBg: "rgba(139, 92, 246, 0.15)" },
  Health: { icon: "🏋️", color: "#06b6d4", badgeBg: "rgba(6, 182, 212, 0.15)" },
  Travel: { icon: "✈️", color: "#3b82f6", badgeBg: "rgba(59, 130, 246, 0.15)" },
  Investment: { icon: "📈", color: "#14b8a6", badgeBg: "rgba(20, 184, 166, 0.15)" },
  General: { icon: "💳", color: "#94a3b8", badgeBg: "rgba(148, 163, 184, 0.15)" },
};

export function getCategoryMeta(categoryName) {
  return CATEGORY_META[categoryName] || CATEGORY_META.General;
}

export function calculateFinancialMetrics(transactions = []) {
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (amt > 0) {
      totalIncome += amt;
      incomeCount++;
    } else if (amt < 0) {
      totalExpenses += Math.abs(amt);
      expenseCount++;
    }
  }

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;
  const avgExpense = expenseCount > 0 ? Math.round(totalExpenses / expenseCount) : 0;

  return {
    netBalance,
    totalIncome,
    totalExpenses,
    savingsRate,
    transactionCount: transactions.length,
    incomeCount,
    expenseCount,
    avgExpense,
  };
}

export function calculateCategoryBreakdown(transactions = []) {
  const expenseTransactions = transactions.filter((t) => Number(t.amount) < 0);
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

  if (totalExpense === 0) {
    return [];
  }

  const categoryTotals = {};
  for (const t of expenseTransactions) {
    const cat = t.category || "General";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(Number(t.amount));
  }

  return Object.entries(categoryTotals)
    .map(([category, amount]) => {
      const meta = getCategoryMeta(category);
      const percentage = Math.round((amount / totalExpense) * 100);
      return {
        category,
        amount,
        percentage,
        color: meta.color,
        icon: meta.icon,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function calculateMonthlyCashflow(transactions = []) {
  const monthsMap = {};

  // Sort transactions by date ascending
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const t of sorted) {
    if (!t.date) continue;
    const dateObj = new Date(t.date);
    if (isNaN(dateObj.getTime())) continue;

    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = dateObj.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = {
        key: monthKey,
        label: monthLabel,
        income: 0,
        expense: 0,
      };
    }

    const amt = Number(t.amount) || 0;
    if (amt > 0) {
      monthsMap[monthKey].income += amt;
    } else {
      monthsMap[monthKey].expense += Math.abs(amt);
    }
  }

  const keys = Object.keys(monthsMap).sort();
  // Take last 6 months or all if less
  const recentKeys = keys.slice(-6);
  return recentKeys.map((k) => monthsMap[k]);
}

export function calculateBudgetHealth(transactions = [], monthlyBudget = 50000) {
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const currentMonthExpenses = transactions
    .filter((t) => {
      if (!t.date || Number(t.amount) >= 0) return false;
      return t.date.startsWith(currentYearMonth);
    })
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const budget = Math.max(1, Number(monthlyBudget) || 50000);
  const percentUsed = Math.min(100, Math.round((currentMonthExpenses / budget) * 100));
  const remaining = Math.max(0, budget - currentMonthExpenses);
  const isOverBudget = currentMonthExpenses > budget;
  const isWarning = percentUsed >= 80 && !isOverBudget;

  return {
    spent: currentMonthExpenses,
    budget,
    remaining,
    percentUsed,
    isOverBudget,
    isWarning,
  };
}
