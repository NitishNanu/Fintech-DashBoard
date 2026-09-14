import { MOCK_TRANSACTIONS } from "../data/mockTransactions.js";

const STORAGE_PREFIX = "fintech_app_";

function getKey(userEmail, suffix) {
  const safeEmail = (userEmail || "guest").toLowerCase().trim();
  return `${STORAGE_PREFIX}${safeEmail}_${suffix}`;
}

export function getTransactions(userEmail) {
  try {
    const raw = localStorage.getItem(getKey(userEmail, "transactions"));
    if (!raw) {
      // Seed default transactions if never initialized for this user
      const initial = [...MOCK_TRANSACTIONS];
      localStorage.setItem(getKey(userEmail, "transactions"), JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load transactions from localStorage:", err);
    return [...MOCK_TRANSACTIONS];
  }
}

export function saveTransactions(userEmail, transactions) {
  try {
    localStorage.setItem(getKey(userEmail, "transactions"), JSON.stringify(transactions));
  } catch (err) {
    console.error("Failed to save transactions to localStorage:", err);
  }
}

export function addTransaction(userEmail, transactionData) {
  const transactions = getTransactions(userEmail);
  const newTransaction = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: transactionData.name.trim(),
    category: transactionData.category || "General",
    date: transactionData.date || new Date().toISOString().split("T")[0],
    amount: Number(transactionData.amount),
    notes: (transactionData.notes || "").trim(),
    type: Number(transactionData.amount) >= 0 ? "income" : "expense",
    isRecurring: Boolean(transactionData.isRecurring),
  };

  const updated = [newTransaction, ...transactions];
  saveTransactions(userEmail, updated);
  return newTransaction;
}

export function batchAddTransactions(userEmail, items) {
  const transactions = getTransactions(userEmail);
  const newTransactions = items.map((item, idx) => ({
    id: Date.now() + idx + Math.floor(Math.random() * 1000),
    name: String(item.name).trim(),
    category: item.category || "General",
    date: item.date || new Date().toISOString().split("T")[0],
    amount: Number(item.amount),
    notes: (item.notes || "").trim(),
    type: item.type || (Number(item.amount) >= 0 ? "income" : "expense"),
    isRecurring: Boolean(item.isRecurring),
  }));

  const updated = [...newTransactions, ...transactions];
  saveTransactions(userEmail, updated);
  return newTransactions;
}

export function updateTransaction(userEmail, id, updatedFields) {
  const transactions = getTransactions(userEmail);
  const updated = transactions.map((t) => {
    if (t.id === id) {
      const amount = updatedFields.amount !== undefined ? Number(updatedFields.amount) : t.amount;
      return {
        ...t,
        ...updatedFields,
        amount,
        type: amount >= 0 ? "income" : "expense",
      };
    }
    return t;
  });

  saveTransactions(userEmail, updated);
  return updated.find((t) => t.id === id);
}

export function deleteTransaction(userEmail, id) {
  const transactions = getTransactions(userEmail);
  const updated = transactions.filter((t) => t.id !== id);
  saveTransactions(userEmail, updated);
  return updated;
}

export function resetToDefaults(userEmail) {
  const defaults = [...MOCK_TRANSACTIONS];
  saveTransactions(userEmail, defaults);
  return defaults;
}

export function getBudget(userEmail) {
  try {
    const raw = localStorage.getItem(getKey(userEmail, "budget"));
    return raw ? Number(raw) : 50000;
  } catch {
    return 50000;
  }
}

export function saveBudget(userEmail, amount) {
  try {
    localStorage.setItem(getKey(userEmail, "budget"), String(amount));
  } catch (err) {
    console.error("Failed to save budget:", err);
  }
}

export function getCategoryBudgets(userEmail) {
  try {
    const raw = localStorage.getItem(getKey(userEmail, "category_budgets"));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCategoryBudgets(userEmail, categoryBudgets) {
  try {
    localStorage.setItem(getKey(userEmail, "category_budgets"), JSON.stringify(categoryBudgets || {}));
  } catch (err) {
    console.error("Failed to save category budgets:", err);
  }
}

export function getCurrencyPreference(userEmail) {
  try {
    const raw = localStorage.getItem(getKey(userEmail, "currency"));
    return raw || "INR";
  } catch {
    return "INR";
  }
}

export function saveCurrencyPreference(userEmail, currencyCode) {
  try {
    localStorage.setItem(getKey(userEmail, "currency"), currencyCode);
  } catch (err) {
    console.error("Failed to save currency preference:", err);
  }
}
