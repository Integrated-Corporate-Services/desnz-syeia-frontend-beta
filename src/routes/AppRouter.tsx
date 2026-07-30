import React from 'react';
import LandingPage from '../features/SignIn/LandingPage';
import { Routes, Route } from 'react-router-dom';
import { ROUTE_CONFIG } from '../constants/routes';

const AppRouter: React.FC = () => {

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