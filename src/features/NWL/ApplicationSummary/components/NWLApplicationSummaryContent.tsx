import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { ApplicationReviewSummaryData } from '../../../ApplicationSummary/types/reviewSummary';
import { WithdrawalRequest } from '../../../ApplicationSummary/types';
import {
    ReviewApplicationInfoCard,
    ReviewPaymentDetailsCard,
    WithdrawalNotificationBanner,
    SummaryWithdrawButton,
} from '../../../ApplicationSummary/components';
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
} from '../../CheckYourAnswers/components';
import { CHECK_YOUR_ANSWERS_CONSTANTS as CYA_CONSTANTS } from '../../CheckYourAnswers/constants';
import { APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../../../ApplicationSummary/constants';

interface NWLApplicationSummaryContentProps {
    data: ApplicationReviewSummaryData;
    applicationId: string;
    withdrawalRequest: WithdrawalRequest | null;
}

export const NWLApplicationSummaryContent: React.FC<NWLApplicationSummaryContentProps> = ({
    data,
    applicationId,
    withdrawalRequest,
}) => {
    const navigate = useNavigate();

    const showWithdraw =
        data.permissions?.canWithdraw && !data.permissions?.canEdit && !withdrawalRequest;

    return (
        <>
            {withdrawalRequest?.request_status === 'Requested' && (
                <WithdrawalNotificationBanner />
            )}

            <h1 className="govuk-heading-l">{CONSTANTS.REVIEW_LAYOUT.HEADING}</h1>

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

            <h2 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.APPLICANT_DETAILS}</h2>
            <ApplicantDetailsSummaryCard 
                data={data.applicantDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <h2 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.APPLICATION_DETAILS}</h2>
            <NWLApplicationDetailsSummaryCard 
                data={data.applicationDetails} 
                noticeComplianceData={data.noticeCompliance}
                applicationId={applicationId} 
                canEdit={false} 
            />

            <h2 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.OWNER_OCCUPIER_DETAILS}</h2>
            <OccupierDetailsSummaryCard 
                data={data.objectorDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <LandownerDetailsSummaryCard 
                data={data.landownerDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <RepresentativeDetailsSummaryCard 
                data={data.representativeDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <h2 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.LAND_DETAILS}</h2>
            <SiteAddressSummaryCard 
                data={data.landDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <LandRegistrySummaryCard 
                data={data.landDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <OSGridReferenceSummaryCard 
                data={data.landDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <IdentifyingInformationSummaryCard 
                data={data.landDetails} 
                applicationId={applicationId} 
                canEdit={false} 
            />

            <h2 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.ASSETS}</h2>
            {data.assets && data.assets.length > 0 && data.assets.map((asset, index) => (
                <AssetSummaryCard
                    key={asset.asset_id || index}
                    asset={asset}
                    assetNumber={index + 1}
                    applicationId={applicationId}
                    canEdit={false}
                />
            ))}

            <AssetsPlanSummaryCard
                data={data.assetsMetadata}
                applicationId={applicationId}
                canEdit={false}
            />

            {data.negotiations && (
                <>
                    <h2 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.NEGOTIATIONS}</h2>
                    <NegotiationsSummaryCard 
                        data={data.negotiations} 
                        applicationId={applicationId} 
                        canEdit={false} 
                    />
                </>
            )}

            <h2 className="govuk-heading-m">{CYA_CONSTANTS.SECTION_HEADINGS.ADDITIONAL_INFORMATION}</h2>
            <NWLAdditionalInformationSummaryCard 
                data={data.additionalInformation} 
                applicationId={applicationId} 
                canEdit={false} 
            />
        </>
    );
};
