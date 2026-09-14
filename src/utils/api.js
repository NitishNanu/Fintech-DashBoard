import {
  getTransactions as fallbackGetTransactions,
  addTransaction as fallbackAddTransaction,
  updateTransaction as fallbackUpdateTransaction,
  deleteTransaction as fallbackDeleteTransaction,
  resetToDefaults as fallbackResetToDefaults,
  getBudget as fallbackGetBudget,
  saveBudget as fallbackSaveBudget,
  getCurrencyPreference as fallbackGetCurrency,
  saveCurrencyPreference as fallbackSaveCurrency,
  batchAddTransactions as fallbackBatchAddTransactions,
  getCategoryBudgets as fallbackGetCategoryBudgets,
  saveCategoryBudgets as fallbackSaveCategoryBudgets,
} from "./storage.js";

const API_BASE = "/api";

// Helper for HTTP requests
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchTransactions(userEmail) {
  try {
    const data = await request(`/transactions?userEmail=${encodeURIComponent(userEmail)}`);
    return data;
  } catch (err) {
    console.warn("PostgreSQL backend request failed, falling back to local cache:", err);
    return fallbackGetTransactions(userEmail);
  }
}

export async function apiAddTransaction(userEmail, transactionData) {
  try {
    const newTx = await request("/transactions", {
      method: "POST",
      body: JSON.stringify({ userEmail, ...transactionData }),
    });
    return newTx;
  } catch (err) {
    console.warn("PostgreSQL add failed, falling back to local cache:", err);
    return fallbackAddTransaction(userEmail, transactionData);
  }
}

export async function apiUpdateTransaction(userEmail, id, updatedFields) {
  try {
    const updated = await request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ userEmail, ...updatedFields }),
    });
    return updated;
  } catch (err) {
    console.warn("PostgreSQL update failed, falling back to local cache:", err);
    return fallbackUpdateTransaction(userEmail, id, updatedFields);
  }
}

export async function apiDeleteTransaction(userEmail, id) {
  try {
    await request(`/transactions/${id}?userEmail=${encodeURIComponent(userEmail)}`, {
      method: "DELETE",
    });
    return { success: true, id };
  } catch (err) {
    console.warn("PostgreSQL delete failed, falling back to local cache:", err);
    return fallbackDeleteTransaction(userEmail, id);
  }
}

export async function apiResetToDefaults(userEmail) {
  try {
    const defaults = await request("/transactions/reset", {
      method: "POST",
      body: JSON.stringify({ userEmail }),
    });
    return defaults;
  } catch (err) {
    console.warn("PostgreSQL reset failed, falling back to local cache:", err);
    return fallbackResetToDefaults(userEmail);
  }
}

export async function apiBatchAddTransactions(userEmail, items) {
  try {
    const res = await request("/transactions/batch", {
      method: "POST",
      body: JSON.stringify({ userEmail, transactions: items }),
    });
    return res.inserted || [];
  } catch (err) {
    console.warn("PostgreSQL batch add failed, falling back to local cache:", err);
    return fallbackBatchAddTransactions(userEmail, items);
  }
}

export async function getBudget(userEmail) {
  try {
    const prefs = await request(`/preferences?userEmail=${encodeURIComponent(userEmail)}`);
    return prefs.monthlyBudget || 50000;
  } catch {
    return fallbackGetBudget(userEmail);
  }
}

export async function saveBudget(userEmail, amount) {
  try {
    await request("/preferences", {
      method: "POST",
      body: JSON.stringify({ userEmail, monthlyBudget: amount }),
    });
    fallbackSaveBudget(userEmail, amount);
  } catch {
    fallbackSaveBudget(userEmail, amount);
  }
}

export async function getCategoryBudgets(userEmail) {
  try {
    const prefs = await request(`/preferences?userEmail=${encodeURIComponent(userEmail)}`);
    return prefs.categoryBudgets || {};
  } catch {
    return fallbackGetCategoryBudgets(userEmail);
  }
}

export async function saveCategoryBudgets(userEmail, categoryBudgets) {
  try {
    await request("/preferences", {
      method: "POST",
      body: JSON.stringify({ userEmail, categoryBudgets }),
    });
    fallbackSaveCategoryBudgets(userEmail, categoryBudgets);
  } catch {
    fallbackSaveCategoryBudgets(userEmail, categoryBudgets);
  }
}

export async function getCurrencyPreference(userEmail) {
  try {
    const prefs = await request(`/preferences?userEmail=${encodeURIComponent(userEmail)}`);
    return prefs.currency || "INR";
  } catch {
    return fallbackGetCurrency(userEmail);
  }
}

export async function saveCurrencyPreference(userEmail, currencyCode) {
  try {
    await request("/preferences", {
      method: "POST",
      body: JSON.stringify({ userEmail, currency: currencyCode }),
    });
    fallbackSaveCurrency(userEmail, currencyCode);
  } catch {
    fallbackSaveCurrency(userEmail, currencyCode);
  }
}

export async function checkDatabaseHealth() {
  try {
    return await request("/health");
  } catch (err) {
    return { status: "offline", error: err.message };
  }
}
