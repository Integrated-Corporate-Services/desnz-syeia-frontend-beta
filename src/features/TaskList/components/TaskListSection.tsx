import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RouteEntry from '../../RouteMap/page/RouteEntry';
import { S37_BASE_URL } from '../../../constants/s37';

interface TaskListSectionProps {
  section: {
    title: string;
    items: { 
      name: string; 
      status: string; 
      link: string; 
      disabled?: boolean;
      plainTextStatus?: boolean;  // Status renders as plain text, not a tag
    }[];
  };
  idx: number;
  applicationId?: string;
  applicationStatus?: string;
  isAdmin?: boolean;
  submitting: boolean;
  handleSubmit: () => void;
  statusClass: (status: string) => string;
}

const TaskListSection: React.FC<TaskListSectionProps> = ({
  section,
  idx,
  applicationId,
  applicationStatus,
  isAdmin = false,
  submitting,
  handleSubmit,
  statusClass,
}) => {
  const navigate = useNavigate();
  const isSubmitted = applicationStatus?.toLowerCase() === 'submitted';
  const canEdit = !isSubmitted || isAdmin;

  return (
    <div className="govuk-!-margin-top-8">
      <h2 className="govuk-heading-m govuk-!-margin-bottom-4">{idx + 1}. {section.title}</h2>
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
      <table className="govuk-table">
        <tbody className="govuk-table__body">
          {section.items.map((item) => (
            <tr className="govuk-table__row" key={item.name}>
              <td className="govuk-table__cell">
                {/* Check if item is disabled */}
                {item.disabled ? (
                  <span className="govuk-body govuk-!-font-weight-bold" style={{ color: '#626a6e' }}>
                    {item.name}
                  </span>
                ) : item.name === 'Submit application' ? (
                  <div className="govuk-button-group">
                    {/*
                    <button
                      className="govuk-button govuk-button--warning govuk-!-margin-right-3"
                      type="button"
                      onClick={() => navigate(`${S37_BASE_URL}/${applicationId}/delete`)}
                      disabled={submitting || !canEdit}
                    >
                      Delete application
                    </button>
                    */}
                    <button
                      className="govuk-button"
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting || !canEdit}
                    >
                      {submitting ? 'Submitting...' : 'Submit application'}
                    </button>
                  </div>
                ) : applicationId ? (
                  item.name === 'Route' ? (
                    <RouteEntry applicationId={applicationId}>
                      <Link 
                        className="govuk-link govuk-!-font-weight-bold" 
                        to={item.link}
                      >
                        {item.name}
                      </Link>
                    </RouteEntry>
                  ) : (
                    <Link 
                      className="govuk-link govuk-!-font-weight-bold" 
                      to={item.link}
                    >
                      {item.name}
                    </Link>
                  )
                ) : (
                  <span className="govuk-link govuk-link--disabled govuk-!-font-weight-bold">{item.name}</span>
                )}
              </td>
              <td className="govuk-table__cell govuk-!-text-align-right">
                {item.plainTextStatus ? (
                  <span>
                    {item.status}
                  </span>
                ) : (
                  <span className={statusClass(item.status)}>
                    {item.status}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskListSection;