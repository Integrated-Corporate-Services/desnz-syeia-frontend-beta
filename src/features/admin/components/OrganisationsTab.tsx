import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleExportCSV = () => {
    const csvData = organisations.map(org => ({
      'Organisation name': org.organisation_name,
      'Team coordinators': org.team_coordinators?.join('; ') || '',
      'Approved domains': org.approved_domains?.join('; ') || ''
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organisations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="govuk-tabs__panel" id="organisations">
      <h2 className="govuk-heading-m">Organisations</h2>
      
      <div className="govuk-grid-row govuk-!-margin-bottom-4">
        <div className="govuk-grid-column-one-half">
          <p className="govuk-body">{organisations.length} results</p>
        </div>
        <div className="govuk-grid-column-one-half" style={{ textAlign: 'right' }}>
          <button
            type="button"
            className="govuk-button"
            onClick={handleExportCSV}
          >
            Download all (CSV)
          </button>
        </div>
      </div>

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
              <th scope="col" className="govuk-table__header">Approved emails domains</th>
              <th scope="col" className="govuk-table__header">Action</th>
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
                    {org.team_coordinators && org.team_coordinators.length > 0 ? (
                      <ul className="govuk-list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {org.team_coordinators.map((coordinator, index) => (
                          <li key={index}>{coordinator}</li>
                        ))}
                      </ul>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="govuk-table__cell">
                    {org.approved_domains && org.approved_domains.length > 0
                      ? org.approved_domains.join(', ')
                      : 'N/A'}
                  </td>
                  <td className="govuk-table__cell">
                    <a
                      className="govuk-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/admin/organisation/${org.organisation_id}/settings`);
                      }}
                    >
                      Manage
                    </a>
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
