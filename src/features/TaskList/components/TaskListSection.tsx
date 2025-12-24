import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RouteEntry from '../../RouteMap/page/RouteEntry';
import { S37_BASE_URL } from '../../../constants/s37';

interface TaskListSectionProps {
  section: {
    title: string;
    items: { name: string; status: string; link: string }[];
  };
  idx: number;
  applicationId?: string;
  submitting: boolean;
  handleSubmit: () => void;
  statusClass: (status: string) => string;
}

const TaskListSection: React.FC<TaskListSectionProps> = ({
  section,
  idx,
  applicationId,
  submitting,
  handleSubmit,
  statusClass,
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 className="govuk-heading-m" style={{ marginBottom: '15px' }}>{idx + 1}. {section.title}</h2>
      <hr className="govuk-section-break govuk-section-break--visible" style={{ marginBottom: '0' }} />
      <table className="govuk-table">
        <tbody className="govuk-table__body">
          {section.items.map((item, itemIdx) => (
            <tr className="govuk-table__row" key={item.name}>
              <td className="govuk-table__cell">
                {item.name === 'Submit application' ? (
                  <div className="govuk-button-group">
                    <button
                      className="govuk-button govuk-button--warning"
                      type="button"
                      onClick={() => navigate(`${S37_BASE_URL}/${applicationId}/delete`)}
                      disabled={submitting}
                      style={{ marginRight: '1rem' }}
                    >
                      Delete application
                    </button>
                    <button
                      className="govuk-button"
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit application'}
                    </button>
                  </div>
                ) : applicationId ? (
                  item.name === 'Route' ? (
                    <RouteEntry applicationId={applicationId}>
                      <Link 
                        className="govuk-link" 
                        to={item.link}
                        style={{ fontWeight: 700 }}
                      >
                        {item.name}
                      </Link>
                    </RouteEntry>
                  ) : (
                    <Link 
                      className="govuk-link" 
                      to={item.link}
                      style={{ fontWeight: 700 }}
                    >
                      {item.name}
                    </Link>
                  )
                ) : (
                  <span className="govuk-link govuk-link--disabled" style={{ fontWeight: 700 }}>{item.name}</span>
                )}
              </td>
              <td className="govuk-table__cell" style={{ textAlign: 'right' }}>
                <span className={statusClass(item.status)}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListSection;
