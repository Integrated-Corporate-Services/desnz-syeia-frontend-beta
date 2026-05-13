/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { ApplicationSummaryData, PaymentStatus } from '../types';

import { fetchApplicationSummary } from '../services';

import {
    ApplicationSummaryBreadcrumbs,
    PaymentConfirmationPanel,
    PaymentDetailsSummary,
    SummaryCard,
} from '../components';

interface ApplicationSummaryPageProps {
    applicationType: 'NWL' | 'S37' | 'TLP';
}

export const ApplicationSummaryPage: React.FC<ApplicationSummaryPageProps> = ({ applicationType }) => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summaryData, setSummaryData] = useState<ApplicationSummaryData | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setError('Application ID not found');
            setLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchApplicationSummary(applicationId, applicationType);
                setSummaryData(data);
            } catch (err: any) {
                console.error('Failed to load application summary:', err);
                setError(err.message || CONSTANTS.ERROR);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [applicationId, applicationType]);

    const handleWithdraw = () => {
        if (!applicationId) return;
        const withdrawUrl = CONSTANTS.ROUTES.WITHDRAW(applicationType, applicationId);
        navigate(withdrawUrl);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationType={applicationType} applicationId={applicationId!} />
                <main className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                </main>
            </div>
        );
    }

    if (error || !summaryData) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationType={applicationType} applicationId={applicationId!} />
                <main className="govuk-main-wrapper">
                    <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <p>{error || CONSTANTS.ERROR}</p>
                        </div>
                    </div>
                    <Link to={CONSTANTS.ROUTES.APPLICATIONS} className="govuk-button govuk-button--secondary">
                        {CONSTANTS.ACTIONS.BACK_TO_APPLICATIONS}
                    </Link>
                </main>
            </div>
        );
    }

    const isPaid = summaryData.payment.status === PaymentStatus.PAID;

    return (
        <div className="govuk-width-container">
            <ApplicationSummaryBreadcrumbs applicationType={applicationType} applicationId={applicationId!} />
            
            <main className="govuk-main-wrapper" id="main-content" role="main">
                {/* Payment confirmation panel */}
                    desnzRef={summaryData.desnzRef}
                    applicationType={summaryData.applicationType}
                    payment={summaryData.payment}
                />

                <div className="govuk-grid-row govuk-!-margin-top-8">
                    <div className="govuk-grid-column-two-thirds">
                        {/* Payment details summary */}
                            desnzRef={summaryData.desnzRef}
                            applicationType={summaryData.applicationType}
                            payment={summaryData.payment}
                        />

                        {/* What happens next */}
                        <p className="govuk-body">
                            {isPaid
                                ? CONSTANTS.WHAT_HAPPENS_NEXT.PAYMENT_CONFIRMED
                                : CONSTANTS.WHAT_HAPPENS_NEXT.PAYMENT_PENDING}
                        </p>
                        <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.REVIEW_TIME}</p>
                        {summaryData.canWithdraw && (
                            <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.WITHDRAW}</p>
                        )}

                        {/* Application details section */}
                        <h2 className="govuk-heading-l govuk-!-margin-top-8">
                        </h2>

                        {/* Render all summary cards */}
                        {summaryData.sections.map((section, index) => (
                                key={index}
                                title={section.title}
                                rows={section.rows}
                                actions={section.actions}
                                classes={section.classes}
                            />
                        ))}

                        {/* Action buttons */}
                        <div className="govuk-button-group govuk-!-margin-top-6">
                                <button
                                    type="button"
                                    className="govuk-button govuk-button--warning"
                                    data-module="govuk-button"
                                    onClick={handleWithdraw}
                                >
                                    {CONSTANTS.ACTIONS.WITHDRAW}
                                </button>
                            )}
                            <button
                                type="button"
                                className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                onClick={handlePrint}
                            >
                                {CONSTANTS.ACTIONS.PRINT}
                            </button>
                            <Link
                                to={CONSTANTS.ROUTES.APPLICATIONS}
                                className="govuk-link"
                            >
                                {CONSTANTS.ACTIONS.BACK_TO_APPLICATIONS}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
