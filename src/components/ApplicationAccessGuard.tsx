import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuthUserContext } from '../context/AuthUserContext';
import { ROLES } from '../constants/roles';
import { applicationApiService } from '../services/applicationApiService';
import { isAccessDeniedError } from '../utils/errorMapper';
import NotFoundContent from '../features/NotFound/NotFoundContent';

interface ApplicationAccessGuardProps {
  children: React.ReactNode;
}

const ApplicationAccessGuard: React.FC<ApplicationAccessGuardProps> = ({ children }) => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { pathname } = useLocation();
  const { user } = useAuthUserContext();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let cancelled = false;

    if (!applicationId) {
      setStatus('allowed');
      return;
    }

    setStatus('checking');
    applicationApiService
      .getApplicationById(applicationId)
      .then(() => {
        if (!cancelled) setStatus('allowed');
      })
      .catch((err: any) => {
        if (cancelled) return;
        setStatus(isAccessDeniedError(err) ? 'denied' : 'allowed');
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  if (status === 'checking') {
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

  if (status === 'denied') {
    return <NotFoundContent />;
  }

  if (user?.role === ROLES.SUPERUSER && applicationId && /^\/(s-37|nwl)\//i.test(pathname)) {
    const basePath = pathname.split('/').slice(0, 3).join('/');
    const page = pathname.slice(basePath.length).replace(/\/+$/, '').toLowerCase();
    const allowedPages = ['/task-list', '/application-summary', '/reassign', '/reassignment-history', '/further-information-requests'];
    if (!allowedPages.includes(page)) {
      return <Navigate to={`${basePath}/application-summary`} replace />;
    }
  }

  return <>{children}</>;
};

export default ApplicationAccessGuard;
