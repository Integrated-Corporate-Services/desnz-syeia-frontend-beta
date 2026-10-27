import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useManageUsers } from '../../../hooks/useManageUsers';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { ROLES } from '../../../constants/roles';
import { formatUserRoleLabel } from '../../../utils/roleUtils';
import { isManageUserRoleChangeEnabled } from '../../../config/appConfig';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { MANAGE_USER_CONSTANTS, USER_DETAILS_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';

const ManageUserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const { users, loading } = useManageUsers();
  // Pages that link here (e.g. the team coordinators list) pass `from` so Back returns to them
  // The team coordinators list also passes its organisation, so Revoke access targets that membership
  const { from, organisationId } = (location.state as { from?: string; organisationId?: string } | null) ?? {};
  const actionState = from ? { from, organisationId } : undefined;
  const backPath = from ?? '/admin/user-management?tab=active-users';

  const user = users.find(u => u.id === userId);

  useBreadcrumb(
    <Link to={backPath} className="govuk-back-link">
      {ADMIN_COMMON_CONSTANTS.BACK}
    </Link>
  );

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

  if (loading) {
    return (
      <>
                <div className="govuk-width-container">
                      <LoadingSkeleton type="default" />
                  </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
                <div className="govuk-width-container">
                    <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert">
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              {ADMIN_COMMON_CONSTANTS.USER_NOT_FOUND_TITLE}
            </h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{MANAGE_USER_CONSTANTS.NOT_FOUND_MESSAGE}</p>
            </div>
          </div>
          <Link to="/admin/user-management?tab=active-users" className="govuk-link">
            {ADMIN_COMMON_CONSTANTS.RETURN_TO_USER_MANAGEMENT}
          </Link>
              </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title={MANAGE_USER_CONSTANTS.TITLE} />
            <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">{MANAGE_USER_CONSTANTS.TITLE}</h1>

            <dl className="govuk-summary-list">
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
                {isManageUserRoleChangeEnabled() && (user.role === ROLES.APPLICANT_USER || user.role === ROLES.APPLICANT_TEAM_COORDINATOR ||
                  users.some(candidate => candidate.id === userId && candidate.organisationMemberships?.some(
                    membership => membership.role === ROLES.APPLICANT_USER || membership.role === ROLES.APPLICANT_TEAM_COORDINATOR
                  ))) && (
                  <dd className="govuk-summary-list__actions">
                    <Link className="govuk-link" to={`/admin/manage-user/${userId}/change-role`} state={actionState}>
                      {MANAGE_USER_CONSTANTS.CHANGE}<span className="govuk-visually-hidden">{MANAGE_USER_CONSTANTS.CHANGE_ROLE_HIDDEN}</span>
                    </Link>
                  </dd>
                )}
              </div>
              {user.role === ROLES.APPLICANT_AGENT && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.AGENCY_NAME}</dt>
                  <dd className="govuk-summary-list__value">{user.agencyName || user.organisation || USER_DETAILS_CONSTANTS.NOT_PROVIDED}</dd>
                </div>
              )}
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.STATUS}</dt>
                <dd className="govuk-summary-list__value">
                  <strong className="govuk-tag govuk-tag--green">
                    {USER_DETAILS_CONSTANTS.STATUS_ACTIVE}
                  </strong>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">{USER_DETAILS_CONSTANTS.LAST_LOGIN}</dt>
                <dd className="govuk-summary-list__value">
                  {formatLastLogin(user.lastLogin)}
                </dd>
              </div>
            </dl>

            <div className="govuk-!-margin-top-6">
              <p className="govuk-body">
                <Link 
                  to={`/admin/revoke-user/${userId}`}
                  state={actionState}
                  className="govuk-link"
                >
                  {MANAGE_USER_CONSTANTS.REVOKE_ACCESS}
                </Link>
              </p>
              <p className="govuk-body">
                <Link 
                  to="/admin/user-management?tab=active-users"
                  className="govuk-link"
                >
                  {ADMIN_COMMON_CONSTANTS.RETURN_TO_DASHBOARD}
                </Link>
              </p>
            </div>
          </div>
        </div>
          </div>
    </>
  );
};

export default ManageUserPage;
