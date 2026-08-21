import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useManageUsers } from '../../../hooks/useManageUsers';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { ROLES } from '../../../constants/roles';
import PageTitle from '../../../components/PageTitle';

const ManageUserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users, loading } = useManageUsers();

  const user = users.find(u => u.id === userId);

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
              User not found
            </h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">The user you are trying to manage could not be found.</p>
            </div>
          </div>
          <Link to="/admin/user-management" className="govuk-link">
            Return to user management
          </Link>
              </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Manage user" />
            <div className="govuk-width-container">
              <Link to="/admin/user-management" className="govuk-back-link">
          Back
        </Link>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Manage user</h1>

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
                <dt className="govuk-summary-list__key">Phone number</dt>
                <dd className="govuk-summary-list__value">{user.phone || '-'}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Role</dt>
                <dd className="govuk-summary-list__value">{formatRole(user.role)}</dd>
                {/* <dd className="govuk-summary-list__actions">
                  <a className="govuk-link" href="#">
                    Change<span className="govuk-visually-hidden"> role</span>
                  </a>
                </dd> */}
              </div>
              {user.role === ROLES.APPLICANT_AGENT && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Agency name</dt>
                  <dd className="govuk-summary-list__value">{user.agencyName || user.organisation || '-'}</dd>
                </div>
              )}
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Status</dt>
                <dd className="govuk-summary-list__value">
                  <strong className="govuk-tag govuk-tag--green">
                    Active
                  </strong>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Last login</dt>
                <dd className="govuk-summary-list__value">
                  {formatLastLogin(user.lastLogin)}
                </dd>
              </div>
            </dl>

            <div className="govuk-!-margin-top-6">
              <p className="govuk-body">
                <Link 
                  to={`/admin/revoke-user/${userId}`}
                  className="govuk-link"
                >
                  Revoke access
                </Link>
              </p>
              <p className="govuk-body">
                <Link 
                  to="/admin/user-management"
                  className="govuk-link"
                >
                  Return to dashboard
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
