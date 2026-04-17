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
// Use empty string for relative paths (same-origin requests)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "";

// TypeScript: declare GOVUKFrontend on window
declare global {
  interface Window {
    GOVUKFrontend?: {
      initAll: () => void;
    };
  }
}

// IMPORTANT: StrictMode disabled to prevent double-mounting
// which can interfere with session timeout tracking and cause false activity resets.
// StrictMode causes components to mount->unmount->remount in dev, which can trigger
// focus events and other side effects that reset the idle timer.
createRoot(document.getElementById("root")!).render(
  <App />
);