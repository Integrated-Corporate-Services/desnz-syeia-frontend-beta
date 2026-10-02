import { Link, useLocation, useParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { useAssignmentHistory } from '../hooks/useAssignmentHistory';
import { formatReassignmentDate, getAssignmentBasePath } from '../utils/reassignment';
import { ReassignmentError } from '../components/ReassignmentError';

export function ReassignmentHistoryPage() {
    const { applicationId } = useParams<{ applicationId: string }>();
    const { pathname } = useLocation();
    const base = getAssignmentBasePath(pathname);
    const { details, error, loading } = useAssignmentHistory(applicationId);
    return (
        <div className="govuk-width-container">
            <PageTitle title="Reassignment history" />
            <Link className="govuk-back-link" to={`${base}/application-summary`}>
                Back
            </Link>
            <div className="govuk-main-wrapper">
                <span className="govuk-caption-l">
                    {details?.application_reference || applicationId}
                </span>
                <h1 className="govuk-heading-l">Reassignment history</h1>
                <ReassignmentError message={error} />
                {loading && (
                    <p className="govuk-body" role="status">
                        Loading reassignment history...
                    </p>
                )}
                {details &&
                    (details.history.length ? (
                        <div className="govuk-summary-card">
                            <div className="govuk-summary-card__title-wrapper">
                                <h2 className="govuk-summary-card__title">Reassignments</h2>
                            </div>
                            <div className="govuk-summary-card__content">
                                <dl className="govuk-summary-list">
                                    {details.history.map((entry, index) => (
                                        <div
                                            className="govuk-summary-list__row"
                                            key={`${entry.assigned_at}-${index}`}
                                        >
                                            <dt className="govuk-summary-list__key">
                                                {formatReassignmentDate(entry.assigned_at)}
                                            </dt>
                                            <dd className="govuk-summary-list__value">
                                                Reassigned from{' '}
                                                {entry.previous_assignee_name || 'Unassigned'} to{' '}
                                                {entry.new_assignee_name} by{' '}
                                                {entry.assigned_by_name}.
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </div>
                    ) : (
                        <p className="govuk-body">No reassignments recorded.</p>
                    ))}
                <Link className="govuk-link" to={`${base}/application-summary`}>
                    Back to application summary
                </Link>
            </div>
        </div>
    );
}
