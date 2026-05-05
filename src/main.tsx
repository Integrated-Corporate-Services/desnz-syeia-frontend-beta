import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "govuk-frontend/dist/govuk/govuk-frontend.min.css"; // GDS base styles first
import "./index.css";
import "./styles/govuk.scss";
import "./App.css";
import App from "./App";
import React from "react";
import axios from "axios";
import { CookieConsentProvider, type ConsentChangeCallback } from "./modules/cookie-consent";

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

const handleConsentChange: ConsentChangeCallback = (prefs, source) => {
  // Optional: log consent decision to your backend
  // Optional: fire a GA4 ConsentDecision event via track()
  console.log('[Consent]', source, prefs);
};

// IMPORTANT: StrictMode disabled to prevent double-mounting
// which can interfere with session timeout tracking and cause false activity resets.
// StrictMode causes components to mount->unmount->remount in dev, which can trigger
// focus events and other side effects that reset the idle timer.
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <CookieConsentProvider onConsentChange={handleConsentChange}>
      <App />
    </CookieConsentProvider>
  </BrowserRouter>
);