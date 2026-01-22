import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useManageUsers } from '../../../hooks/useManageUsers';
import { useManageUsersNavigation } from '../../../hooks/useManageUsersNavigation';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';

const RevokeUserAccessPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, loading, confirmRevokeAccess } = useManageUsers();
  const { navigateToAccessRevoked, navigateToDashboard } = useManageUsersNavigation();
  const [processing, setProcessing] = useState(false);

  const user = users.find(u => u.id === userId);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateToDashboard();
  };

  const handleRevokeAccess = async () => {
    if (!userId) return;
    setProcessing(true);
    await confirmRevokeAccess(userId, navigateToAccessRevoked);
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <LoadingSkeleton type="default" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
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
    );
  }

  return (
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
            <h1 className="govuk-heading-l">
              Are you sure you want to revoke access for {user.fullName}?
            </h1>

            <p className="govuk-body">
              Review the applicant's details before deciding whether to revoke this user's access.
            </p>

            <div className="govuk-summary-card">
              <div className="govuk-summary-card__content">
                <dl className="govuk-summary-list">
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
                    <dt className="govuk-summary-list__key">Role</dt>
                    <dd className="govuk-summary-list__value">{user.role}</dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Status</dt>
                    <dd className="govuk-summary-list__value">
                      <strong className="govuk-tag govuk-tag--green">Active</strong>
                    </dd>
                  </div>
                  {user.lastLogin && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Last login</dt>
                      <dd className="govuk-summary-list__value">
                        {new Date(user.lastLogin).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                If you revoke access, {user.fullName} will no longer be able to use this service.
              </strong>
            </div>

            <div className="govuk-button-group">
              <button
                type="button"
                className="govuk-button govuk-button--warning"
                onClick={handleRevokeAccess}
                disabled={processing}
              >
                {processing ? 'Revoking access...' : 'Revoke access'}
              </button>
              <a
                href="#"
                className="govuk-link"
                onClick={handleBack}
              >
                Cancel
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RevokeUserAccessPage;
