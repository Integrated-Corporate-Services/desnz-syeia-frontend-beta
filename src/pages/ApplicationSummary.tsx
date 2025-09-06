import React, { useState, useEffect } from 'react';
import { getInitialSections } from '../utils/taskListUtils';
import { useLocation, Link } from 'react-router-dom';
import { useApplicationStore } from '../store/useApplicationStore';
import { apiService } from '../services/api-service';

const TaskList: React.FC = () => {
  const [sections] = useState(getInitialSections());
  const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
  const application = useApplicationStore(state => state.application);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const appId = params.get('id');
  const [progress, setProgress] = useState<
    { section_name: string; subsection_name: string; is_completed: boolean }[]
  >([]);

  useEffect(() => {
    if (application?.application_id) {
      apiService.fetchApplicationProgress(application.application_id)
        .then(setProgress)
        .catch(console.error);
    }
  }, [application?.application_id]);

  useEffect(() => {
    if (appId) {
      fetchAndSetApplication(appId);
    }
  }, [appId, fetchAndSetApplication]);

  const isSubsectionCompleted = (sectionTitle: string, itemName: string) =>
    progress.some(
      p =>
        p.section_name === sectionTitle &&
        p.subsection_name === itemName &&
        p.is_completed
    );

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {application ? (
            <>
              <span className="govuk-caption-l">{application.operator_ref || 'NPOWER LIMITED'}</span>
              <h1 className="govuk-heading-l">{application.project_name || 'Section 37 application'}</h1>
              <p className="govuk-hint">Complete the following sections in order to create and submit your application</p>

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
                  {section.items.map((item) => (
                    <tr className="govuk-table__row" key={item.name}>
                      <td className="govuk-table__cell">
                        {appId ? (
                          <Link className="govuk-link" to={`${item.link}?id=${appId}`}>{item.name}</Link>
                        ) : (
                          <span className="govuk-link govuk-link--disabled">{item.name}</span>
                        )}
                      </td>
                      <td className="govuk-table__cell" style={{ textAlign: 'right' }}>
                        <span className={isSubsectionCompleted(section.title, item.name)
                          ? 'govuk-tag govuk-tag--green'
                          : 'govuk-tag govuk-tag--blue'}>
                          {isSubsectionCompleted(section.title, item.name) ? 'Completed' : 'Incomplete'}
                        </span>
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