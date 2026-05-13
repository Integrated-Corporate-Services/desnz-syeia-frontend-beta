/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../constants/nwl';

import {
    ApplicationSummaryBreadcrumbs,
    PaymentConfirmationPanel,
    PaymentDetailsSummary,
} from '../../ApplicationSummary/components';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../../ApplicationSummary/constants';

import {
    ApplicantDetailsSummaryCard,
    NWLApplicationDetailsSummaryCard,
    NoticeComplianceSummaryCard,
    OccupierDetailsSummaryCard,
    LandownerDetailsSummaryCard,
    RepresentativeDetailsSummaryCard,
    SiteAddressSummaryCard,
    LandLocationSummaryCard,
    AssetSummaryCard,
    NWLAdditionalInformationSummaryCard,
} from '../CheckYourAnswers/components';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CYA_CONSTANTS } from '../CheckYourAnswers/constants';

import { fetchNWLApplicationSummary, NWLApplicationSummaryData } from './services';
import { PaymentStatus } from '../../ApplicationSummary/types';

export const NWLApplicationSummaryPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summaryData, setSummaryData] = useState<NWLApplicationSummaryData | null>(null);

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

                const data = await fetchNWLApplicationSummary(applicationId);
                setSummaryData(data);
            } catch (err: any) {
                console.error('Failed to load NWL application summary:', err);
                setError(err.message || CONSTANTS.ERROR);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [applicationId]);

    const handleWithdraw = () => {
        if (!applicationId) return;
        navigate(`${NWL_BASE_URL}/${applicationId}/withdraw`);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationType="NWL" applicationId={applicationId!} />
                <main className="govuk-main-wrapper">
                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                </main>
            </div>
        );
    }

    if (error || !summaryData) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationType="NWL" applicationId={applicationId!} />
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
            <ApplicationSummaryBreadcrumbs applicationType="NWL" applicationId={applicationId!} />

            <main className="govuk-main-wrapper" id="main-content" role="main">
                <PaymentConfirmationPanel
                    desnzRef={summaryData.desnzRef}
                    applicationType="NWL"
                    payment={summaryData.payment}
                />

                <div className="govuk-grid-row govuk-!-margin-top-8">
                    <div className="govuk-grid-column-two-thirds">
                        <PaymentDetailsSummary
                            desnzRef={summaryData.desnzRef}
                            applicationType="NWL"
                            payment={summaryData.payment}
                        />

                        <h2 className="govuk-heading-m">{CONSTANTS.WHAT_HAPPENS_NEXT.HEADING}</h2>
                        <p className="govuk-body">
                            {isPaid
                                ? CONSTANTS.WHAT_HAPPENS_NEXT.PAYMENT_CONFIRMED
                                : CONSTANTS.WHAT_HAPPENS_NEXT.PAYMENT_PENDING}
                        </p>
                        <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.REVIEW_TIME}</p>
                        {summaryData.permissions.canWithdraw && (
                            <p className="govuk-body">{CONSTANTS.WHAT_HAPPENS_NEXT.WITHDRAW}</p>
                        )}

                        <h2 className="govuk-heading-l govuk-!-margin-top-8">
                            {CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}
                        </h2>

                        <h3 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.APPLICANT_DETAILS}</h3>
                        <ApplicantDetailsSummaryCard
                            data={summaryData.applicantDetails}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <h3 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}</h3>
                        <NWLApplicationDetailsSummaryCard
                            data={summaryData.applicationDetails}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <NoticeComplianceSummaryCard
                            data={summaryData.noticeCompliance}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <h3 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS}</h3>
                        <OccupierDetailsSummaryCard
                            data={summaryData.occupierDetails}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <LandownerDetailsSummaryCard
                            data={summaryData.landownerDetails}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <RepresentativeDetailsSummaryCard
                            data={summaryData.representativeDetails}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <h3 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.LAND_DETAILS}</h3>
                        <SiteAddressSummaryCard
                            data={summaryData.landDetails}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <LandLocationSummaryCard
                            data={summaryData.landDetails}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <h3 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.ASSETS}</h3>
                        {summaryData.assets.map((asset, index) => (
                            <AssetSummaryCard
                                key={asset.asset_id || index}
                                data={asset}
                                index={index}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        ))}

                        <h3 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.ADDITIONAL_INFORMATION}</h3>
                        <NWLAdditionalInformationSummaryCard
                            data={summaryData.additionalInformation}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        <div className="govuk-button-group govuk-!-margin-top-8">
                            {summaryData.permissions.canWithdraw && (
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
