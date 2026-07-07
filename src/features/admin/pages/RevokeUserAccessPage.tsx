import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useManageUsers } from '../../../hooks/useManageUsers';
import { useManageUsersNavigation } from '../../../hooks/useManageUsersNavigation';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { ROLES } from '../../../constants/roles';
import SkipLink from '../../../components/SkipLink';

const RevokeUserAccessPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, loading, confirmRevokeAccess } = useManageUsers();
  const { navigateToAccessRevoked, navigateToDashboard } = useManageUsersNavigation();
  const [processing, setProcessing] = useState(false);

  const user = users.find(u => u.id === userId);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(`/admin/manage-user/${userId}`);
  };

  const handleRevokeAccess = async () => {
    if (!userId) return;
    setProcessing(true);
    await confirmRevokeAccess(userId, navigateToAccessRevoked);
    setProcessing(false);
  };

  if (loading) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <LoadingSkeleton type="default" />
          </main>
        </div>
      </>
    );
  }

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never';
    const date = new Date(lastLogin);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatRole = (role: string) => {
    if (role === ROLES.DESNZ_ADMIN) return 'DESNZ Admin';
    if (role === ROLES.APPLICANT_TEAM_COORDINATOR) return 'Team coordinator';
    if (role === ROLES.APPLICANT_AGENT) return 'Applicant agent';
    return 'Applicant';
  };

  if (!user) {
    return (
      <>
        <SkipLink />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
              <h2 className="govuk-error-summary__title" id="error-summary-title">
                User not found
              </h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body">The user you are trying to revoke access for could not be found.</p>
              </div>
            </div>
            <a
              href="#"
              className="govuk-link"
              onClick={handleBack}
            >
              Return to user management
            </a>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <a
          href="#"
          className="govuk-back-link"
          onClick={handleBack}
        >
          Back
        </a>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Revoke access</h1>

            <p className="govuk-body">
              This action cannot be undone. This user will no longer be able to coordinate access requests for this organisation and will no longer be able to submit applications on the organisation's behalf.
            </p>

            <dl className="govuk-summary-list govuk-!-margin-bottom-6">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Full name</dt>
                <dd className="govuk-summary-list__value">{user.fullName}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Organisation</dt>
                <dd className="govuk-summary-list__value">{user.organisation}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Email address</dt>
                <dd className="govuk-summary-list__value">{user.email}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Phone number</dt>
                <dd className="govuk-summary-list__value">{user.phone || '-'}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Role</dt>
                <dd className="govuk-summary-list__value">{formatRole(user.role)}</dd>
              </div>
              {user.role === ROLES.APPLICANT_AGENT && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Agency name</dt>
                  <dd className="govuk-summary-list__value">{user.agencyName || '-'}</dd>
                </div>
              )}
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Status</dt>
                <dd className="govuk-summary-list__value">
                  <strong className="govuk-tag govuk-tag--green">Active</strong>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Last login</dt>
                <dd className="govuk-summary-list__value">
                  {formatLastLogin(user.lastLogin)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              className="govuk-button"
              onClick={handleRevokeAccess}
              disabled={processing}
            >
              {processing ? 'Revoking access...' : 'Revoke access'}
            </button>

            <p className="govuk-body">
              <a
                href="#"
                className="govuk-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToDashboard();
                }}
              >
                Return to dashboard
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default RevokeUserAccessPage;
