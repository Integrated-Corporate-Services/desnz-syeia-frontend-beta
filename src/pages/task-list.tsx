import React, { useState, useEffect } from 'react';
import { getInitialSections, updateSectionStatus } from '../utils/taskListUtils';
import { useLocation, Link } from 'react-router-dom';
import { useApplicationStore } from '../store/useApplicationStore';

const TaskList: React.FC = () => {
  const [sections, setSections] = useState(getInitialSections());
  const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
  const application = useApplicationStore(state => state.application);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const appId = params.get('id');

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  // Example: update status handler
  const handleStatusUpdate = (sectionIdx: number, itemIdx: number, newStatus: string) => {
    setSections(updateSectionStatus(sections, sectionIdx, itemIdx, newStatus));
  };

  const statusClass = (status: string) => {
    if (status === 'Completed') return 'govuk-tag govuk-tag--green';
    if (status === 'Incomplete') return 'govuk-tag govuk-tag--blue';
    if (status === 'Cannot start yet') return 'govuk-tag govuk-tag--grey';
    return '';
  };

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {application ? (
            <>
              <span className="govuk-caption-l">{application.operator_ref || 'NPOWER LIMITED'}</span>
              <h1 className="govuk-heading-l">{application.project_name || 'Section 37 application'}</h1>
              <p>Status: {application.status}</p>
            </>
          ) : (
            <p>Loading application...</p>
          )}
          <button className="govuk-button govuk-button--warning" type="button">
            Delete application
          </button>
          {sections.map((section, idx) => (
            <div key={section.title} style={{ marginTop: '2rem' }}>
              <h2 className="govuk-heading-m">{idx + 1}. {section.title}</h2>
              <table className="govuk-table">
                <tbody className="govuk-table__body">
                  {section.items.map((item, itemIdx) => (
                    <tr className="govuk-table__row" key={item.name}>
                      <td className="govuk-table__cell">
                        {appId ? (
                          <Link className="govuk-link" to={`${item.link}?id=${appId}`}>{item.name}</Link>
                        ) : (
                          <span className="govuk-link govuk-link--disabled">{item.name}</span>
                        )}
                      </td>
                      <td className="govuk-table__cell" style={{ textAlign: 'right' }}>
                        {item.status && (
                          <span className={statusClass(item.status)}>{item.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
