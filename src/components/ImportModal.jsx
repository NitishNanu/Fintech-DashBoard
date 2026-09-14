import { useState, useRef } from "react";
import { formatCurrency } from "../utils/formatCurrency.js";

function ImportModal({ isOpen, onClose, onImport, currentCurrency }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  function handleReset() {
    setFile(null);
    setParsedRows([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function parseCSVText(text) {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error("CSV file does not contain enough data (minimum 1 header + 1 row required).");
    }

    // Parse header row
    const rawHeaders = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());

    const dateIdx = rawHeaders.findIndex((h) => h.includes("date") || h.includes("time"));
    const nameIdx = rawHeaders.findIndex((h) => h.includes("name") || h.includes("merchant") || h.includes("desc") || h.includes("title") || h.includes("party"));
    const amountIdx = rawHeaders.findIndex((h) => h.includes("amount") || h.includes("val") || h.includes("price") || h.includes("total"));
    const categoryIdx = rawHeaders.findIndex((h) => h.includes("cat"));
    const typeIdx = rawHeaders.findIndex((h) => h.includes("type"));
    const notesIdx = rawHeaders.findIndex((h) => h.includes("note") || h.includes("memo") || h.includes("comment"));

    if (amountIdx === -1) {
      throw new Error("Could not find an 'Amount' column in the CSV file.");
    }

    const transactions = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV tokenizer supporting quotes
      const rowRegex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const values = [];
      let match;
      while ((match = rowRegex.exec(lines[i])) !== null) {
        let val = match[1];
        if (val !== undefined) {
          val = val.replace(/^"|"$/g, "").replace(/""/g, '"').trim();
          values.push(val);
        }
        if (match.index === rowRegex.lastIndex) break;
      }

      if (values.length <= 1 && !values[0]) continue;

      const rawAmountStr = values[amountIdx] || "0";
      // Remove currency symbols and formatting commas
      const cleanAmountStr = rawAmountStr.replace(/[^\d.-]/g, "");
      let amount = parseFloat(cleanAmountStr);
      if (isNaN(amount)) continue;

      let date = dateIdx !== -1 ? values[dateIdx] : "";
      if (!date || isNaN(new Date(date).getTime())) {
        date = new Date().toISOString().split("T")[0];
      } else {
        date = new Date(date).toISOString().split("T")[0];
      }

      const name = nameIdx !== -1 && values[nameIdx] ? values[nameIdx] : `Imported Item #${i}`;
      let category = categoryIdx !== -1 && values[categoryIdx] ? values[categoryIdx] : (amount >= 0 ? "Income" : "General");
      let type = typeIdx !== -1 && values[typeIdx] ? values[typeIdx].toLowerCase() : (amount >= 0 ? "income" : "expense");

      if (type === "expense" && amount > 0) {
        amount = -amount;
      }

      const notes = notesIdx !== -1 ? values[notesIdx] : "Imported from CSV statement";

      transactions.push({
        name,
        category,
        date,
        amount,
        type,
        notes,
      });
    }

    if (transactions.length === 0) {
      throw new Error("No valid transactions could be parsed from the selected CSV file.");
    }

    return transactions;
  }

  function handleFileSelected(selectedFile) {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv") && selectedFile.type !== "text/csv") {
      setError("Please select a valid .csv file.");
      return;
    }

    setError("");
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCSVText(text);
        setParsedRows(parsed);
      } catch (err) {
        setError(err.message || "Failed to parse CSV file.");
        setParsedRows([]);
      }
    };
    reader.onerror = () => {
      setError("Error reading the selected file.");
    };
    reader.readAsText(selectedFile);
  }

  async function handleSubmit() {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    try {
      await onImport(parsedRows);
      onClose();
      handleReset();
    } catch (err) {
      setError(err.message || "Failed to import transactions.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container import-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div>
              <h2>Import Bank Statement</h2>
              <p className="modal-subtitle">Upload a CSV statement to bulk import transactions</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body import-modal-body">
          {error && <div className="modal-error-banner">⚠️ {error}</div>}

          {!file ? (
            <div
              className={`dropzone-area ${isDragging ? "drag-active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelected(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />
              <div className="dropzone-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <p className="dropzone-title">Drop your bank CSV statement here</p>
              <p className="dropzone-sub">or click to browse files from your computer</p>
              <span className="dropzone-hint">Supports standard CSV with Date, Merchant/Name, and Amount columns</span>
            </div>
          ) : (
            <div className="import-preview-section">
              <div className="file-info-bar">
                <div className="file-name-meta">
                  <span className="file-icon">📄</span>
                  <div>
                    <strong>{file.name}</strong>
                    <span className="file-rows-count"> · {parsedRows.length} transactions ready</span>
                  </div>
                </div>
                <button type="button" onClick={handleReset} className="btn-change-file">
                  Choose another file
                </button>
              </div>

              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Merchant / Name</th>
                      <th>Category</th>
                      <th style={{ textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 6).map((r, i) => (
                      <tr key={i}>
                        <td className="num-mono">{r.date}</td>
                        <td><strong>{r.name}</strong></td>
                        <td><span className="preview-cat-badge">{r.category}</span></td>
                        <td className={`num-mono ${Number(r.amount) >= 0 ? "text-emerald" : "text-rose"}`} style={{ textAlign: "right" }}>
                          {formatCurrency(r.amount, currentCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 6 && (
                  <div className="preview-more-hint">
                    + {parsedRows.length - 6} more records will be imported...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={isProcessing}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={parsedRows.length === 0 || isProcessing}
          >
            {isProcessing ? "Importing..." : `Import ${parsedRows.length} Transactions`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
