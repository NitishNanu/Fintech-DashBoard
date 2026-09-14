import { formatCurrency } from "./formatCurrency.js";

/**
 * Calculates a multi-factor Financial Health Score (0 - 100)
 * and produces actionable financial intelligence insights.
 */
export function calculateFinancialHealth(transactions = [], monthlyBudget = 50000, currentCurrency = "INR") {
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  let currentMonthExpenses = 0;
  const categoryExpenses = {};

  for (const t of transactions) {
    const amt = Number(t.amount) || 0;
    if (amt > 0) {
      totalIncome += amt;
      incomeCount++;
    } else if (amt < 0) {
      const absAmt = Math.abs(amt);
      totalExpenses += absAmt;
      expenseCount++;

      const cat = t.category || "General";
      categoryExpenses[cat] = (categoryExpenses[cat] || 0) + absAmt;

      if (t.date && t.date.startsWith(currentYearMonth)) {
        currentMonthExpenses += absAmt;
      }
    }
  }

  const netBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
  const budget = Math.max(1, Number(monthlyBudget) || 50000);
  const budgetUsedPercent = (currentMonthExpenses / budget) * 100;

  // 1. Savings Rate Score (Max 35 pts)
  let savingsPoints = 0;
  if (savingsRate >= 30) {
    savingsPoints = 35;
  } else if (savingsRate >= 20) {
    savingsPoints = 30;
  } else if (savingsRate >= 10) {
    savingsPoints = 22;
  } else if (savingsRate > 0) {
    savingsPoints = 14;
  } else {
    savingsPoints = 4;
  }

  // 2. Budget Discipline Score (Max 35 pts)
  let budgetPoints = 0;
  if (budgetUsedPercent <= 65) {
    budgetPoints = 35;
  } else if (budgetUsedPercent <= 80) {
    budgetPoints = 30;
  } else if (budgetUsedPercent <= 100) {
    budgetPoints = 20;
  } else if (budgetUsedPercent <= 120) {
    budgetPoints = 10;
  } else {
    budgetPoints = 3;
  }

  // 3. Cashflow Stability (Max 30 pts)
  let cashflowPoints = 0;
  if (totalIncome > 0 && totalExpenses > 0) {
    const coverageRatio = totalIncome / totalExpenses;
    if (coverageRatio >= 1.5) cashflowPoints = 30;
    else if (coverageRatio >= 1.2) cashflowPoints = 24;
    else if (coverageRatio >= 1.0) cashflowPoints = 16;
    else cashflowPoints = 6;
  } else if (totalIncome > 0) {
    cashflowPoints = 25;
  } else {
    cashflowPoints = 5;
  }

  const overallScore = Math.min(100, Math.max(12, Math.round(savingsPoints + budgetPoints + cashflowPoints)));

  let grade = "C";
  let gradeTitle = "Fair Financial Health";
  let gradeColor = "var(--amber)";

  if (overallScore >= 90) {
    grade = "A+";
    gradeTitle = "Elite Financial Position";
    gradeColor = "var(--emerald)";
  } else if (overallScore >= 80) {
    grade = "A";
    gradeTitle = "Strong Financial Health";
    gradeColor = "var(--emerald)";
  } else if (overallScore >= 70) {
    grade = "B";
    gradeTitle = "Healthy Financial Position";
    gradeColor = "#38bdf8";
  } else if (overallScore >= 55) {
    grade = "C";
    gradeTitle = "Moderate Discipline";
    gradeColor = "var(--amber)";
  } else {
    grade = "D";
    gradeTitle = "Deficit & Overspending Risk";
    gradeColor = "var(--rose)";
  }

  // Algorithmic Insights Generation
  const insights = [];

  // Daily burn rate & month-end projection
  const dailyBurn = dayOfMonth > 0 ? currentMonthExpenses / dayOfMonth : 0;
  const projectedMonthEndSpend = currentMonthExpenses + (dailyBurn * daysRemaining);

  if (dailyBurn > 0) {
    insights.push({
      type: projectedMonthEndSpend > budget ? "warning" : "positive",
      icon: projectedMonthEndSpend > budget ? "⚠️" : "🎯",
      title: "Month-End Spending Projection",
      description: `Daily burn is ${formatCurrency(dailyBurn, currentCurrency)}/day. Projected month-end spend is ${formatCurrency(projectedMonthEndSpend, currentCurrency)} against your ${formatCurrency(budget, currentCurrency)} limit.`,
    });
  }

  // Top spending category analysis
  const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);
  if (sortedCategories.length > 0 && totalExpenses > 0) {
    const [topCat, topAmt] = sortedCategories[0];
    const topPct = Math.round((topAmt / totalExpenses) * 100);
    insights.push({
      type: topPct > 35 ? "warning" : "info",
      icon: topPct > 35 ? "🔥" : "📊",
      title: `Dominant Category: ${topCat}`,
      description: `${topCat} accounts for ${topPct}% (${formatCurrency(topAmt, currentCurrency)}) of your cumulative expenses.`,
    });
  }

  // Savings rate insight
  if (savingsRate >= 20) {
    insights.push({
      type: "positive",
      icon: "✨",
      title: "Strong Savings Momentum",
      description: `You are retaining ${savingsRate.toFixed(1)}% of your net income, placing you well above typical savings benchmarks.`,
    });
  } else if (savingsRate > 0) {
    insights.push({
      type: "info",
      icon: "💡",
      title: "Savings Growth Opportunity",
      description: `Currently saving ${savingsRate.toFixed(1)}%. Trimming 5-10% from discretionary expenses would push your health score into the 'A' tier.`,
    });
  } else {
    insights.push({
      type: "danger",
      icon: "🚨",
      title: "Negative Savings Deficit",
      description: `Outflows currently exceed inflows by ${formatCurrency(Math.abs(netBalance), currentCurrency)}. Consider reviewing recurring subscriptions.`,
    });
  }

  return {
    score: overallScore,
    grade,
    gradeTitle,
    gradeColor,
    factors: {
      savingsScore: savingsPoints,
      budgetScore: budgetPoints,
      cashflowScore: cashflowPoints,
    },
    dailyBurn,
    projectedMonthEndSpend,
    daysRemaining,
    insights,
  };
}
