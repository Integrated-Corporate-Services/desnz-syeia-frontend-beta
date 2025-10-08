import React, { useEffect, useState } from 'react';
import SignInPage from '../features/SignIn/SignInPage';
import AssetInformationForm from '../features/AssetInfo/pages/AssetInformationForm';
import ProjectOverview from '../features/ProjectOverview/pages/ProjectOverview';
<<<<<<< HEAD
import EIAFeesForm from '../features/EIAFees/pages/eiafeesform';
=======
import SupportingInfo from '../features/SupportingInfo/page/SupportingInfo';
>>>>>>> develop

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
        // If root or /signin, always show SignInPage
        if (path === '/' || path === '/signin') {
          return <Route key={path} path={path} element={<SignInPage />} />;
        }
<<<<<<< HEAD
      />
      <Route path="/" element={<Navigate to="/workbasket/" replace />} />
      <Route path="/task-list" element={<TaskList />} />
      <Route path="/network-operator-details" element={<NetworkOperatorDetails />} />
      <Route path="/network-operator-contact-details" element={<NetworkOperatorContactDetails />} />
  <Route path="/asset-information" element={<AssetInformationForm />} />
      <Route path="/application-submitted" element={<ApplicationSubmitted />} />
      <Route path="/project-overview" element={<ProjectOverview />} />
      <Route path="/eia-fees" element={<EIAFeesForm />} />
=======
        // Allow all other pages to work normally
        return <Route key={path} path={path} element={<Component />} />;
      })}
>>>>>>> develop
    </Routes>
  );
};

export default AppRouter;