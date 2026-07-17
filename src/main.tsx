import { createRoot } from "react-dom/client";
import "govuk-frontend/dist/govuk/govuk-frontend.min.css";
import "./index.css";
import "./styles/govuk.scss";
import "./App.css";
import App from "./App";
import React from "react";
import axios from "axios";
import { CookieConsentProvider, type ConsentChangeCallback } from "./modules/cookie-consent";
import { createLogger } from "./utils/logger";
import { buildBackendUrl } from "./utils/apiConfig";
import { fetchCsrfToken, getCsrfToken } from "./utils/csrf";
import { getApiBaseUrl } from "./utils/apiConfig";

const logger = createLogger('axios-interceptor');
const csrfLogger = createLogger('csrf');

axios.defaults.withCredentials = true;
axios.defaults.baseURL = getApiBaseUrl();

fetchCsrfToken().then(token => {
  csrfLogger.debug('Initial CSRF token fetched on app startup');
});

axios.interceptors.request.use(
  async (config) => {
    let csrfToken = getCsrfToken();
    
    if (!csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      csrfLogger.debug('No cached token, fetching new one');
      csrfToken = await fetchCsrfToken();
    }
    
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

axios.interceptors.request.use((config) => {
  if (typeof config.url === 'string' && config.url.startsWith('/backend')) {
    config.url = buildBackendUrl(config.url);
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 403 && error.response.data?.message?.includes('csrf')) {
        csrfLogger.debug('Token invalid, fetching new token and retrying');
        await fetchCsrfToken();
        return axios.request(error.config);
      }
      
      if (status === 401) {
        logger.warn('Session expired or unauthorized, redirecting to landing page');
        window.location.href = '/landingPage';
        return Promise.reject(error);
      }
      
      if (status === 403) {
        logger.warn('Access forbidden, redirecting to landing page');
        window.location.href = '/landingPage';
        return Promise.reject(error);
      }
            
      if (status === 429) {
        const message = error.response?.data?.message || 'Too many requests. Please try again later.';
        logger.warn('Rate limit exceeded', { message, url: error.config?.url });
        error.rateLimitExceeded = true;
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

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

// Support old /frontend/* URLs while migrating to root-based frontend routing.
const legacyFrontendPrefix = '/frontend';
if (
  window.location.pathname === legacyFrontendPrefix ||
  window.location.pathname.startsWith(`${legacyFrontendPrefix}/`)
) {
  const strippedPath = window.location.pathname.slice(legacyFrontendPrefix.length) || '/';
  window.history.replaceState(
    window.history.state,
    '',
    `${strippedPath}${window.location.search}${window.location.hash}`
  );
}

createRoot(document.getElementById("root")!).render(
  <CookieConsentProvider onConsentChange={handleConsentChange}>
    <App />
  </CookieConsentProvider>
);