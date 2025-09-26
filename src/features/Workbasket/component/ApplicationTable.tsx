import React from 'react';
import { useNavigate } from 'react-router-dom';

type Application = {
  application_id: string;
  operator_ref: string;
  type: string;
  operator_name?: string;
  status: string;
  created_at: string;
};

type Props = {
  applications: Application[];
};

const ApplicationTable: React.FC<Props> = ({ applications }) => {
  const navigate = useNavigate();

  return (
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
                  {app.operator_name}
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
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default ApplicationTable;