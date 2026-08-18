import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { applicationApiService } from '../services/applicationApiService';
import { isAccessDeniedError } from '../utils/errorMapper';
import NotFound from '../features/NotFound/NotFound';

interface ApplicationAccessGuardProps {
  children: React.ReactNode;
}

const ApplicationAccessGuard: React.FC<ApplicationAccessGuardProps> = ({ children }) => {
  const { applicationId } = useParams<{ applicationId: string }>();
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

  if (status === 'denied') {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default ApplicationAccessGuard;
