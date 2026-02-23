import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthUserContext } from '../context/AuthUserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authenticated, loading, user } = useAuthUserContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/landingPage" state={{ from: location }} replace />;
  }

  // Check if user status is INACTIVE - redirect to access revoked page
  if (user?.status === 'INACTIVE') {
    return <Navigate to="/access-revoked" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
 