/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { fetchApplicationReviewSummary } from '../services';
import { useWithdrawalRequest } from '../hooks';
import { useDocumentDownload } from '../../NWL/CheckYourAnswers/hooks';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import {
    TaskListSummaryBreadcrumbs,
    ReviewApplicationInfoCard,
    ReviewPaymentDetailsCard,
    WithdrawalNotificationBanner,
    SummaryWithdrawButton,
} from '../components';

import {
    ApplicantDetailsSummaryCard,
    NWLApplicationDetailsSummaryCard,
    OccupierDetailsSummaryCard,
    LandownerDetailsSummaryCard,
    RepresentativeDetailsSummaryCard,
    SiteAddressSummaryCard,
    LandRegistrySummaryCard,
    OSGridReferenceSummaryCard,
    IdentifyingInformationSummaryCard,
    AssetSummaryCard,
    AssetsPlanSummaryCard,
    NegotiationsSummaryCard,
    NWLAdditionalInformationSummaryCard,
} from '../../NWL/CheckYourAnswers/components';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CYA_CONSTANTS } from '../../NWL/CheckYourAnswers/constants';

export const ApplicationSummaryPage: React.FC = () => {
    const navigate = useNavigate();
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
                const result = await fetchApplicationReviewSummary(applicationId, 'NWL');
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

    const showWithdraw =
        data.permissions?.canWithdraw && !data.permissions?.canEdit && !withdrawalRequest;

    return (
        <div className="govuk-width-container">
            <TaskListSummaryBreadcrumbs applicationId={applicationId!} />

            <main className="govuk-main-wrapper" id="main-content" role="main">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        {withdrawalRequest?.request_status === 'Requested' && (
                            <WithdrawalNotificationBanner />
                        )}

                        <h1 className="govuk-heading-xl">{CONSTANTS.REVIEW_LAYOUT.HEADING}</h1>

                        {/* Top section - Application info and payment */}
                        <ReviewApplicationInfoCard
                            desnzRef={data.desnzRef}
                            status={data.status}
                            withdrawalRequest={withdrawalRequest}
                        />

                        <ReviewPaymentDetailsCard payment={data.payment} />

                        {showWithdraw && (
                            <SummaryWithdrawButton
                                onClick={() =>
                                    navigate(`${NWL_BASE_URL}/${applicationId}/withdraw`, {
                                        state: {
                                            desnzRef: data.desnzRef,
                                            formType: 'NWL',
                                        },
                                    })
                                }
                            />
                        )}

                        {/* Below withdraw button - Render exactly like Check Your Answers */}
                        <h2 className="govuk-heading-l">{CYA_CONSTANTS.SECTION_HEADINGS.APPLICANT_DETAILS}</h2>
                        <ApplicantDetailsSummaryCard 
                            data={data.applicantDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <h2 className="govuk-heading-l">{CYA_CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}</h2>
                        <NWLApplicationDetailsSummaryCard 
                            data={data.applicationDetails} 
                            noticeComplianceData={data.noticeCompliance}
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <h2 className="govuk-heading-l">{CYA_CONSTANTS.SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS}</h2>
                        <OccupierDetailsSummaryCard 
                            data={data.objectorDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <LandownerDetailsSummaryCard 
                            data={data.landownerDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <RepresentativeDetailsSummaryCard 
                            data={data.representativeDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <h2 className="govuk-heading-l">{CYA_CONSTANTS.SECTION_HEADINGS.LAND_DETAILS}</h2>
                        <SiteAddressSummaryCard 
                            data={data.landDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <LandRegistrySummaryCard 
                            data={data.landDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <OSGridReferenceSummaryCard 
                            data={data.landDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <IdentifyingInformationSummaryCard 
                            data={data.landDetails} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />

                        <h2 className="govuk-heading-l">{CYA_CONSTANTS.SECTION_HEADINGS.ASSETS}</h2>
                        {data.assets && data.assets.length > 0 && data.assets.map((asset, index) => (
                            <AssetSummaryCard
                                key={asset.asset_id || index}
                                asset={asset}
                                assetNumber={index + 1}
                                applicationId={applicationId!}
                                canEdit={false}
                            />
                        ))}

                        <AssetsPlanSummaryCard
                            data={data.assetsMetadata}
                            applicationId={applicationId!}
                            canEdit={false}
                        />

                        {data.negotiations && (
                            <>
                                <h2 className="govuk-heading-l">{CYA_CONSTANTS.SECTION_HEADINGS.NEGOTIATIONS}</h2>
                                <NegotiationsSummaryCard 
                                    data={data.negotiations} 
                                    applicationId={applicationId!} 
                                    canEdit={false} 
                                />
                            </>
                        )}

                        <h2 className="govuk-heading-l">{CYA_CONSTANTS.SECTION_HEADINGS.ADDITIONAL_INFORMATION}</h2>
                        <NWLAdditionalInformationSummaryCard 
                            data={data.additionalInformation} 
                            applicationId={applicationId!} 
                            canEdit={false} 
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ApplicationSummaryPage;
