import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/govuk.scss";
import "./App.css";
import App from "./App";
import React from "react";
import "govuk-frontend/dist/govuk/govuk-frontend.min.css";
import axios from "axios";

// Configure axios to send cookies with requests (required for session auth)
axios.defaults.withCredentials = true;
// Configure axios base URL for API calls
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

// TypeScript: declare GOVUKFrontend on window
declare global {
  interface Window {
    GOVUKFrontend?: {
      initAll: () => void;
    };
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
