import React, { useEffect, useMemo } from "react";
import * as GOVUKFrontend from "govuk-frontend";
import { BrowserRouter, useLocation, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./features/NotFound/NotFound";
import { AuthUserProvider } from "./context/AuthUserContext";
import { AccessRequestProvider } from "./context/AccessRequestContext";
import { ROUTE_CONFIG } from "./constants/routes";
import { SessionTimeoutProvider } from "./context/SessionTimeoutContext";
import SessionTimeout from "./components/SessionTimeout";
import { useAuthUserContext } from "./context/AuthUserContext";
import { AutoScrollToTop } from "./components/shared/AutoScrollToTop";
import LandingPage from "./features/SignIn/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplicationAccessGuard from "./components/ApplicationAccessGuard";
import { createLogger } from "./utils/logger";
import { CookieBanner, CookieConsentProvider } from "./modules/cookie-consent";
import { usePageTracking } from "./lib/analytics";
import { getAuthLoginUrl } from "./utils/apiConfig";
import { parseEnvBoolean, getRuntimeEnv } from "./config/runtimeEnv";
import SingleActiveTabGuard from "./components/SingleActiveTabGuard";
import TabConflictPage from "./pages/TabConflictPage";

const logger = createLogger("App");

const AppContent = () => {
  const location = useLocation();
  const { user, loading, error } = useAuthUserContext();

  usePageTracking();

  useEffect(() => {
    if (!location.pathname.includes('/feedback')) {
      sessionStorage.setItem('lastPage', location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const LOGIN_DISABLED = parseEnvBoolean(getRuntimeEnv('VITE_LOGIN_DISABLED'));

    if (LOGIN_DISABLED && !loading && !user && error) {
      window.location.href = getAuthLoginUrl();
    }
  }, [user, loading, error]);

  useEffect(() => {
    if (typeof GOVUKFrontend.initAll === "function") {
      try {
        GOVUKFrontend.initAll();
      } catch (error) {
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
  }, []);

  const validPaths = [...ROUTE_CONFIG.map((route) => route.path)];
  validPaths.push('/tab-conflict');
  const isNotFound =
    location.pathname &&
    !validPaths.some((path) => {
      const normalizedLocation = location.pathname.replace(/\/$/, '') || '/';
      const normalizedPath = path.replace(/\/$/, '') || '/';
      
      if (normalizedPath.includes(":")) {
        const base = normalizedPath.split("/:")[0];
        return normalizedLocation.startsWith(base);
      }
      return normalizedLocation === normalizedPath;
    });

  const currentRoute = useMemo(() => {
    return ROUTE_CONFIG.find((route) => {
      const normalizedLocation = location.pathname.replace(/\/$/, '') || '/';
      const normalizedPath = route.path.replace(/\/$/, '') || '/';
      
      if (normalizedPath.includes(":")) {
        const base = normalizedPath.split("/:")[0];
        return normalizedLocation.startsWith(base);
      }
      return normalizedLocation === normalizedPath;
    });
  }, [location.pathname]);

  const useLayout = currentRoute?.layout !== false;

  return (
    <>
      <CookieBanner />
      <SessionTimeout />
      <SingleActiveTabGuard />
      <AutoScrollToTop />
      {isNotFound ? (
        <NotFound />
      ) : useLayout ? (
          <MainLayout>
            <Routes>
              <Route path="/tab-conflict" element={<TabConflictPage />} />
              {ROUTE_CONFIG.filter((r) => r.layout !== false).map((route) => {
                const { path, component: Component, auth } = route;
                if (path === "/" || path === "/landingPage") {
                  return (
                    <Route key={path} path={path} element={<LandingPage />} />
                  );
                }
                const isApplicationScoped = path.includes(":applicationId");
                let element = <Component />;
                if (isApplicationScoped) {
                  element = (
                    <ApplicationAccessGuard>
                      <Component />
                    </ApplicationAccessGuard>
                  );
                }
                if (auth) {
                  element = <ProtectedRoute>{element}</ProtectedRoute>;
                }
                return <Route key={path} path={path} element={element} />;
              })}
            </Routes>
          </MainLayout>
        ) : (
          <Routes>
            <Route path="/tab-conflict" element={<TabConflictPage />} />
            {ROUTE_CONFIG.filter((r) => r.layout === false).map((route) => {
              const { path, component: Component, auth } = route;
              if (path === "/" || path === "/landingPage") {
                return (
                  <Route key={path} path={path} element={<LandingPage />} />
                );
              }
              const isApplicationScoped = path.includes(":applicationId");
              let element = <Component />;
              if (isApplicationScoped) {
                element = (
                  <ApplicationAccessGuard>
                    <Component />
                  </ApplicationAccessGuard>
                );
              }
              if (auth) {
                element = <ProtectedRoute>{element}</ProtectedRoute>;
              }
              return <Route key={path} path={path} element={element} />;
            })}
          </Routes>
        )}
    </>
  );
};

const routerBasename = getRuntimeEnv('VITE_ROUTER_BASENAME', '/').replace(/\/$/, '');

const App = () => (
  <BrowserRouter basename={routerBasename || undefined}>
    <CookieConsentProvider>
      <AuthUserProvider>
        <AccessRequestProvider>
          <SessionTimeoutProvider>
            <AppContent />
          </SessionTimeoutProvider>
        </AccessRequestProvider>
      </AuthUserProvider>
    </CookieConsentProvider>
  </BrowserRouter>
);

export default App;