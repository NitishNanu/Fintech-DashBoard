# 💼 Ledger Pro — Fintech & Personal Wealth Intelligence Dashboard

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)

> A modern, responsive full-stack financial dashboard designed to track transactions, cashflow, category budgets, recurring subscriptions, and overall financial health in real time with PostgreSQL persistence and local fallback caching.

---

## 🌟 Key Features

- **📊 Comprehensive Financial Metrics**: Real-time calculation of Total Income, Total Expenses, Net Savings, Monthly Burn Rate, and Savings Rate.
- **🛡️ Financial Health Score**: Algorithmic 0–100 financial health rating evaluating savings ratio, budget adherence, and expense diversity with actionable recommendations.
- **🔄 Recurring Subscriptions Tracker**: Automatic detection and tracking of recurring services (Netflix, Gym, Utilities, etc.) with monthly cost forecasting.
- **🎯 Dynamic Budgeting & Category Limits**: Set global monthly budgets and granular category allocations with visual progress meters and overspending warnings.
- **📈 Interactive Analytics & Charts**: Visual breakdown of income vs. expenses, category distribution, and historical monthly cashflow trends.
- **🔍 Advanced Filtering & Search**: Instant real-time search, category filters, transaction type filtering (income/expense), and date range selections (All, This Month, Last 30 Days).
- **📥 CSV Batch Import**: Bulk upload statement files or CSV records with automatic parsing and schema validation.
- **📤 Export & Printable Statements**: One-click CSV export and browser-native formatted financial statement printing with official ledger styling.
- **🌍 Multi-Currency Support**: Switch seamlessly between INR (₹), USD ($), EUR (€), and GBP (£).
- **🌗 Dark / Light Mode**: Polished dual theme support with persistent user preferences.
- **⚡ Resilient Architecture**: Full PostgreSQL database persistence with automatic, seamless fallback to browser storage (`localStorage`) if the database server is offline.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client["React 18 Frontend (Vite @ port 5173)"]
    Proxy["Vite Dev Proxy (/api -> http://localhost:5000)"]
    Server["Express 5 REST API Server (port 5000)"]
    DB[("PostgreSQL Database (fintech_db)")]
    LocalStorage["Local Storage Cache (Offline Fallback)"]

    Client -->|API Requests| Proxy
    Proxy -->|Forward| Server
    Server -->|Queries via pg Pool| DB
    Client -.->|If Backend Unreachable| LocalStorage
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (Hooks, Context, Modular Components)
- **Build Tool**: Vite 5
- **Styling**: Vanilla Modern CSS (CSS Custom Properties, Glassmorphism, Responsive Grid & Flexbox)
- **State & Storage**: React State + LocalStorage sync

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database Client**: `pg` (Node-Postgres Connection Pool)
- **CORS & Config**: `cors`, `dotenv`

### Database
- **Engine**: PostgreSQL 14+ (Tested with PostgreSQL 17)
- **Tables**: `transactions`, `user_preferences` (Auto-initialized on startup)

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14 or higher ([Download PostgreSQL](https://www.postgresql.org/download/))

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/NitishNanu/Fintech-DashBoard.git
cd Fintech-DashBoard
```

### 2. Install Dependencies
Install all project dependencies:
```bash
npm install
```

### 3. Set Up the PostgreSQL Database

1. Open your PostgreSQL terminal (`psql`) or pgAdmin.
2. Create a new database named `fintech_db`:
   ```sql
   CREATE DATABASE fintech_db;
   ```
*(Note: You do not need to manually create tables; the backend server auto-creates the schema and tables upon first boot).*

### 4. Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux:
cp .env.example .env
```

Update `.env` with your PostgreSQL database credentials:
```env
PORT=5000
DATABASE_URL=postgresql://<YOUR_POSTGRES_USER>:<YOUR_POSTGRES_PASSWORD>@localhost:5432/fintech_db
```

*Example for local default user:*
```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/fintech_db
```

---

## 💻 Running the Application

### Option A: Run Both Backend & Frontend Concurrently (Recommended)
```bash
npm run dev:all
```
This runs both the Express API server (`backend/server.js`) and Vite development server simultaneously in one terminal window.

### Option B: Run in Separate Terminals

**Terminal 1 (Backend API Server):**
```bash
npm run server
```
*The server will start at `http://localhost:5000` and automatically verify/initialize tables in `fintech_db`.*

**Terminal 2 (Frontend Client):**
```bash
npm run dev
```
*The React application will start at `http://localhost:5173`.*

Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 📂 Project Structure

```text
fintech-dashboard/
├── .env                  # Environment variables (git-ignored)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore definitions
├── index.html            # Main HTML document
├── package.json          # Project metadata, scripts, and dependencies
├── vite.config.js        # Vite configuration & proxy rules
│
├── backend/              # Standalone Express API Server (deployable to Render)
│   ├── package.json      # Backend-specific package definition
│   ├── .env.example      # Backend environment template
│   ├── db.js             # PostgreSQL connection pool with Cloud SSL support
│   └── server.js         # REST API endpoints & route handlers
│
└── src/                  # Frontend React Application
    ├── main.jsx          # React DOM root entry point
    ├── App.jsx           # Top-level state & authentication wrapper
    ├── index.css         # Global styles and CSS design variables
    │
    ├── components/       # Reusable UI Components
    │   ├── AnalyticsCharts.jsx   # Cashflow trends & breakdown charts
    │   ├── BudgetTracker.jsx     # Monthly budget & category meters
    │   ├── ConfirmModal.jsx      # Deletion & reset confirmation modals
    │   ├── Dashboard.jsx         # Main dashboard layout controller
    │   ├── FilterToolbar.jsx     # Search, filter, and sorting controls
    │   ├── Header.jsx            # Top navigation, theme & currency toggles
    │   ├── HealthScoreCard.jsx   # Financial health score & diagnosis
    │   ├── ImportModal.jsx       # CSV statement import modal
    │   ├── Login.jsx             # User authentication / demo selector
    │   ├── MetricCards.jsx       # Income, expense, and burn rate stats
    │   ├── SubscriptionsCard.jsx # Recurring subscription costs card
    │   ├── Toast.jsx             # Feedback notifications
    │   ├── TransactionModal.jsx  # Add & edit transaction modal
    │   └── TransactionRow.jsx    # Individual transaction list item
    │
    ├── data/
    │   └── mockTransactions.js   # Fallback starter transaction data
    │
    └── utils/            # Helper Utilities & Business Logic
        ├── analytics.js          # Financial metrics calculations
        ├── api.js                # HTTP client with resilient fallback
        ├── exportCsv.js          # Client-side CSV export generator
        ├── financialHealth.js    # Health scoring algorithm
        ├── formatCurrency.js     # Currency symbol & number formatting
        ├── printStatement.js     # Printable statement generator
        ├── storage.js            # LocalStorage cache implementation
        └── subscriptions.js      # Recurring subscription detection logic
```

---

## 📡 API Endpoints Reference

The backend provides a RESTful API on `/api`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check API and PostgreSQL database connection status |
| `GET` | `/api/transactions?userEmail=...` | Fetch all transactions for the specified user |
| `POST` | `/api/transactions` | Create a new transaction |
| `POST` | `/api/transactions/batch` | Bulk insert transactions (used by CSV import) |
| `PUT` | `/api/transactions/:id` | Update an existing transaction |
| `DELETE` | `/api/transactions/:id` | Delete a transaction |
| `POST` | `/api/transactions/reset` | Reset a user's transactions back to starter defaults |
| `GET` | `/api/preferences?userEmail=...` | Retrieve user preferences (budget, currency, theme) |
| `POST` | `/api/preferences` | Save or update user preferences and category budgets |

---

## 🧪 Production Build

To bundle the application for production deployment:

```bash
npm run build
```

To test the generated production build locally:
```bash
npm run preview
```

---

## ❓ Troubleshooting

### 1. Database Connection Error (`ECONNREFUSED` or `password authentication failed`)
- Check that your PostgreSQL service is running:
  - On Windows: Open `services.msc` and verify that `postgresql-x64-XX` is **Running**.
  - On Linux/macOS: Run `sudo systemctl status postgresql` or `brew services list`.
- Verify credentials in `.env` match your PostgreSQL password and username.
- Verify that the database `fintech_db` exists (`psql -U postgres -c "CREATE DATABASE fintech_db;"`).

### 2. "Port 5000 or 5173 already in use"
- You can change `PORT=5000` to another port (e.g. `5001`) in your `.env` file, and update `vite.config.js` proxy target accordingly.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
