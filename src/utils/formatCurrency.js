// A small, reusable pure function (Day 1 concept: same input -> same output,
// no side effects). Keeping formatting logic here means every component
// that needs to show money uses the exact same format — change it once,
// it updates everywhere.
// Multi-currency formatter supporting INR, USD, EUR, GBP
export const CURRENCY_CONFIGS = {
  INR: { locale: "en-IN", currency: "INR", symbol: "₹" },
  USD: { locale: "en-US", currency: "USD", symbol: "$" },
  EUR: { locale: "de-DE", currency: "EUR", symbol: "€" },
  GBP: { locale: "en-GB", currency: "GBP", symbol: "£" },
};

export function formatCurrency(amount, currencyCode = "INR") {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.INR;
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const sign = amount < 0 ? "-" : "";
    return `${sign}${config.symbol}${Math.abs(amount).toLocaleString()}`;
  }
}
