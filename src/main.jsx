/**
 * Browser entry point. Mounts the React app into #root and wraps it in the
 * providers every screen needs:
 *   - BrowserRouter: client-side routing (routes are defined in App.jsx)
 *   - AuthProvider:  exposes the signed-in user + profile via useAuth()
 * Also loads the global stylesheet (styles/index.css).
 *
 * Appears in the following files:
 *   - (entry point: loaded by index.html)
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./features/auth/AuthContext";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
