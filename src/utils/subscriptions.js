/**
 * Subscriptions & Recurring Expenses Detection & Analytics
 */

const RECURRING_KEYWORDS = [
  "netflix",
  "spotify",
  "gym",
  "subscription",
  "electricity",
  "power board",
  "mobile recharge",
  "broadband",
  "wifi",
  "internet",
  "prime",
  "amazon prime",
  "disney",
  "hulu",
  "apple",
  "icloud",
  "google one",
  "chatgpt",
  "openai",
  "github",
  "cloud",
  "rent",
  "insurance",
  "membership",
  "hotstar",
  "youtube",
  "swiggy one",
  "zomato gold",
];

export function detectRecurringSubscriptions(transactions = []) {
  const expenseTransactions = transactions.filter((t) => Number(t.amount) < 0);
  const detected = [];
  const seenMerchants = new Set();

  for (const t of expenseTransactions) {
    const lowerName = (t.name || "").toLowerCase();
    const isKeywordMatch = RECURRING_KEYWORDS.some((kw) => lowerName.includes(kw));
    const isExplicitRecurring = Boolean(t.isRecurring);

    if ((isKeywordMatch || isExplicitRecurring) && !seenMerchants.has(lowerName)) {
      seenMerchants.add(lowerName);

      // Estimate next billing date (same day next month or upcoming day in current month)
      const dateObj = t.date ? new Date(t.date) : new Date();
      const day = isNaN(dateObj.getDate()) ? 1 : dateObj.getDate();

      const now = new Date();
      let nextBilling = new Date(now.getFullYear(), now.getMonth(), day);
      if (nextBilling < now) {
        nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, day);
      }

      detected.push({
        id: t.id,
        name: t.name,
        category: t.category || "Subscriptions",
        amount: Math.abs(Number(t.amount)),
        frequency: "Monthly",
        lastBilledDate: t.date,
        nextBillingDate: nextBilling.toISOString().split("T")[0],
        nextBillingFormatted: nextBilling.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isExplicit: isExplicitRecurring,
      });
    }
  }

  // Calculate monthly total
  const monthlyTotal = detected.reduce((sum, item) => sum + item.amount, 0);

  return {
    subscriptions: detected,
    monthlyTotal,
    count: detected.length,
  };
}
