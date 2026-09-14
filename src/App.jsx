import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { getCurrencyPreference, saveCurrencyPreference } from "./utils/storage.js";

const USER_STORAGE_KEY = "fintech-dashboard-user";
const THEME_STORAGE_KEY = "fintech-dashboard-theme";
const DEFAULT_USER = "nitish@gmail.com";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    return localStorage.getItem(USER_STORAGE_KEY) || DEFAULT_USER;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
  });

  const [currentCurrency, setCurrentCurrency] = useState(() => {
    return getCurrencyPreference(loggedInUser || DEFAULT_USER);
  });

  // Sync user to storage and update their currency preference
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem(USER_STORAGE_KEY, loggedInUser);
      setCurrentCurrency(getCurrencyPreference(loggedInUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [loggedInUser]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function handleLogin(email) {
    setLoggedInUser(email);
  }

  function handleLogout() {
    setLoggedInUser(null);
  }

  function handleCurrencyChange(newCurrency) {
    setCurrentCurrency(newCurrency);
    if (loggedInUser) {
      saveCurrencyPreference(loggedInUser, newCurrency);
    }
  }

  function handleToggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return loggedInUser ? (
    <Dashboard
      userEmail={loggedInUser}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      currentCurrency={currentCurrency}
      onCurrencyChange={handleCurrencyChange}
    />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;
