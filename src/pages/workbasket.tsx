import React, { useEffect } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import { useNavigate } from 'react-router-dom';

const Workbasket = () => {
  const created_by = '44444444-4444-4444-4444-444444444444'; // get from auth/session
  const applications = useApplicationStore((state) => state.applications);
  const loadApplications = useApplicationStore((state) => state.loadApplications);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications(created_by);
  }, [created_by, loadApplications]);

  const handleStart = () => {
    navigate('/network-operator-details');
  };

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <h1 className="govuk-heading-l">Your applications</h1>
            </div>
            <div className="govuk-grid-column-one-half govuk-!-text-align-right">
              <a
                href="#"
                className="govuk-button"
                onClick={e => {
                  e.preventDefault();
                  handleStart();
                }}
              >
                Start new application
              </a>
            </div>
          </div>

          {applications.length > 0 ? (
            <table className="govuk-table" style={{ marginTop: 32 }}>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th className="govuk-table__header">Reference</th>
                  <th className="govuk-table__header">Type</th>
                  <th className="govuk-table__header">Operator Name</th>
                  <th className="govuk-table__header">Status</th>
                  <th className="govuk-table__header">Created At</th>
                  <th className="govuk-table__header">Action</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {applications
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(app => (
                    <tr className="govuk-table__row" key={app.application_id}>
                      <td className="govuk-table__cell">{app.operator_ref}</td>
                      <td className="govuk-table__cell">{app.type}</td>
                      <td className="govuk-table__cell">
                        <a
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            navigate(`/task-list?id=${app.application_id}`);
                          }}
                          className="govuk-link"
                        >
                          {app.project_name || 'Untitled Draft'}
                        </a>
                      </td>
                      <td className="govuk-table__cell">
                        <strong className={`govuk-tag${app.status === 'Submitted' ? ' govuk-tag--green' : ''}`}>
                          {app.status}
                        </strong>
                      </td>
                      <td className="govuk-table__cell">{new Date(app.created_at).toLocaleString()}</td>
                      <td className="govuk-table__cell">
                        <a
                          href="#"
                          className="govuk-link govuk-!-static-margin-right-2"
                          onClick={e => {
                            e.preventDefault();
                            navigate(`/task-list?id=${app.application_id}`);
                          }}
                        >
                          View
                        </a>
                        {/* Add Edit/Withdraw/Delete as needed */}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p>No applications found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workbasket;