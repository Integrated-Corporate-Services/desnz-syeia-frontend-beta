import React, { useEffect } from 'react';
import { useApplicationStore } from '../../../store/useApplicationStore';
import { useNavigate } from 'react-router-dom';
import ApplicationTable from '../component/ApplicationTable';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import type { AuthUser } from '../../../types/auth';
import { ROUTES } from '../../../constants/routes';
import StartNewApplicationButton from '../../../components/StartNewApplicationButton';

const Workbasket = () => {
  // TODO: get from auth/session
  const { user } = useAuthUserContext();
  const created_by = (user as AuthUser)?.person_id || (user as AuthUser)?.user_id || '44444444-4444-4444-4444-444444444444';
  const applications = useApplicationStore((state) => state.applications);
  const loadApplications = useApplicationStore((state) => state.loadApplications);
  const navigate = useNavigate();

  // Check if user has admin role
  const isAdmin = user && ((user as AuthUser)?.role === 'SUPERUSER' || (user as AuthUser)?.role === 'DNO_TEAM_COORDINATOR');

  useEffect(() => {
    if (created_by && typeof created_by === 'string') {
      loadApplications(created_by);
    }
  }, [created_by, loadApplications]);

  const handleStart = () => {
    navigate(ROUTES.NETWORK_OPERATOR_DETAILS);
  };

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <h1 className="govuk-heading-l">Your applications</h1>
            </div>
            <div className="govuk-grid-column-one-half govuk-!-text-align-right">
                {/*{isAdmin && (*/}
                  <button
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button"
                    onClick={() => navigate('/admin/dashboard')}
                    style={{ marginRight: '10px' }}
                  >
                    Admin dashboard
                  </button>
                
                <StartNewApplicationButton />
            </div>
          </div>

          {applications.length > 0 ? (
              <ApplicationTable applications={applications} />
          ) : (
            <p>No applications found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workbasket;