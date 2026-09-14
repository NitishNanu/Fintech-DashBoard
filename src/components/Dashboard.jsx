import { useState, useEffect, useMemo } from "react";
import Header from "./Header.jsx";
import MetricCards from "./MetricCards.jsx";
import HealthScoreCard from "./HealthScoreCard.jsx";
import SubscriptionsCard from "./SubscriptionsCard.jsx";
import BudgetTracker from "./BudgetTracker.jsx";
import AnalyticsCharts from "./AnalyticsCharts.jsx";
import FilterToolbar from "./FilterToolbar.jsx";
import TransactionRow from "./TransactionRow.jsx";
import TransactionModal from "./TransactionModal.jsx";
import ImportModal from "./ImportModal.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import Toast from "./Toast.jsx";

import {
  fetchTransactions,
  apiAddTransaction,
  apiBatchAddTransactions,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiResetToDefaults,
  getBudget,
  saveBudget,
  getCategoryBudgets,
  saveCategoryBudgets,
} from "../utils/api.js";
import { calculateFinancialMetrics, CATEGORY_META } from "../utils/analytics.js";
import { exportToCsv } from "../utils/exportCsv.js";
import { printFinancialStatement } from "../utils/printStatement.js";
import "./Dashboard.css";

function Dashboard({
  userEmail,
  onLogout,
  theme,
  onToggleTheme,
  currentCurrency,
  onCurrencyChange,
}) {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(50000);
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters and Sorting State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | income | expense
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all | this-month | last-30
  const [sortBy, setSortBy] = useState("date-desc");

  // Modals & Feedback State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Load initial data, budget, and category budgets on mount or user change
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMsg("");
        const [txData, savedBudget, savedCatBudgets] = await Promise.all([
          fetchTransactions(userEmail),
          getBudget(userEmail),
          getCategoryBudgets(userEmail),
        ]);
        setTransactions(txData);
        setBudget(savedBudget);
        setCategoryBudgets(savedCatBudgets || {});
      } catch (err) {
        setErrorMsg(err.message || "Failed to load transactions.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [userEmail]);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  // Handle Save (Add or Update)
  async function handleSaveTransaction(formData) {
    try {
      if (formData.id) {
        // Edit existing
        const updated = await apiUpdateTransaction(userEmail, formData.id, formData);
        setTransactions((prev) =>
          prev.map((t) => (t.id === formData.id ? { ...t, ...updated } : t))
        );
        showToast("Transaction updated successfully!");
      } else {
        // Add new
        const newTx = await apiAddTransaction(userEmail, formData);
        setTransactions((prev) => [newTx, ...prev]);
        showToast("Transaction added successfully!");
      }
    } catch {
      showToast("Error saving transaction", "error");
    }
  }

  // Handle Batch Statement Import
  async function handleBatchImport(items) {
    try {
      const imported = await apiBatchAddTransactions(userEmail, items);
      setTransactions((prev) => [...imported, ...prev]);
      showToast(`Successfully imported ${imported.length} transactions!`);
    } catch {
      showToast("Error importing transactions", "error");
    }
  }

  // Handle Delete Confirmation
  async function handleConfirmDelete() {
    if (!deletingTransaction) return;
    try {
      await apiDeleteTransaction(userEmail, deletingTransaction.id);
      setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id));
      showToast("Transaction deleted.");
    } catch {
      showToast("Failed to delete transaction", "error");
    } finally {
      setDeletingTransaction(null);
    }
  }

  // Handle Reset to Defaults
  async function handleConfirmReset() {
    try {
      const defaults = await apiResetToDefaults(userEmail);
      setTransactions(defaults);
      showToast("Transactions restored to default sample data.");
    } catch {
      showToast("Failed to reset transactions", "error");
    } finally {
      setIsResetConfirmOpen(false);
    }
  }

  // Handle Overall Budget Update
  function handleUpdateBudget(newVal) {
    saveBudget(userEmail, newVal);
    setBudget(newVal);
    showToast("Monthly budget goal updated!");
  }

  // Handle Category Budgets Update
  function handleUpdateCategoryBudgets(newCatBudgets) {
    saveCategoryBudgets(userEmail, newCatBudgets);
    setCategoryBudgets(newCatBudgets);
    showToast("Category spending limits updated!");
  }

  // Handle Export CSV
  function handleExportCsv() {
    const filename = `ledger_${userEmail.split("@")[0]}_transactions.csv`;
    exportToCsv(filteredTransactions, filename);
    showToast(`Exported ${filteredTransactions.length} transactions to CSV.`);
  }

  // Handle Print / PDF Statement
  function handlePrintStatement() {
    printFinancialStatement(filteredTransactions, metrics, userEmail, currentCurrency);
    showToast("Statement ready for print / PDF save.");
  }

  // Dynamically extract all available categories
  const allCategories = useMemo(() => {
    const set = new Set(Object.keys(CATEGORY_META));
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Dynamic Financial Metrics
  const metrics = useMemo(() => {
    return calculateFinancialMetrics(transactions);
  }, [transactions]);

  // Dynamic Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return transactions
      .filter((t) => {
        // Search filter (name, notes, category)
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const nameMatch = (t.name || "").toLowerCase().includes(query);
          const notesMatch = (t.notes || "").toLowerCase().includes(query);
          const catMatch = (t.category || "").toLowerCase().includes(query);
          if (!nameMatch && !notesMatch && !catMatch) return false;
        }

        // Type filter
        if (typeFilter === "income" && Number(t.amount) < 0) return false;
        if (typeFilter === "expense" && Number(t.amount) >= 0) return false;

        // Category filter
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

        // Date range filter
        if (dateFilter === "this-month") {
          if (!t.date || !t.date.startsWith(currentMonthPrefix)) return false;
        } else if (dateFilter === "last-30") {
          if (!t.date || new Date(t.date) < thirtyDaysAgo) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.date || 0) - new Date(a.date || 0);
        }
        if (sortBy === "date-asc") {
          return new Date(a.date || 0) - new Date(b.date || 0);
        }
        if (sortBy === "amount-desc") {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortBy === "amount-asc") {
          return Number(a.amount) - Number(b.amount);
        }
        if (sortBy === "name-asc") {
          return (a.name || "").localeCompare(b.name || "");
        }
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, dateFilter, sortBy]);

  return (
    <div className="dashboard-app-container">
      {/* Dynamic Ambient Mesh Glow Background */}
      <div className="ambient-mesh-glow" aria-hidden="true"></div>

      {/* App Header */}
      <Header
        userEmail={userEmail}
        currentCurrency={currentCurrency}
        onCurrencyChange={onCurrencyChange}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsModalOpen(true);
        }}
        onLogout={onLogout}
      />

      <main className="dashboard-main-content">
        {/* Metric Summary Cards */}
        <MetricCards metrics={metrics} currentCurrency={currentCurrency} />

        {/* Intelligence Grid: Financial Health Score & Recurring Subscriptions */}
        <div className="intelligence-grid">
          <HealthScoreCard
            transactions={transactions}
            monthlyBudget={budget}
            currentCurrency={currentCurrency}
          />
          <SubscriptionsCard
            transactions={transactions}
            currentCurrency={currentCurrency}
          />
        </div>

        {/* Budget Tracker & Category Limits */}
        <BudgetTracker
          transactions={transactions}
          monthlyBudget={budget}
          onUpdateBudget={handleUpdateBudget}
          categoryBudgets={categoryBudgets}
          onUpdateCategoryBudgets={handleUpdateCategoryBudgets}
          currentCurrency={currentCurrency}
        />

        {/* Interactive SVG Analytics Charts (Bezier Area & Donut) */}
        <AnalyticsCharts
          transactions={transactions}
          currentCurrency={currentCurrency}
        />

        {/* Transactions Section */}
        <section className="transactions-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-title">Transactions Ledger</h2>
              <p className="section-subtitle">
                Inspect, filter, batch import, or record financial movements
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              className="btn-primary"
            >
              + Add Transaction
            </button>
          </div>

          {/* Search, Filter & Sort Toolbar */}
          <FilterToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            categories={allCategories}
            onExportCsv={handleExportCsv}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onPrintStatement={handlePrintStatement}
            onResetData={() => setIsResetConfirmOpen(true)}
            resultCount={filteredTransactions.length}
          />

          {/* Conditional state rendering */}
          {isLoading ? (
            <div className="state-card">
              <div className="loading-spinner"></div>
              <p>Syncing financial data...</p>
            </div>
          ) : errorMsg ? (
            <div className="state-card error-card">
              <span className="state-icon">⚠️</span>
              <p>{errorMsg}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="state-card empty-card">
              <span className="state-icon">🔍</span>
              <h3>No matching transactions found</h3>
              <p>Try clearing your filters, importing a statement, or adding a transaction.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setCategoryFilter("all");
                  setDateFilter("all");
                }}
                className="btn-outline-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {filteredTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  currentCurrency={currentCurrency}
                  onEdit={(t) => {
                    setEditingTransaction(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={(t) => setDeletingTransaction(t)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        currentCurrency={currentCurrency}
      />

      {/* Bank Statement CSV Importer Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleBatchImport}
        currentCurrency={currentCurrency}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingTransaction}
        title="Delete Transaction?"
        message={
          deletingTransaction
            ? `Are you sure you want to permanently delete "${deletingTransaction.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTransaction(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset to Sample Transactions?"
        message="This will overwrite your current transactions and restore the default sample dataset. Are you sure?"
        confirmText="Reset to Sample Data"
        isDanger={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
