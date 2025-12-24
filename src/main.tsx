import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/govuk.scss';
import './App.css';
import App from './App';
import React from 'react';
import "govuk-frontend/dist/govuk/govuk-frontend.min.css";

// TypeScript: declare GOVUKFrontend on window
declare global {
  interface Window {
    GOVUKFrontend?: {
      initAll: () => void;
    };
  }
}





createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>
);
