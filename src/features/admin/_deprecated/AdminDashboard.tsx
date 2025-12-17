import React from 'react';
import { useDashboard, useDashboardNavigation } from '../../hooks';
import { useAuthUserContext } from '../../context/AuthUserContext';
import type { AuthUser } from '../../types/auth';

interface AccessRequest {
  access_request_id: string;
  first_name: string;
  last_name: string;
  organisation_name?: string;
  requested_at: string;
  is_agent: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuthUserContext();
  const userRole = (user as AuthUser)?.role || '';

  const {
    recentRequests,
    loading,
    error,
    getStatValue
  } = useDashboard(userRole);

  const {
    navigateToPendingRequests,
    navigateToWorkbasket,
    navigateToManageUsers
  } = useDashboardNavigation();

  if (loading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content">
          <p className="govuk-body">Loading dashboard...</p>
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
          onClick={(e) => {
            e.preventDefault();
            navigateToWorkbasket();
          }}
        >
          Back to workbasket
        </a>

        <h1 className="govuk-heading-l">Administrator Dashboard</h1>

        {error && (
          <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
            <h2 className="govuk-error-summary__title" id="error-summary-title">
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        <p className="govuk-body govuk-!-margin-bottom-6">
          Manage access requests and users for your organisation.
        </p>

        {/* Statistics Cards and Sidebar */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-summary-card govuk-!-margin-bottom-6">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">Pending access requests</h2>
              </div>
              <div className="govuk-summary-card__content">
                <p className="govuk-heading-xl govuk-!-margin-bottom-2">{getStatValue('pendingRequests')}</p>
                <a
                  className="govuk-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPendingRequests();
                  }}
                >
                  View all pending requests
                </a>
              </div>
            </div>

            <div className="govuk-summary-card govuk-!-margin-bottom-8">
              <div className="govuk-summary-card__title-wrapper">
                <h2 className="govuk-summary-card__title">Active users</h2>
              </div>
              <div className="govuk-summary-card__content">
                <p className="govuk-heading-xl govuk-!-margin-bottom-2">{getStatValue('activeUsers')}</p>
                <a
                  className="govuk-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToManageUsers();
                  }}
                >
                  Manage users
                </a>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-one-third">
            <aside className="app-related-items govuk-!-margin-top-2" role="complementary">
              <h2 className="govuk-heading-s">Related</h2>
              <ul className="govuk-list govuk-list--spaced">
                <li>
                  <a
                    className="govuk-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToPendingRequests();
                    }}
                  >
                    Manage pending requests
                  </a>
                </li>
                <li>
                  <a
                    className="govuk-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToManageUsers();
                    }}
                  >
                    Manage users
                  </a>
                </li>
                <li><a className="govuk-link" href="#">User guide for administrators</a></li>
                <li><a className="govuk-link" href="#">Contact support</a></li>
              </ul>
            </aside>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Recent Access Requests */}
        <h2 className="govuk-heading-m govuk-!-margin-bottom-4">Recent access requests</h2>

        {recentRequests.length === 0 ? (
          <div className="govuk-inset-text govuk-!-margin-bottom-6">
            <p className="govuk-body">No recent access requests to display.</p>
          </div>
        ) : (
          <>
            <table className="govuk-table govuk-!-margin-bottom-6">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Organisation</th>
                  <th scope="col" className="govuk-table__header">Requested on</th>
                  <th scope="col" className="govuk-table__header">Applicant type</th>
                  <th scope="col" className="govuk-table__header">Action</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {recentRequests.map((request: AccessRequest) => (
                  <tr key={request.access_request_id} className="govuk-table__row">
                    <td className="govuk-table__cell">{`${request.first_name} ${request.last_name}`}</td>
                    <td className="govuk-table__cell">{request.organisation_name || 'N/A'}</td>
                    <td className="govuk-table__cell">{new Date(request.requested_at).toLocaleDateString('en-GB')}</td>
                    <td className="govuk-table__cell">
                      <strong
                        className="govuk-tag"
                        style={{
                          backgroundColor: !request.is_agent ? '#1d70b8' : '#505a5f',
                          color: '#ffffff'
                        }}
                      >
                        {!request.is_agent ? 'EMPLOYEE' : 'AGENT'}
                      </strong>
                    </td>
                    <td className="govuk-table__cell">
                      <a
                        className="govuk-link"
                        href={`/admin/review-request/${request.access_request_id}`}
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <a
              className="govuk-link"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigateToPendingRequests();
              }}
            >
              View all pending requests
            </a>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
