import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useManageUsers } from '../../../hooks/useManageUsers';
import { useManageUsersNavigation } from '../../../hooks/useManageUsersNavigation';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { ROLES } from '../../../constants/roles';
import { formatUserRoleLabel } from '../../../utils/roleUtils';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { REVOKE_USER_ACCESS_CONSTANTS, USER_DETAILS_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';
import { findUserForOrganisation } from '../utils/findUserForOrganisation';

const RevokeUserAccessPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  // Keep the Manage user page's own Back destination (e.g. the team coordinators list), and the
  // organisation that list shows, so the revoke targets that membership rather than the signed-in user's
  const { from, organisationId } = (useLocation().state as { from?: string; organisationId?: string } | null) ?? {};
  const { users, loading, confirmRevokeAccess } = useManageUsers();
  const { navigateToAccessRevoked, navigateToDashboard } = useManageUsersNavigation();
  const [processing, setProcessing] = useState(false);

  const user = findUserForOrganisation(users, userId, organisationId);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(`/admin/manage-user/${userId}`, from ? { state: { from, organisationId } } : undefined);
  };

  useBreadcrumb(
    <a
      href="#"
      className="govuk-back-link"
      onClick={handleBack}
    >
      {ADMIN_COMMON_CONSTANTS.BACK}
    </a>
  );

  const handleRevokeAccess = async () => {
    if (!userId) return;
    setProcessing(true);
    await confirmRevokeAccess(userId, navigateToAccessRevoked, organisationId);
    setProcessing(false);
  };

  if (loading) {
    return (
      <>
                <div className="govuk-width-container">
                      <LoadingSkeleton type="default" />
                  </div>
      </>
    );
  }

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return USER_DETAILS_CONSTANTS.LAST_LOGIN_NEVER;
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

  const formatRole = formatUserRoleLabel;

  if (!user) {
    return (
      <>
                <div className="govuk-width-container">
                      <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
              <h2 className="govuk-error-summary__title" id="error-summary-title">
                {ADMIN_COMMON_CONSTANTS.USER_NOT_FOUND_TITLE}
              </h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body">{REVOKE_USER_ACCESS_CONSTANTS.NOT_FOUND_MESSAGE}</p>
              </div>
            </div>
            <a
              href="#"
              className="govuk-link"
              onClick={handleBack}
            >
              {ADMIN_COMMON_CONSTANTS.RETURN_TO_USER_MANAGEMENT}
            </a>
                  </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title={REVOKE_USER_ACCESS_CONSTANTS.TITLE} />
            <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{REVOKE_USER_ACCESS_CONSTANTS.TITLE}</h1>

            <p className="govuk-body">
              {REVOKE_USER_ACCESS_CONSTANTS.WARNING}
            </p>

            <dl className="govuk-summary-list govuk-!-margin-bottom-6">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.FULL_NAME}</dt>
                <dd className="govuk-summary-list__value">{user.fullName}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.ORGANISATION}</dt>
                <dd className="govuk-summary-list__value">{user.organisation}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.EMAIL_ADDRESS}</dt>
                <dd className="govuk-summary-list__value">{user.email}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.PHONE_NUMBER}</dt>
                <dd className="govuk-summary-list__value">{user.phone || USER_DETAILS_CONSTANTS.NOT_PROVIDED}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.ROLE}</dt>
                <dd className="govuk-summary-list__value">{formatRole(user.role)}</dd>
              </div>
              {user.role === ROLES.APPLICANT_AGENT && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.AGENCY_NAME}</dt>
                  <dd className="govuk-summary-list__value">{user.agencyName || USER_DETAILS_CONSTANTS.NOT_PROVIDED}</dd>
                </div>
              )}
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.STATUS}</dt>
                <dd className="govuk-summary-list__value">
                  <strong className="govuk-tag govuk-tag--green">{USER_DETAILS_CONSTANTS.STATUS_ACTIVE}</strong>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.LAST_LOGIN}</dt>
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
              {processing ? REVOKE_USER_ACCESS_CONSTANTS.REVOKING : REVOKE_USER_ACCESS_CONSTANTS.TITLE}
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
                {ADMIN_COMMON_CONSTANTS.RETURN_TO_DASHBOARD}
              </a>
            </p>
          </div>
        </div>
          </div>
    </>
  );
};

export default RevokeUserAccessPage;
