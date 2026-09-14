import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// This is the ONE place a real React app connects to the actual HTML page.
// It finds <div id="root"> (see index.html) and renders <App /> inside it.
// Everything else in this project is just JavaScript components from here on.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
