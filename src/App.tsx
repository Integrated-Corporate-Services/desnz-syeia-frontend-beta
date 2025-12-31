import React, { useEffect } from "react";
import * as GOVUKFrontend from "govuk-frontend";
import { BrowserRouter, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AppRouter from "./routes/AppRouter";
import NotFound from "./features/NotFound/NotFound";
import { AuthUserProvider } from "./context/AuthUserContext";
import { ROUTE_CONFIG } from "./constants/routes";
import { SessionTimeoutProvider } from "./context/SessionTimeoutContext";
import SessionTimeout from "./components/SessionTimeout";
import { useAuthUserContext } from "./context/AuthUserContext";

const AppContent = () => {
  const location = useLocation();
  const { user, loading, error } = useAuthUserContext();

  // Auto-redirect to create session when LOGIN_DISABLED is enabled
  useEffect(() => {
    const LOGIN_DISABLED = import.meta.env.VITE_LOGIN_DISABLED === "true";

    if (LOGIN_DISABLED && !loading && !user && error) {
      window.location.href = '/backend/auth/login';
    }
  }, [user, loading, error]);

  // Enhance GOV.UK JS on every route change
  useEffect(() => {
    // Only initialize GOV.UK components once on mount to avoid double initialization errors
    // In React apps with client-side routing, we don't need to re-initialize on every route change
    // Components will maintain their state through React's lifecycle
    if (typeof GOVUKFrontend.initAll === "function") {
      try {
        GOVUKFrontend.initAll();
      } catch (error) {
        // Suppress double initialization errors - these are harmless in React
        if (
          !(
            error instanceof Error &&
            error.message.includes("already initialised")
          )
        ) {
          console.error("GOV.UK Frontend initialization error:", error);
        }
      }
    }
  }, []); // Empty dependency array - only run on mount

  // If the current route is 404, render NotFound outside MainLayout
  const validPaths = [...ROUTE_CONFIG.map((route) => route.path)];
  const isNotFound =
    location.pathname &&
    !validPaths.some((path) => {
      // Handle dynamic params (e.g., /route-overview/:applicationId)
      if (path.includes(":")) {
        const base = path.split("/:")[0];
        return location.pathname.startsWith(base);
      }
      return location.pathname === path;
    });

  return (
    <SessionTimeoutProvider>
      <AuthUserProvider>
        <SessionTimeout />
        {isNotFound ? (
          <NotFound />
        ) : (
          <MainLayout>
            <AppRouter />
          </MainLayout>
        )}
      </AuthUserProvider>
    </SessionTimeoutProvider>
  );
};

const App = () => (
  <BrowserRouter basename="/frontend">
    <AppContent />
  </BrowserRouter>
);

export default App;
