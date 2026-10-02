import { Link, useLocation } from 'react-router-dom';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { getUserRole } from '../../../utils/roleUtils';
import { useAssignmentHistory } from '../hooks/useAssignmentHistory';
import { useReassignmentEligibility } from '../hooks/useReassignmentEligibility';
import { getAssignmentBasePath } from '../utils/reassignment';

export function ApplicationReassignmentLinks({
    applicationId,
    status,
}: {
    applicationId: string;
    status: string | null;
}) {
    const { user } = useAuthUserContext();
    const { pathname } = useLocation();
    const { details } = useAssignmentHistory(applicationId);
    const canReassign = useReassignmentEligibility(applicationId, status, getUserRole(user));
    const lastActor = details?.history[0]?.assigned_by_name;
    const base = getAssignmentBasePath(pathname);
    return (
        <div className="govuk-!-margin-top-6">
            {canReassign && (
                <p>
                    <Link className="govuk-button govuk-button--secondary" to={`${base}/reassign`}>
                        Reassign application
                    </Link>
                </p>
            )}
            {lastActor && <p className="govuk-body">Last reassigned by {lastActor}</p>}
            <Link className="govuk-link" to={`${base}/reassignment-history`}>
                View reassignment history
            </Link>
        </div>
    );
}
