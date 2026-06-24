import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { fetchApplicationReviewSummary } from '../services';
import { useWithdrawalRequest } from '../hooks';
import { useDocumentDownload } from '../../NWL/CheckYourAnswers/hooks';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import {
    TaskListSummaryBreadcrumbs,
    ApplicationSummaryContent,
} from '../components';

export const ApplicationSummaryPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const { withdrawalRequest } = useWithdrawalRequest(applicationId);
    
    useDocumentDownload();

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
            <div className="govuk-width-container">
                <TaskListSummaryBreadcrumbs applicationId={applicationId!} />
                <main className="govuk-main-wrapper" id="main-content" role="main">
                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="govuk-width-container">
                <TaskListSummaryBreadcrumbs applicationId={applicationId!} />
                <main className="govuk-main-wrapper" id="main-content" role="main">
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
                </main>
            </div>
        );
    }

    return (
        <div className="govuk-width-container">
            <TaskListSummaryBreadcrumbs applicationId={applicationId!} />

            <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <ApplicationSummaryContent
                            data={data}
                            applicationId={applicationId!}
                            withdrawalRequest={withdrawalRequest}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ApplicationSummaryPage;
