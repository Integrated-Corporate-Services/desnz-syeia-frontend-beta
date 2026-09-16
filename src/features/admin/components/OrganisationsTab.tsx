import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { Organisation } from '../../../services/organisationService';

interface OrganisationsTabProps {
  organisations: Organisation[];
  loading: boolean;
  error: string;
}

export const OrganisationsTab: React.FC<OrganisationsTabProps> = ({
  organisations,
  loading,
  error
}) => {
  const formatAddress = (organisation: Organisation) => [
    organisation.address_line1,
    organisation.address_line2,
    organisation.town_city,
    organisation.county,
    organisation.postcode,
  ].filter((part): part is string => Boolean(part)).join(', ');

  return (
    <div className="govuk-tabs__panel" id="organisations">
      <h2 className="govuk-heading-m">Organisations</h2>
      <p className="govuk-body">{organisations.length} {organisations.length === 1 ? 'result' : 'results'}</p>

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

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">Organisation name</th>
              <th scope="col" className="govuk-table__header">Team coordinators</th>
              <th scope="col" className="govuk-table__header">Organisation address</th>
              <th scope="col" className="govuk-table__header">Action(s)</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {organisations.length === 0 ? (
              <tr className="govuk-table__row">
                <td className="govuk-table__cell" colSpan={4}>
                  <p className="govuk-body">No organisations found.</p>
                </td>
              </tr>
            ) : (
              organisations.map((org) => (
                <tr key={org.organisation_id} className="govuk-table__row">
                  <td className="govuk-table__cell"><strong>{org.organisation_name}</strong></td>
                  <td className="govuk-table__cell">
                    {org.team_coordinators?.length
                      ? org.team_coordinators.join(', ')
                      : 'N/A'}
                  </td>
                  <td className="govuk-table__cell">
                    {formatAddress(org) || 'N/A'}
                  </td>
                  <td className="govuk-table__cell">
                    <Link
                      className="govuk-link"
                      to={`/admin/organisation/${org.organisation_id}/settings`}
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
