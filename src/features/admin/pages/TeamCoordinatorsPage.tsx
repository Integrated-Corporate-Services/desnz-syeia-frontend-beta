import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTeamCoordinators, useOrganisation } from '../../../hooks';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import PageTitle from '../../../components/PageTitle';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';

const TeamCoordinatorsPage: React.FC = () => {
  const { organisationId } = useParams<{ organisationId: string }>();

  const { organisation, loading: orgLoading } = useOrganisation(organisationId);
  const { coordinators, loading: coordLoading, error } = useTeamCoordinators(organisationId);

  const loading = orgLoading || coordLoading;
  const settingsPath = `/admin/organisation/${organisationId}/settings`;

  useBreadcrumb(
    <Link to={settingsPath} className="govuk-back-link">
      Back
    </Link>
  );

  const sortedCoordinators = useMemo(
    () =>
      coordinators
        .map((coordinator) => ({
          ...coordinator,
          fullName: `${coordinator.first_name} ${coordinator.last_name}`.trim(),
        }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'en-GB', { sensitivity: 'base' })),
    [coordinators]
  );

  if (loading) {
    return (
      <>
        <div className="govuk-width-container">
          <LoadingSkeleton type="table" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
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
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Manage team coordinators" />
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {organisation?.organisation_name && (
              <span className="govuk-caption-xl govuk-!-margin-top-6">{organisation.organisation_name}</span>
            )}
            <h1 className="govuk-heading-xl">Manage team coordinators ({sortedCoordinators.length})</h1>

            <p className="govuk-body">
              Manage the team coordinators who review access requests and manage users for this organisation.
            </p>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Full name</th>
                  <th scope="col" className="govuk-table__header">Email address</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Action</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {sortedCoordinators.length === 0 ? (
                  <tr className="govuk-table__row">
                    <td className="govuk-table__cell" colSpan={3}>
                      No team coordinators found
                    </td>
                  </tr>
                ) : (
                  sortedCoordinators.map((coordinator) => (
                    <tr key={coordinator.user_id} className="govuk-table__row">
                      <td className="govuk-table__cell">{coordinator.fullName}</td>
                      <td className="govuk-table__cell">{coordinator.email}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">
                        <Link
                          className="govuk-link"
                          to={`/admin/manage-user/${coordinator.user_id}`}
                          state={{ from: `/admin/organisations/${organisationId}/team-coordinators` }}
                        >
                          Manage<span className="govuk-visually-hidden"> {coordinator.fullName}</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamCoordinatorsPage;