import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE_CONFIG } from '../constants/routes';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    setIsAuthenticated(true);
  }, []);
  return isAuthenticated;
};

const SandboxRouter: React.FC = () => {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {ROUTE_CONFIG.map(({ path, component: Component, auth }) => (
        <Route
          key={path}
          path={path}
          element={
            auth
              ? isAuthenticated
                ? <Component />
                : <Navigate to="/signin" replace />
              : <Component />
          }
        />
      ))}
    </Routes>
  );
};

export default SandboxRouter;
