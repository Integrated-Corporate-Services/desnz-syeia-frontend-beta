import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import { Organisation } from '../../../services/organisationService';
import { ORGANISATIONS_TAB_CONSTANTS, ADMIN_COMMON_CONSTANTS } from '../constants/userManagementConstants';

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
    <div className="govuk-tabs__panel">
      <h2 className="govuk-heading-m">{ORGANISATIONS_TAB_CONSTANTS.HEADING}</h2>
      <p className="govuk-body">{organisations.length} {organisations.length === 1 ? ORGANISATIONS_TAB_CONSTANTS.RESULT_SINGULAR : ORGANISATIONS_TAB_CONSTANTS.RESULT_PLURAL}</p>

      {error && (
        <div className="govuk-error-summary" aria-labelledby="organisations-error-summary-title" role="alert" tabIndex={-1}>
          <h2 className="govuk-error-summary__title" id="organisations-error-summary-title">
            {ADMIN_COMMON_CONSTANTS.ERROR_SUMMARY_TITLE}
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="table" />
      ) : (
        <table className="govuk-table organisations-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">{ORGANISATIONS_TAB_CONSTANTS.TABLE_HEADERS.ORGANISATION_NAME}</th>
              <th scope="col" className="govuk-table__header">{ORGANISATIONS_TAB_CONSTANTS.TABLE_HEADERS.TEAM_COORDINATORS}</th>
              <th scope="col" className="govuk-table__header">{ORGANISATIONS_TAB_CONSTANTS.TABLE_HEADERS.ORGANISATION_ADDRESS}</th>
              <th scope="col" className="govuk-table__header">{ORGANISATIONS_TAB_CONSTANTS.TABLE_HEADERS.ACTION}</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {organisations.length === 0 ? (
              <tr className="govuk-table__row">
                <td className="govuk-table__cell" colSpan={4}>
                  <p className="govuk-body">{ORGANISATIONS_TAB_CONSTANTS.NO_ORGANISATIONS}</p>
                </td>
              </tr>
            ) : (
              organisations.map((org) => (
                <tr key={org.organisation_id} className="govuk-table__row">
                  <td className="govuk-table__cell"><strong>{org.organisation_name}</strong></td>
                  <td className="govuk-table__cell">
                    {org.team_coordinators?.length
                      ? org.team_coordinators.join(', ')
                      : ADMIN_COMMON_CONSTANTS.NOT_APPLICABLE}
                  </td>
                  <td className="govuk-table__cell">
                    {formatAddress(org) || ADMIN_COMMON_CONSTANTS.NOT_APPLICABLE}
                  </td>
                  <td className="govuk-table__cell">
                    <Link
                      className="govuk-link"
                      to={`/admin/organisation/${org.organisation_id}/settings`}
                    >
                      {ORGANISATIONS_TAB_CONSTANTS.MANAGE}
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
