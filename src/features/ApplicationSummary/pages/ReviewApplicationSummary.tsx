/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../constants/nwl';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';
import { fetchApplicationReviewSummary } from '../services';
import { useNWLCheckYourAnswersCards, useWithdrawalRequest } from '../hooks';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import { CheckYourAnswersCardsConfig } from '../types/checkYourAnswersCards';
import {
    TaskListSummaryBreadcrumbs,
    ReviewApplicationInfoCard,
    ReviewPaymentDetailsCard,
    WithdrawalNotificationBanner,
    SummaryWithdrawButton,
} from '../components';

/**
 * NWL application summary: read-only layout aligned with S-37 (GET /review, withdrawal support).
 */
export const ReviewApplicationSummary: React.FC = () => {
    const navigate = useNavigate();
    const { applicationId } = useParams<{ applicationId: string }>();
    const { cards, loading: cardsLoading, error: cardsError } = useNWLCheckYourAnswersCards();
    const { withdrawalRequest } = useWithdrawalRequest(applicationId);

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

    if (loading || cardsLoading) {
        return (
            <div className="govuk-width-container">
                <TaskListSummaryBreadcrumbs applicationId={applicationId!} />
                <main className="govuk-main-wrapper" id="main-content" role="main">
                    <h1 className="govuk-heading-xl">{CONSTANTS.LOADING}</h1>
                </main>
            </div>
        );
    }

    if (error || cardsError || !data || !cards) {
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
                                {error || cardsError?.message || CONSTANTS.ERROR}
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

                        <ReviewSummarySections data={data} cards={cards} applicationId={applicationId!} />
                    </div>
                </div>
            </main>
        </div>
    );
};

interface ReviewSummarySectionsProps {
    data: ApplicationReviewSummaryData;
    cards: CheckYourAnswersCardsConfig;
    applicationId: string;
}

const ReviewSummarySections: React.FC<ReviewSummarySectionsProps> = ({ data, cards, applicationId }) => {
    const L = CONSTANTS.REVIEW_LAYOUT;

    return (
        <>
            <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICANT_DETAILS}</h2>
            {data.applicantDetails && cards.ApplicantDetails && (
                <cards.ApplicantDetails
                    data={data.applicantDetails}
                    applicationId={applicationId}
                    canEdit={false}
                />
            )}

            <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}</h2>
            {data.applicationDetails && cards.ApplicationDetails && (
                <cards.ApplicationDetails
                    data={data.applicationDetails}
                    applicationId={applicationId}
                    canEdit={false}
                />
            )}
            {data.noticeCompliance && cards.NoticeCompliance && (
                <cards.NoticeCompliance
                    data={data.noticeCompliance}
                    applicationId={applicationId}
                    canEdit={false}
                />
            )}

            <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS}</h2>
            {data.occupierDetails && cards.OccupierDetails && (
                <cards.OccupierDetails
                    data={data.occupierDetails}
                    applicationId={applicationId}
                    canEdit={false}
                />
            )}
            {data.landownerDetails && cards.LandownerDetails && (
                <cards.LandownerDetails
                    data={data.landownerDetails}
                    applicationId={applicationId}
                    canEdit={false}
                />
            )}
            {data.representativeDetails && cards.RepresentativeDetails && (
                <cards.RepresentativeDetails
                    data={data.representativeDetails}
                    applicationId={applicationId}
                    canEdit={false}
                />
            )}

            <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.LAND_DETAILS}</h2>
            {data.landDetails && cards.SiteAddress && (
                <cards.SiteAddress data={data.landDetails} applicationId={applicationId} canEdit={false} />
            )}
            {data.landDetails && cards.LandLocation && (
                <cards.LandLocation data={data.landDetails} applicationId={applicationId} canEdit={false} />
            )}

            <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ASSETS}</h2>
            {data.assets && data.assets.length > 0 && cards.Assets ? (
                data.assets.map((asset: any, index: number) => (
                    <cards.Assets
                        key={asset.asset_id || index}
                        data={asset}
                        index={index}
                        applicationId={applicationId}
                        canEdit={false}
                    />
                ))
            ) : (
                <p className="govuk-body">{L.NO_ASSETS}</p>
            )}

            {data.negotiations && cards.Negotiations && (
                <>
                    <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.NEGOTIATIONS}</h2>
                    <cards.Negotiations
                        data={data.negotiations}
                        applicationId={applicationId}
                        canEdit={false}
                    />
                </>
            )}

            <h2 className="govuk-heading-l">{CONSTANTS.SECTION_HEADINGS.ADDITIONAL_INFORMATION}</h2>
            {data.additionalInformation && cards.AdditionalInformation && (
                <cards.AdditionalInformation
                    data={data.additionalInformation}
                    applicationId={applicationId}
                    canEdit={false}
                />
            )}
        </>
    );
};

export default ReviewApplicationSummary;
