import React, { useEffect } from "react";
import * as GOVUKFrontend from "govuk-frontend";
import { BrowserRouter, useLocation, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./features/NotFound/NotFound";
import { AuthUserProvider } from "./context/AuthUserContext";
import { ROUTE_CONFIG } from "./constants/routes";
import { SessionTimeoutProvider } from "./context/SessionTimeoutContext";
import SessionTimeout from "./components/SessionTimeout";
import { useAuthUserContext } from "./context/AuthUserContext";
import LandingPage from "./features/SignIn/LandingPage";

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
    <>
      <SessionTimeout />
      {isNotFound ? (
        <NotFound />
      ) : (
        <Routes>
          {ROUTE_CONFIG.map(({ path, component: Component, layout, auth }) => {
            let routeElement: React.ReactNode;
            let shouldUseLayout = layout !== false;

            // Handle public pages
            if (path === '/landingPage') {
              routeElement = <LandingPage />;
              shouldUseLayout = false; // Landing page is standalone
            } 
            // Handle root path - special logic for auth vs guest
            else if (path === '/') {
              if (user && user.user_id) {
                // Authenticated: show Workbasket with layout
                routeElement = <Component />;
              } else if (!loading) {
                // Not authenticated: show LandingPage without layout
                routeElement = <LandingPage />;
                shouldUseLayout = false;
              } else {
                // Still loading: show placeholder
                routeElement = <Component />;
              }
            }
            // Handle protected routes
            else if (auth && !user && !loading) {
              routeElement = <LandingPage />;
              shouldUseLayout = false;
            }
            // Handle all other routes
            else {
              routeElement = <Component />;
            }

            // Wrap with MainLayout if needed
            if (shouldUseLayout) {
              routeElement = <MainLayout>{routeElement}</MainLayout>;
            }

            return (
              <Route
                key={path}
                path={path}
                element={routeElement}
              />
            );
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
