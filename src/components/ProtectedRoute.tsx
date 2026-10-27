import React from 'react';
import { Navigate, useLocation, useMatch } from 'react-router-dom';
import { useAuthUserContext } from '../context/AuthUserContext';
import { ROLES } from '../constants/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authenticated, loading, user } = useAuthUserContext();
  const location = useLocation();
  const chooseApplication = useMatch('/choose-application');
  const s37Creation = useMatch('/s-37/who-is-applying');
  const nwlCreation = useMatch('/nwl/who-is-applying');
  const cpoCreation = useMatch('/cpo/who-is-applying');

  if (loading) {
    return (
      <div className="govuk-width-container">
        <div className="govuk-main-wrapper">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">Loading...</p>
            </div>
          </div>
        </div>
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

  if (user?.role === ROLES.SUPERUSER && (chooseApplication || s37Creation || nwlCreation || cpoCreation)) {
    return <Navigate to="/application-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
 