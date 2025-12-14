import React, { useEffect, useState } from 'react';
import AssetInformationForm from '../features/AssetInfo/pages/AssetInformationForm';
import ProjectOverview from '../features/ProjectOverview/pages/ProjectOverview';
import LandingPage from '../features/SignIn/LandingPage';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE_CONFIG } from '../constants/routes';

// Real authentication check using backend /api/user endpoint
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);
  return isAuthenticated;
};


const AppRouter: React.FC = () => {
  //const isAuthenticated = useAuth();
  const isAuthenticated = false; // DNS always leads to signin

  return (
    <Routes>
      {ROUTE_CONFIG.map(({ path, component: Component, auth }) => {
        // If root or /landingPage, always show LandingPage
        if (path === '/' || path === '/landingPage') {
          return <Route key={path} path={path} element={<LandingPage />} />;
        }
        // Allow all other pages to work normally
        return <Route key={path} path={path} element={<Component />} />;
      })}
    </Routes>
  );
};

export default AppRouter;