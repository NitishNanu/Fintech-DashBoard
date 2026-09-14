import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("nitish@gmail.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    onLogin(email);
  }

  function handleQuickDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword("password123");
    onLogin(demoEmail);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Brand header */}
        <div className="login-brand">
          <div className="brand-logo-large">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>Ledger Pro</h1>
          <p className="sub">Dynamic Financial Intelligence & Cashflow Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="login-email">Account Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error">⚠️ {error}</div>}

          <button type="submit" className="login-submit-btn">
            Sign In to Dashboard
          </button>
        </form>

        <div className="login-demo-helper">
          <span className="demo-label">Quick test accounts:</span>
          <div className="demo-buttons-row">
            <button
              type="button"
              onClick={() => handleQuickDemo("nitish@gmail.com")}
              className="demo-chip"
            >
              nitish@gmail.com
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("alex@fintech.io")}
              className="demo-chip"
            >
              alex@fintech.io
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
