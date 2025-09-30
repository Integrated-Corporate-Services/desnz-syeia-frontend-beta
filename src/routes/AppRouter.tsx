import React, { useEffect, useState } from 'react';
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
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    // Optionally show a loading spinner while checking auth
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {ROUTE_CONFIG.map(({ path, component: Component, auth }) => (
        <Route key={path} path={path}
          element={
            auth ? isAuthenticated ? <Component /> : <Navigate to="/signin" replace />: <Component />
          }
        />
      ))}
    </Routes>
  );
};

export default AppRouter;