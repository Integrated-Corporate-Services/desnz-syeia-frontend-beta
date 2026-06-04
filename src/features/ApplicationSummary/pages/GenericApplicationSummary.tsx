/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { ApplicationInfo, PaymentStatus } from '../types';
import { getApplicationTypeFromLocation } from '../utils';

import { fetchApplicationSummary } from '../services';
import { useCheckYourAnswersCards } from '../hooks';

import {
    ApplicationSummaryBreadcrumbs,
    ApplicationInfoSummaryCard,
    PaymentConfirmationPanel,
    PaymentDetailsSummary,
    WithdrawButton,
} from '../components';

/**
 * Generic application summary layout (payment panel, full width).
 * Used for S-37, TLP, or other types when routed through ApplicationSummaryPage.
 */
const GenericApplicationSummary: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const location = useLocation();

    const applicationType = getApplicationTypeFromLocation(location);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summaryData, setSummaryData] = useState<any>(null);

    const { cards, loading: cardsLoading, error: cardsError } = useCheckYourAnswersCards(applicationType);

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
                setError(err.message || CONSTANTS.ERROR);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [applicationId, applicationType]);

    const handlePrint = () => {
        window.print();
    };

    if (loading || cardsLoading) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationType={applicationType} applicationId={applicationId!} />
                <main className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                </main>
            </div>
        );
    }

    if (error || cardsError || !summaryData || !cards) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationType={applicationType} applicationId={applicationId!} />
                <main className="govuk-main-wrapper">
                    <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <p>{error || cardsError?.message || CONSTANTS.ERROR}</p>
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

    const applicationInfo: ApplicationInfo = {
        desnzReference: summaryData.desnzRef || 'N/A',
        caseType: CONSTANTS.CASE_TYPES[applicationType] || applicationType,
        applicationStatus: summaryData.statusLabel || 'Application submitted',
    };

    return (
        <div className="govuk-width-container">
            <ApplicationSummaryBreadcrumbs applicationType={applicationType} applicationId={applicationId!} />

            <main className="govuk-main-wrapper" id="main-content" role="main">
                <PaymentConfirmationPanel
                    desnzRef={summaryData.desnzRef}
                    applicationType={summaryData.applicationType}
                    payment={summaryData.payment}
                />

                <div className="govuk-grid-row govuk-!-margin-top-8">
                    <div className="govuk-grid-column-full">
                        <ApplicationInfoSummaryCard applicationInfo={applicationInfo} />

                        <PaymentDetailsSummary
                            desnzRef={summaryData.desnzRef}
                            applicationType={summaryData.applicationType}
                            payment={summaryData.payment}
                        />

                        <h2 className="govuk-heading-m govuk-!-margin-top-6">{CONSTANTS.WHAT_HAPPENS_NEXT.HEADING}</h2>
                        <p className="govuk-body">
                            {isPaid
                                ? CONSTANTS.WHAT_HAPPENS_NEXT.PAYMENT_CONFIRMED
                                : CONSTANTS.WHAT_HAPPENS_NEXT.PAYMENT_PENDING}
                        </p>
                        <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.REVIEW_TIME}</p>
                        {summaryData.canWithdraw && (
                            <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.WITHDRAW}</p>
                        )}

                        {summaryData.canWithdraw && (
                            <WithdrawButton
                                applicationType={applicationType}
                                applicationId={applicationId!}
                            />
                        )}

                        <h2 className="govuk-heading-l govuk-!-margin-top-8">Application details</h2>

                        {summaryData.applicantDetails && cards.ApplicantDetails && (
                            <cards.ApplicantDetails
                                data={summaryData.applicantDetails}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.applicationDetails && cards.ApplicationDetails && (
                            <cards.ApplicationDetails
                                data={summaryData.applicationDetails}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.noticeCompliance && cards.NoticeCompliance && (
                            <cards.NoticeCompliance
                                data={summaryData.noticeCompliance}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.occupierDetails && cards.OccupierDetails && (
                            <cards.OccupierDetails
                                data={summaryData.occupierDetails}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.landownerDetails && cards.LandownerDetails && (
                            <cards.LandownerDetails
                                data={summaryData.landownerDetails}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.representativeDetails && cards.RepresentativeDetails && (
                            <cards.RepresentativeDetails
                                data={summaryData.representativeDetails}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.landDetails && cards.SiteAddress && (
                            <cards.SiteAddress
                                data={summaryData.landDetails}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.landDetails && cards.LandLocation && (
                            <cards.LandLocation
                                data={summaryData.landDetails}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        {summaryData.assets && Array.isArray(summaryData.assets) && cards.Assets && (
                            summaryData.assets.map((asset: any, index: number) => (
                                <cards.Assets
                                    key={asset.asset_id || index}
                                    data={asset}
                                    index={index}
                                    applicationId={applicationId!}
                                    canEdit={false}
                                />
                            ))
                        )}

                        {summaryData.additionalInformation && cards.AdditionalInformation && (
                            <cards.AdditionalInformation
                                data={summaryData.additionalInformation}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        )}

                        <div className="govuk-button-group govuk-!-margin-top-8">
                            <button
                                type="button"
                                className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                onClick={handlePrint}
                            >
                                {CONSTANTS.ACTIONS.PRINT}
                            </button>
                            <Link to={CONSTANTS.ROUTES.APPLICATIONS} className="govuk-link">
                                {CONSTANTS.ACTIONS.BACK_TO_APPLICATIONS}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GenericApplicationSummary;
