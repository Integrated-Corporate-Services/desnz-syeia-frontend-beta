import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTeamCoordinators, useOrganisation } from '../../../hooks';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';

const TeamCoordinatorsPage: React.FC = () => {
  const { organisationId } = useParams<{ organisationId: string }>();
  const navigate = useNavigate();
  
  const { organisation, loading: orgLoading } = useOrganisation(organisationId);
  const { coordinators, loading: coordLoading, error } = useTeamCoordinators(organisationId);
  
  const loading = orgLoading || coordLoading;

  const handleSave = () => {
    // Navigate back to settings page
    navigate(`/admin/organisation/${organisationId}/settings`);
  };

  if (loading) {
    return (
      <>
                <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <LoadingSkeleton type="table" />
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
                <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <Link to={`/admin/organisation/${organisationId}/settings`} className="govuk-back-link">
                Back
              </Link>
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      </>
    );
  }

  return (
    <>
            <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <Link to={`/admin/organisation/${organisationId}/settings`} className="govuk-back-link">
              Back
            </Link>

            <h1 className="govuk-heading-l govuk-!-margin-top-6">Team coordinators</h1>

            <h2 className="govuk-heading-m govuk-!-margin-top-6">Coordinators for {organisation?.organisation_name}</h2>

            <p className="govuk-body">
              Manage the people who coordinate access requests and user management for this organisation.
            </p>

            <h3 className="govuk-heading-m govuk-!-margin-top-6">
              Current coordinators ({coordinators.length})
            </h3>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Email address</th>
                  <th scope="col" className="govuk-table__header">Location</th>
                  <th scope="col" className="govuk-table__header">Actions</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {coordinators.length === 0 ? (
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell" colSpan={4}>
                      No team coordinators found
                    </td>
                  </tr>
                ) : (
                  coordinators.map((coordinator) => (
                    <tr key={coordinator.user_id} className="govuk-table__row">
                      <td className="govuk-table__cell">
                        {coordinator.first_name} {coordinator.last_name}
                      </td>
                      <td className="govuk-table__cell">{coordinator.email}</td>
                      <td className="govuk-table__cell">{coordinator.phone_number || 'Not specified'}</td>
                      <td className="govuk-table__cell">
                        <Link
                          to={`/admin/organisations/${organisationId}/team-coordinators/${coordinator.user_id}`}
                          className="govuk-link"
                        >
                          Edit
                        </Link>
                        {' '}
                        <a href="#" className="govuk-link">
                          Delete
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <button
              type="button"
              className="govuk-button govuk-!-margin-top-4"
              style={{ backgroundColor: '#00703c' }}
              onClick={handleSave}
            >
              Save and continue
            </button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default TeamCoordinatorsPage;
