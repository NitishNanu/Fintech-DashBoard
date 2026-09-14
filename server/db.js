import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:123456789@localhost:5432/fintech_db",
});

// Auto-initialize tables if needed
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        type VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        user_email VARCHAR(255) PRIMARY KEY,
        monthly_budget NUMERIC(12, 2) DEFAULT 50000,
        currency VARCHAR(10) DEFAULT 'INR',
        theme VARCHAR(10) DEFAULT 'dark',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_email);

      -- Ensure new columns exist for category budgets and recurring flags
      ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS category_budgets JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
    `);
    console.log("✓ Connected to PostgreSQL database (fintech_db) and verified schema.");
  } catch (err) {
    console.error("Error initializing PostgreSQL database tables:", err);
  } finally {
    client.release();
  }
}
