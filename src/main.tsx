import { createRoot } from "react-dom/client";
import "govuk-frontend/dist/govuk/govuk-frontend.min.css"; // GDS base styles first
import "./index.css";
import "./styles/govuk.scss";
import "./App.css";
import App from "./App";
import React from "react";
import { registerAllApplicationTypes } from "./features/ApplicationSummary/registrations/registerApplicationTypes";

registerAllApplicationTypes();
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
  console.log('[Consent]', source, prefs);
};

createRoot(document.getElementById("root")!).render(
  <CookieConsentProvider onConsentChange={handleConsentChange}>
    <App />
  </CookieConsentProvider>
);