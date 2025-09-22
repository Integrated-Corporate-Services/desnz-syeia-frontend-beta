import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TaskList from '../features/TaskList/pages/TaskList';
import NetworkOperatorDetails from '../features/ApplicantInfo/pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from '../features/ApplicantInfo/pages/NetworkOperatorContactDetails';
import Workbasket from '../features/Workbasket/pages/Workbasket';
import ApplicationSubmitted from '../features/TaskList/pages/ApplicationSubmitted';
import SignInPage from '../features/SignIn/SignInPage';
import AssetInformationForm from '../features/AssetInfo/pages/AssetInformationForm';
import ProjectOverview from '../features/projectOverview/pages/ProjectOverview';



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
      <Route path="/signin" element={<SignInPage />} />
      <Route
        path="/workbasket/"
        element={
          isAuthenticated ? <Workbasket /> : <Navigate to="/signin" replace />
        }
      />
      <Route path="/" element={<Navigate to="/workbasket/" replace />} />
      <Route path="/task-list" element={<TaskList />} />
      <Route path="/network-operator-details" element={<NetworkOperatorDetails />} />
      <Route path="/network-operator-contact-details" element={<NetworkOperatorContactDetails />} />
  <Route path="/asset-information" element={<AssetInformationForm />} />
      <Route path="/application-submitted" element={<ApplicationSubmitted />} />
      <Route path="/project-overview" element={<ProjectOverview />} />
    </Routes>
  );
};

export default AppRouter;