import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { fetchApplicationReviewSummary } from '../services';
import { useWithdrawalRequest } from '../hooks';
import { useDocumentDownload } from '../../NWL/CheckYourAnswers/hooks';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import {
    TaskListSummaryBreadcrumbs,
    ApplicationSummaryBreadcrumbs,
    ApplicationSummaryContent,
    ApplicationReassignment,
} from '../components';
import PageTitle from '../../../components/PageTitle';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { getUserRole } from '../../../utils/roleUtils';

export const ApplicationSummaryPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const location = useLocation();
    const isNWL = location.pathname.includes('/nwl/');
    const { withdrawalRequest } = useWithdrawalRequest(applicationId);
    const { user } = useAuthUserContext();
    const canReassign = ['SUPERUSER', 'APPLICANT_TEAM_COORDINATOR'].includes(getUserRole(user as any) || '');
    
    useDocumentDownload(applicationId);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ApplicationReviewSummaryData | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setError(CONSTANTS.ERROR);
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchApplicationReviewSummary(applicationId);
                if (isMounted) {
                    setData(result);
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : CONSTANTS.ERROR);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [applicationId]);

    if (loading) {
        return (
            <>
                                <div className="govuk-width-container">
                {isNWL ? (
                    <ApplicationSummaryBreadcrumbs
                        applicationType="NWL"
                        applicationId={applicationId!}
                    />
                ) : (
                    <TaskListSummaryBreadcrumbs applicationId={applicationId!} />
                )}
                                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                            </div>
            </>
        );
    }

    if (error || !data) {
        return (
            <>
                                <div className="govuk-width-container">
                {isNWL ? (
                    <ApplicationSummaryBreadcrumbs
                        applicationType="NWL"
                        applicationId={applicationId!}
                    />
                ) : (
                    <TaskListSummaryBreadcrumbs applicationId={applicationId!} />
                )}
                                    <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <p className="govuk-body">
                                {error || CONSTANTS.ERROR}
                            </p>
                        </div>
                    </div>
                            </div>
            </>
        );
    }

    return (
        <>
            <PageTitle title="Application summary" />
                        <div className="govuk-width-container">
            {isNWL ? (
                <ApplicationSummaryBreadcrumbs
                    applicationType="NWL"
                    applicationId={applicationId!}
                />
            ) : (
                <TaskListSummaryBreadcrumbs applicationId={applicationId!} />
            )}

                            <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <ApplicationSummaryContent
                            data={data}
                            applicationId={applicationId!}
                            withdrawalRequest={withdrawalRequest}
                        />
                        <ApplicationReassignment applicationId={applicationId!} status={data.status} canReassign={canReassign} />
                    </div>
                </div>
                    </div>
        </>
    );
};

export default ApplicationSummaryPage;
