import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool, initDb } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Seed default starter records
const DEFAULT_TRANSACTIONS = [
  { name: "Salary Deposit", category: "Income", date: "2026-09-10", amount: 45000, type: "income", notes: "Tech Salary" },
  { name: "Swiggy", category: "Food", date: "2026-09-10", amount: -420, type: "expense", notes: "Dinner" },
  { name: "Electricity Bill", category: "Utilities", date: "2026-09-09", amount: -1350, type: "expense", notes: "Power board" },
  { name: "Amazon Purchase", category: "Shopping", date: "2026-09-08", amount: -2199, type: "expense", notes: "Keyboard" },
  { name: "Freelance Payment", category: "Income", date: "2026-09-07", amount: 8000, type: "income", notes: "Landing page" },
  { name: "Netflix Subscription", category: "Entertainment", date: "2026-09-05", amount: -649, type: "expense", notes: "Monthly" },
  { name: "Gym Membership", category: "Health", date: "2026-09-03", amount: -1200, type: "expense", notes: "Renewal" },
  { name: "Mobile Recharge", category: "Utilities", date: "2026-09-02", amount: -299, type: "expense", notes: "Mobile data" },
];

// Root health check (convenient for Render service liveness check)
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Ledger Pro Fintech API",
    documentation: "/api/health",
  });
});

// Health check with database connection test
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "healthy",
      database: "Connected",
      serverTime: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", error: err.message });
  }
});

// GET all transactions for a user
app.get("/api/transactions", async (req, res) => {
  const userEmail = (req.query.userEmail || "nitish@gmail.com").toLowerCase().trim();
  try {
    const { rows } = await pool.query(
      "SELECT id, user_email as \"userEmail\", name, category, amount::float, type, TO_CHAR(date, 'YYYY-MM-DD') as date, notes, COALESCE(is_recurring, false) as \"isRecurring\" FROM transactions WHERE user_email = $1 ORDER BY date DESC, id DESC",
      [userEmail]
    );

    // If no transactions exist for user, seed defaults
    if (rows.length === 0) {
      for (const t of DEFAULT_TRANSACTIONS) {
        await pool.query(
          "INSERT INTO transactions (user_email, name, category, date, amount, type, notes, is_recurring) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [userEmail, t.name, t.category, t.date, t.amount, t.type, t.notes, t.name.includes("Netflix") || t.name.includes("Subscription") || t.name.includes("Electricity") || t.name.includes("Gym")]
        );
      }
      const seeded = await pool.query(
        "SELECT id, user_email as \"userEmail\", name, category, amount::float, type, TO_CHAR(date, 'YYYY-MM-DD') as date, notes, COALESCE(is_recurring, false) as \"isRecurring\" FROM transactions WHERE user_email = $1 ORDER BY date DESC, id DESC",
        [userEmail]
      );
      return res.json(seeded.rows);
    }

    res.json(rows);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    res.status(500).json({ error: "Database query failed: " + err.message });
  }
});

// POST a new transaction
app.post("/api/transactions", async (req, res) => {
  const { userEmail, name, category, amount, type, date, notes, isRecurring } = req.body;
  if (!userEmail || !name || amount === undefined || !date) {
    return res.status(400).json({ error: "Missing required transaction fields" });
  }

  const safeEmail = userEmail.toLowerCase().trim();
  const numAmount = Number(amount);
  const txType = type || (numAmount >= 0 ? "income" : "expense");

  try {
    const { rows } = await pool.query(
      `INSERT INTO transactions (user_email, name, category, amount, type, date, notes, is_recurring)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_email as "userEmail", name, category, amount::float, type, TO_CHAR(date, 'YYYY-MM-DD') as date, notes, COALESCE(is_recurring, false) as "isRecurring"`,
      [safeEmail, name.trim(), category || "General", numAmount, txType, date, (notes || "").trim(), Boolean(isRecurring)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    res.status(500).json({ error: "Failed to create transaction: " + err.message });
  }
});

// POST batch transactions (Import CSV / Statement)
app.post("/api/transactions/batch", async (req, res) => {
  const { userEmail, transactions: items } = req.body;
  if (!userEmail || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Valid userEmail and transactions array required" });
  }

  const safeEmail = userEmail.toLowerCase().trim();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = [];
    for (const item of items) {
      if (!item.name || item.amount === undefined || !item.date) continue;
      const numAmount = Number(item.amount);
      const txType = item.type || (numAmount >= 0 ? "income" : "expense");
      const { rows } = await client.query(
        `INSERT INTO transactions (user_email, name, category, amount, type, date, notes, is_recurring)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, user_email as "userEmail", name, category, amount::float, type, TO_CHAR(date, 'YYYY-MM-DD') as date, notes, COALESCE(is_recurring, false) as "isRecurring"`,
        [safeEmail, String(item.name).trim(), item.category || "General", numAmount, txType, item.date, (item.notes || "").trim(), Boolean(item.isRecurring)]
      );
      inserted.push(rows[0]);
    }
    await client.query("COMMIT");
    res.status(201).json({ count: inserted.length, inserted });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/transactions/batch error:", err);
    res.status(500).json({ error: "Batch import failed: " + err.message });
  } finally {
    client.release();
  }
});

// PUT / UPDATE an existing transaction
app.put("/api/transactions/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, category, amount, type, date, notes, isRecurring } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }

  const numAmount = amount !== undefined ? Number(amount) : null;
  const txType = type || (numAmount !== null ? (numAmount >= 0 ? "income" : "expense") : null);

  try {
    const { rows } = await pool.query(
      `UPDATE transactions
       SET name = COALESCE($1, name),
           category = COALESCE($2, category),
           amount = COALESCE($3, amount),
           type = COALESCE($4, type),
           date = COALESCE($5, date),
           notes = COALESCE($6, notes),
           is_recurring = COALESCE($7, is_recurring)
       WHERE id = $8
       RETURNING id, user_email as "userEmail", name, category, amount::float, type, TO_CHAR(date, 'YYYY-MM-DD') as date, notes, COALESCE(is_recurring, false) as "isRecurring"`,
      [name, category, numAmount, txType, date, notes, isRecurring !== undefined ? Boolean(isRecurring) : null, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /api/transactions/:id error:", err);
    res.status(500).json({ error: "Failed to update transaction: " + err.message });
  }
});

// DELETE a transaction
app.delete("/api/transactions/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }

  try {
    const { rowCount } = await pool.query("DELETE FROM transactions WHERE id = $1", [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted successfully", id });
  } catch (err) {
    console.error("DELETE /api/transactions/:id error:", err);
    res.status(500).json({ error: "Failed to delete transaction: " + err.message });
  }
});

// POST reset transactions to defaults
app.post("/api/transactions/reset", async (req, res) => {
  const userEmail = (req.body.userEmail || "nitish@gmail.com").toLowerCase().trim();
  try {
    await pool.query("DELETE FROM transactions WHERE user_email = $1", [userEmail]);
    for (const t of DEFAULT_TRANSACTIONS) {
      await pool.query(
        "INSERT INTO transactions (user_email, name, category, date, amount, type, notes, is_recurring) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [userEmail, t.name, t.category, t.date, t.amount, t.type, t.notes, t.name.includes("Netflix") || t.name.includes("Subscription") || t.name.includes("Electricity") || t.name.includes("Gym")]
      );
    }
    const { rows } = await pool.query(
      "SELECT id, user_email as \"userEmail\", name, category, amount::float, type, TO_CHAR(date, 'YYYY-MM-DD') as date, notes, COALESCE(is_recurring, false) as \"isRecurring\" FROM transactions WHERE user_email = $1 ORDER BY date DESC, id DESC",
      [userEmail]
    );
    res.json(rows);
  } catch (err) {
    console.error("POST /api/transactions/reset error:", err);
    res.status(500).json({ error: "Failed to reset transactions: " + err.message });
  }
});

// GET user preferences (budget, currency, theme, categoryBudgets)
app.get("/api/preferences", async (req, res) => {
  const userEmail = (req.query.userEmail || "nitish@gmail.com").toLowerCase().trim();
  try {
    const { rows } = await pool.query(
      "SELECT monthly_budget::float as \"monthlyBudget\", currency, theme, COALESCE(category_budgets, '{}'::jsonb) as \"categoryBudgets\" FROM user_preferences WHERE user_email = $1",
      [userEmail]
    );
    if (rows.length === 0) {
      return res.json({ monthlyBudget: 50000, currency: "INR", theme: "dark", categoryBudgets: {} });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/preferences error:", err);
    res.status(500).json({ error: "Failed to get preferences: " + err.message });
  }
});

// POST / PUT user preferences
app.post("/api/preferences", async (req, res) => {
  const { userEmail, monthlyBudget, currency, theme, categoryBudgets } = req.body;
  if (!userEmail) {
    return res.status(400).json({ error: "userEmail is required" });
  }
  const safeEmail = userEmail.toLowerCase().trim();

  try {
    const { rows } = await pool.query(
      `INSERT INTO user_preferences (user_email, monthly_budget, currency, theme, category_budgets, updated_at)
       VALUES ($1, COALESCE($2, 50000), COALESCE($3, 'INR'), COALESCE($4, 'dark'), COALESCE($5, '{}'::jsonb), NOW())
       ON CONFLICT (user_email)
       DO UPDATE SET
         monthly_budget = COALESCE($2, user_preferences.monthly_budget),
         currency = COALESCE($3, user_preferences.currency),
         theme = COALESCE($4, user_preferences.theme),
         category_budgets = COALESCE($5, user_preferences.category_budgets),
         updated_at = NOW()
       RETURNING monthly_budget::float as "monthlyBudget", currency, theme, COALESCE(category_budgets, '{}'::jsonb) as "categoryBudgets"`,
      [safeEmail, monthlyBudget, currency, theme, categoryBudgets ? JSON.stringify(categoryBudgets) : null]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("POST /api/preferences error:", err);
    res.status(500).json({ error: "Failed to save preferences: " + err.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`✓ Ledger Pro API Server listening on port ${PORT}`);
  await initDb();
});

export default app;
