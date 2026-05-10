import React, { useEffect, useMemo } from "react";
import * as GOVUKFrontend from "govuk-frontend";
import { BrowserRouter, useLocation, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./features/NotFound/NotFound";
import { AuthUserProvider } from "./context/AuthUserContext";
import { ROUTE_CONFIG } from "./constants/routes";
import { SessionTimeoutProvider } from "./context/SessionTimeoutContext";
import SessionTimeout from "./components/SessionTimeout";
import { useAuthUserContext } from "./context/AuthUserContext";
import { AutoScrollToTop } from "./components/shared/AutoScrollToTop";
import LandingPage from "./features/SignIn/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { createLogger } from "./utils/logger";
import { CookieBanner } from "./modules/cookie-consent";
import { usePageTracking } from "./lib/analytics";

const logger = createLogger("App");

const AppContent = () => {
  const location = useLocation();
  const { user, loading, error } = useAuthUserContext();

  // Track page views for analytics
  usePageTracking();

  // Auto-redirect to create session when LOGIN_DISABLED is enabled
  useEffect(() => {
    const LOGIN_DISABLED = import.meta.env.VITE_LOGIN_DISABLED === "true";

    if (LOGIN_DISABLED && !loading && !user && error) {
      window.location.href = "/backend/auth/login";
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
          logger.error("GOV.UK Frontend initialization error:", error);
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

// Find the current route configuration to check if it uses layout
  const currentRoute = useMemo(() => {
    return ROUTE_CONFIG.find((route) => {
      if (route.path.includes(":")) {
        const base = route.path.split("/:")[0];
        return location.pathname.startsWith(base);
      }
      return location.pathname === route.path;
    });
  }, [location.pathname]);

  // Check if current route should use MainLayout (default to true)
  const useLayout = currentRoute?.layout !== false;

  return (
    <>
      <CookieBanner />
      <SessionTimeout />
      <AutoScrollToTop />
      {isNotFound ? (
        <NotFound />
      ) : useLayout ? (
          /* Routes with layout: true (or undefined) use MainLayout wrapper */
          <MainLayout>
            <Routes>
              {ROUTE_CONFIG.filter((r) => r.layout !== false).map((route) => {
                const { path, component: Component, auth } = route;
                // If root or /landingPage, always show LandingPage
                if (path === "/" || path === "/landingPage") {
                  return (
                    <Route key={path} path={path} element={<LandingPage />} />
                  );
                }
                const element = auth ? (
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                );
                return <Route key={path} path={path} element={element} />;
              })}
            </Routes>
          </MainLayout>
        ) : (
          /* Routes with layout: false render directly without MainLayout */
          <Routes>
            {ROUTE_CONFIG.filter((r) => r.layout === false).map((route) => {
              const { path, component: Component, auth } = route;
              // If root or /landingPage, always show LandingPage
              if (path === "/" || path === "/landingPage") {
                return (
                  <Route key={path} path={path} element={<LandingPage />} />
                );
              }
              const element = auth ? (
                <ProtectedRoute>
                  <Component />
                </ProtectedRoute>
              ) : (
                <Component />
              );
              return <Route key={path} path={path} element={element} />;
            })}
          </Routes>
        )}
    </>
  );
};

const App = () => (
  <BrowserRouter basename="/frontend">
    <AuthUserProvider>
      <SessionTimeoutProvider>
        <AppContent />
      </SessionTimeoutProvider>
    </AuthUserProvider>
  </BrowserRouter>
);

export default App;