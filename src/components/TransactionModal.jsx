import { useState, useEffect } from "react";
import { CATEGORY_META } from "../utils/analytics.js";

const DEFAULT_CATEGORIES = Object.keys(CATEGORY_META);

function TransactionModal({ isOpen, onClose, onSave, editingTransaction, currentCurrency }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense"); // "income" | "expense"
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState("");

  // When modal opens or editingTransaction changes, prepopulate form
  useEffect(() => {
    if (editingTransaction) {
      setName(editingTransaction.name || "");
      const isInc = Number(editingTransaction.amount) >= 0;
      setType(isInc ? "income" : "expense");
      setAmount(String(Math.abs(Number(editingTransaction.amount)) || ""));
      setCategory(editingTransaction.category || (isInc ? "Income" : "Food"));
      setDate(editingTransaction.date || new Date().toISOString().split("T")[0]);
      setNotes(editingTransaction.notes || "");
      setIsRecurring(Boolean(editingTransaction.isRecurring));
    } else {
      setName("");
      setType("expense");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setIsRecurring(false);
    }
    setError("");
  }, [editingTransaction, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a description or merchant name.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    const finalAmount = type === "income" ? Math.abs(parsedAmount) : -Math.abs(parsedAmount);

    onSave({
      id: editingTransaction ? editingTransaction.id : undefined,
      name: name.trim(),
      amount: finalAmount,
      category,
      date,
      notes: notes.trim(),
      isRecurring,
    });

    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{editingTransaction ? "Edit Transaction" : "New Transaction"}</h2>
            <p className="modal-subtitle">
              {editingTransaction
                ? "Modify your existing transaction record."
                : "Record a new inflow or outflow to your balance."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">⚠️ {error}</div>}

          {/* Type Toggle: Expense vs Income */}
          <div className="form-group">
            <label>Transaction Type</label>
            <div className="modal-type-toggle">
              <button
                type="button"
                className={`type-toggle-btn ${type === "expense" ? "active-expense" : ""}`}
                onClick={() => {
                  setType("expense");
                  if (category === "Income") setCategory("Food");
                }}
              >
                ▼ Expense (Outflow)
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === "income" ? "active-income" : ""}`}
                onClick={() => {
                  setType("income");
                  setCategory("Income");
                }}
              >
                ▲ Income (Inflow)
              </button>
            </div>
          </div>

          {/* Merchant / Description */}
          <div className="form-group">
            <label htmlFor="tx-name">Merchant / Description *</label>
            <input
              id="tx-name"
              type="text"
              placeholder="e.g., Salary, Grocery Store, Electric Bill"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              autoFocus
              required
            />
          </div>

          <div className="form-row-2col">
            {/* Amount */}
            <div className="form-group">
              <label htmlFor="tx-amount">Amount ({currentCurrency}) *</label>
              <input
                id="tx-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input num-mono"
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="tx-category">Category</label>
              <select
                id="tx-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            {/* Date */}
            <div className="form-group">
              <label htmlFor="tx-date">Date *</label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="tx-notes">Notes / Reference (optional)</label>
              <input
                id="tx-notes"
                type="text"
                placeholder="e.g. Card ending 4242, tax deductible"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Recurring Expense Checkbox */}
          <div className="form-group-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="checkbox-input"
              />
              <span>🔄 Mark as Recurring Bill / Subscription (e.g. Monthly Netflix, Rent, Utility)</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTransaction ? "Save Changes" : "Create Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
