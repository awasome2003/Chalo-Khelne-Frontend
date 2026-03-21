import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { AuthProvider } from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";

// Set axios base URL for production (when no Vite proxy is available)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
if (apiBaseUrl.startsWith("http")) {
  // Production: strip /api suffix since axios calls already include /api
  axios.defaults.baseURL = apiBaseUrl.replace(/\/api$/, "");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <App />
          <ToastContainer />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
