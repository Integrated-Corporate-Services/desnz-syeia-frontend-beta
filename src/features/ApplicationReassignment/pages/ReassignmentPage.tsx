import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { applicationApiService } from '../../../services/applicationApiService';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { useBreadcrumb } from '../../../context/BreadcrumbContext';
import { getUserRole } from '../../../utils/roleUtils';
import PageTitle from '../../../components/PageTitle';
import { hasReassignmentRole, isReassignmentTerminal } from '../constants/reassignment';
import { getAssignmentBasePath } from '../utils/reassignment';
import { ApplicationReassignment } from '../components/ReassignmentForm';
import { ReassignmentError } from '../components/ReassignmentError';

export function ReassignmentPage() {
    const { applicationId } = useParams<{ applicationId: string }>();
    const { user } = useAuthUserContext();
    const { pathname } = useLocation();
    const base = getAssignmentBasePath(pathname);
    const [state, setState] = useState<{
        applicationId?: string;
        status: string | null;
        loading: boolean;
        error: string | null;
    }>({ status: null, loading: true, error: null });
    useEffect(() => {
        let active = true;
        if (!applicationId) {
            setState({ status: null, loading: false, error: 'Application reference is required' });
            return;
        }
        setState({ applicationId, status: null, loading: true, error: null });
        applicationApiService
            .getApplicationById(applicationId)
            .then((application) => {
                if (active)
                    setState({
                        applicationId,
                        status: application.status || null,
                        loading: false,
                        error: null,
                    });
            })
            .catch(() => {
                if (active)
                    setState({
                        applicationId,
                        status: null,
                        loading: false,
                        error: 'Unable to load application. Try again later.',
                    });
            });
        return () => {
            active = false;
        };
    }, [applicationId]);
    const current = state.applicationId === applicationId;
    const allowed =
        hasReassignmentRole(getUserRole(user)) &&
        Boolean(state.status) &&
        !isReassignmentTerminal(state.status);
    const [backToChoose, setBackToChoose] = useState<(() => void) | null>(null);
    const handleConfirmingChange = useCallback(
        (back: (() => void) | null) => setBackToChoose(() => back),
        [],
    );
    useBreadcrumb(
        backToChoose ? (
            <a
                href={`${base}/reassign`}
                className="govuk-back-link"
                onClick={(event) => {
                    event.preventDefault();
                    backToChoose();
                }}
            >
                Back
            </a>
        ) : (
            <Link className="govuk-back-link" to={`${base}/application-summary`}>
                Back
            </Link>
        ),
    );
    return (
        <div className="govuk-width-container">
            <PageTitle title="Reassign application" />
            <div className="govuk-main-wrapper">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-three-quarters">
                        <ReassignmentError message={current ? state.error : null} />
                        {(!current || state.loading) && (
                            <p className="govuk-body" role="status">
                                Loading application...
                            </p>
                        )}
                        {current &&
                            !state.loading &&
                            !state.error &&
                            (!allowed ? (
                                <p className="govuk-body">This application cannot be reassigned.</p>
                            ) : (
                                applicationId && (
                                    <ApplicationReassignment
                                        applicationId={applicationId}
                                        status={state.status}
                                        onConfirmingChange={handleConfirmingChange}
                                    />
                                )
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
