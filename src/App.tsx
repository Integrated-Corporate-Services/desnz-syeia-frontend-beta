import React, { useEffect } from 'react';
import * as GOVUKFrontend from 'govuk-frontend';
import { BrowserRouter, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppRouter from './routes/AppRouter';
import NotFound from './features/NotFound/NotFound';
import { AuthUserProvider } from './context/AuthUserContext';
import { ROUTE_CONFIG } from './constants/routes';

const AppContent = () => {
  const location = useLocation();
  // Enhance GOV.UK JS on every route change
  useEffect(() => {
    if (typeof GOVUKFrontend.initAll === 'function') {
      GOVUKFrontend.initAll();
    }
  }, [location]);

  // If the current route is 404, render NotFound outside MainLayout
  const validPaths = [
    ...ROUTE_CONFIG.map(route => route.path),
  ];
  const isNotFound = location.pathname && !validPaths.some(path => {
    // Handle dynamic params (e.g., /route-overview/:applicationId)
    if (path.includes(':')) {
      const base = path.split('/:')[0];
      return location.pathname.startsWith(base);
    }
    return location.pathname === path;
  });

  return (
    <AuthUserProvider>
      {isNotFound ? (
        <NotFound />
      ) : (
        <MainLayout>
          <AppRouter />
        </MainLayout>
      )}
    </AuthUserProvider>
  );
};

const App = () => (
  <BrowserRouter basename="/frontend">
    <AppContent />
  </BrowserRouter>
);

export default App;