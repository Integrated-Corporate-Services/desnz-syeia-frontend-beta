import { createRoot } from "react-dom/client";
import "govuk-frontend/dist/govuk/govuk-frontend.min.css"; // GDS base styles first
import "./index.css";
import "./styles/govuk.scss";
import "./App.css";
import App from "./App";
import React from "react";
import axios from "axios";
import { CookieConsentProvider, type ConsentChangeCallback } from "./modules/cookie-consent";
import { createLogger } from "./utils/logger";

const logger = createLogger('axios-interceptor');

// Configure axios to send cookies with requests (required for session auth)
// Use empty string for relative paths (same-origin requests)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.API_URL || "";

// Add axios interceptor to handle session expiration globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Handle 401 Unauthorized (session expired)
      if (status === 401) {
        logger.warn('Session expired or unauthorized, redirecting to landing page');
        window.location.href = '/frontend/landingPage';
        return Promise.reject(error);
      }
      
      // Handle 403 Forbidden (insufficient permissions)
      if (status === 403) {
        logger.warn('Access forbidden, redirecting to landing page');
        window.location.href = '/frontend/landingPage';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

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