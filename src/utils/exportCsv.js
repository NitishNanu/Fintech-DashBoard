export function exportToCsv(transactions, filename = "ledger_transactions.csv") {
  if (!transactions || transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const headers = ["ID", "Date", "Name", "Category", "Amount", "Type", "Notes"];
  const rows = transactions.map((t) => [
    t.id,
    `"${t.date || ""}"`,
    `"${(t.name || "").replace(/"/g, '""')}"`,
    `"${(t.category || "").replace(/"/g, '""')}"`,
    t.amount,
    `"${Number(t.amount) >= 0 ? "Income" : "Expense"}"`,
    `"${(t.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
