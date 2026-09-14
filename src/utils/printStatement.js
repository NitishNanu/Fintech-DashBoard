import { formatCurrency } from "./formatCurrency.js";

/**
 * Generates an executive financial statement formatted for print & Save as PDF.
 */
export function printFinancialStatement(transactions = [], metrics = {}, userEmail = "user", currentCurrency = "INR") {
  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Please allow popups to generate the printable statement.");
    return;
  }

  const { netBalance = 0, totalIncome = 0, totalExpenses = 0, savingsRate = 0 } = metrics;
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const rowsHtml = transactions
    .map((t) => {
      const isIncome = Number(t.amount) >= 0;
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${t.date || ""}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${t.name || ""}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${t.category || "General"}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-transform: capitalize;">${t.type || (isIncome ? "income" : "expense")}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: 700; color: ${isIncome ? "#059669" : "#e11d48"};">
            ${isIncome ? "+" : ""}${formatCurrency(t.amount, currentCurrency)}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ledger Statement - ${userEmail}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
            padding: 40px;
            background: #ffffff;
            margin: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .brand-title {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .badge {
            display: inline-block;
            background: #4f46e5;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 9999px;
            margin-left: 6px;
          }
          .meta {
            text-align: right;
            font-size: 13px;
            color: #64748b;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 35px;
          }
          .metric-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 18px;
          }
          .metric-label {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .metric-val {
            font-size: 20px;
            font-weight: 800;
            margin-top: 6px;
            font-family: monospace;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background: #f1f5f9;
            text-align: left;
            padding: 10px 12px;
            border-bottom: 2px solid #cbd5e1;
            font-weight: 700;
            color: #475569;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">LEDGER <span class="badge">STATEMENT</span></div>
            <p style="margin-top: 6px; font-size: 14px; color: #475569;">Official Financial Ledger & Activity Record</p>
          </div>
          <div class="meta">
            <div><strong>Account:</strong> ${userEmail}</div>
            <div><strong>Date Generated:</strong> ${today}</div>
            <div><strong>Total Transactions:</strong> ${transactions.length}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="metric-box">
            <div class="metric-label">Net Balance</div>
            <div class="metric-val" style="color: ${netBalance >= 0 ? "#059669" : "#e11d48"};">
              ${formatCurrency(netBalance, currentCurrency)}
            </div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Total Inflow</div>
            <div class="metric-val" style="color: #059669;">
              ${formatCurrency(totalIncome, currentCurrency)}
            </div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Total Outflow</div>
            <div class="metric-val" style="color: #e11d48;">
              ${formatCurrency(totalExpenses, currentCurrency)}
            </div>
          </div>
          <div class="metric-box">
            <div class="metric-label">Savings Rate</div>
            <div class="metric-val">
              ${savingsRate}%
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Generated securely via Ledger PRO Fintech Intelligence System · All records authenticated
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
