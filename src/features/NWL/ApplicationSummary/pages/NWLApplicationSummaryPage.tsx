/**
 * NWL Application Summary Page
 *
 * Read-only, post-submission view of a submitted NWL application.
 * Data is sourced from GET /api/applications/:id/review and rendered
 * using the existing NWL summary cards (with editing disabled).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { useNWLApplicationSummary } from '../hooks';

import {
    ApplicationSummaryBreadcrumbs,
    ApplicationInfoCard,
    PaymentDetailsCard,
    WhatHappensNext,
} from '../components';

import { WithdrawButton } from '../../../ApplicationSummary/components';

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
    NegotiationsSummaryCard,
    NWLAdditionalInformationSummaryCard,
} from '../../CheckYourAnswers/components';

export const NWLApplicationSummaryPage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const { data, loading, error } = useNWLApplicationSummary(applicationId);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationId={applicationId!} />
                <main className="govuk-main-wrapper" id="main-content" role="main">
                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="govuk-width-container">
                <ApplicationSummaryBreadcrumbs applicationId={applicationId!} />
                <main className="govuk-main-wrapper" id="main-content" role="main">
                    <div className="govuk-error-summary" role="alert" aria-labelledby="error-summary-title">
                        <h2 className="govuk-error-summary__title" id="error-summary-title">
                            There is a problem
                        </h2>
                        <div className="govuk-error-summary__body">
                            <p className="govuk-body">{error || CONSTANTS.ERROR}</p>
                        </div>
                    </div>
                    <Link to={`${NWL_BASE_URL}/${applicationId}/task-list`} className="govuk-button govuk-button--secondary">
                        {CONSTANTS.ACTIONS.BACK_TO_APPLICATIONS}
                    </Link>
                </main>
            </div>
        );
    }

    const { permissions } = data;
    const showWithdraw = permissions.canWithdraw && !permissions.canEdit;

    return (
        <div className="govuk-width-container">
            <ApplicationSummaryBreadcrumbs applicationId={applicationId!} />

            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl">{CONSTANTS.HEADING}</h1>

                        <ApplicationInfoCard desnzRef={data.desnzRef} status={data.status} />

                        <PaymentDetailsCard payment={data.payment} />

                        {showWithdraw && (
                            <WithdrawButton applicationType="NWL" applicationId={applicationId!} />
                        )}

                        {/* Applicant details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICANT_DETAILS}</h2>
                        <ApplicantDetailsSummaryCard data={data.applicantDetails} applicationId={applicationId!} canEdit={false} />

                        {/* Application details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}</h2>
                        <NWLApplicationDetailsSummaryCard data={data.applicationDetails} applicationId={applicationId!} canEdit={false} />
                        <NoticeComplianceSummaryCard data={data.noticeCompliance} applicationId={applicationId!} canEdit={false} />

                        {/* Objector / owner / occupier details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS}</h2>
                        <OccupierDetailsSummaryCard data={data.occupierDetails} applicationId={applicationId!} canEdit={false} />
                        <LandownerDetailsSummaryCard data={data.landownerDetails} applicationId={applicationId!} canEdit={false} />
                        <RepresentativeDetailsSummaryCard data={data.representativeDetails} applicationId={applicationId!} canEdit={false} />

                        {/* Land details */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.LAND_DETAILS}</h2>
                        <SiteAddressSummaryCard data={data.landDetails} applicationId={applicationId!} canEdit={false} />
                        <LandLocationSummaryCard data={data.landDetails} applicationId={applicationId!} canEdit={false} />

                        {/* Assets */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ASSETS}</h2>
                        {data.assets && data.assets.length > 0 ? (
                            data.assets.map((asset: any, index: number) => (
                                <AssetSummaryCard
                                    key={asset.asset_id || index}
                                    data={asset}
                                    index={index}
                                    applicationId={applicationId!}
                                    canEdit={false}
                                />
                            ))
                        ) : (
                            <p className="govuk-body">{CONSTANTS.NO_ASSETS}</p>
                        )}

                        {/* Negotiations */}
                        {data.negotiations && (
                            <>
                                <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.NEGOTIATIONS}</h2>
                                <NegotiationsSummaryCard data={data.negotiations} applicationId={applicationId!} canEdit={false} />
                            </>
                        )}

                        {/* Additional information */}
                        <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ADDITIONAL_INFORMATION}</h2>
                        <NWLAdditionalInformationSummaryCard data={data.additionalInformation} applicationId={applicationId!} canEdit={false} />

                        <WhatHappensNext canWithdraw={showWithdraw} />

                        <div className="govuk-button-group govuk-!-margin-top-6">
                            <button
                                type="button"
                                className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                onClick={handlePrint}
                            >
                                {CONSTANTS.ACTIONS.PRINT}
                            </button>
                            <Link to={`${NWL_BASE_URL}/${applicationId}/task-list`} className="govuk-link">
                                {CONSTANTS.ACTIONS.BACK_TO_APPLICATIONS}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NWLApplicationSummaryPage;
