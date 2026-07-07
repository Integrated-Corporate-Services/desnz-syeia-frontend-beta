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
import { fetchCsrfToken, getCsrfToken } from "./utils/csrf";

const logger = createLogger('axios-interceptor');
const csrfLogger = createLogger('csrf');

// Configure axios to send cookies with requests (required for session auth)
// Use empty string for relative paths (same-origin requests)
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.API_URL || "";

// Fetch CSRF token on app startup
fetchCsrfToken().then(token => {
  csrfLogger.debug('Initial CSRF token fetched on app startup');
});

// Add axios request interceptor to inject CSRF token
axios.interceptors.request.use(
  async (config) => {
    // Get cached token
    let csrfToken = getCsrfToken();
    
    // If no token cached, fetch it now
    if (!csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      csrfLogger.debug('No cached token, fetching new one');
      csrfToken = await fetchCsrfToken();
    }
    
    // Add CSRF token to headers for state-changing requests
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
      logger.debug('CSRF token added to request', { 
        method: config.method, 
        url: config.url,
        hasToken: !!csrfToken 
      });
    }
    
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', { error });
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Handle 403 CSRF errors - fetch new token and retry
      if (status === 403 && error.response.data?.message?.includes('csrf')) {
        csrfLogger.debug('Token invalid, fetching new token and retrying');
        await fetchCsrfToken();
        return axios.request(error.config);
      }
      
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
            
      // Handle 429 Too Many Requests (rate limiting)
      if (status === 429) {
        const message = error.response?.data?.message || 'Too many requests. Please try again later.';
        logger.warn('Rate limit exceeded', { message, url: error.config?.url });
        // Let individual components handle the error message
        // but ensure consistent error structure
        error.rateLimitExceeded = true;
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

const consentLogger = createLogger('consent');

const handleConsentChange: ConsentChangeCallback = (prefs, source) => {
  consentLogger.info('Consent changed', { source, preferencesCount: Object.keys(prefs).length });
};

createRoot(document.getElementById("root")!).render(
  <CookieConsentProvider onConsentChange={handleConsentChange}>
    <App />
  </CookieConsentProvider>
);