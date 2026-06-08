import { CheckYourAnswersCardsConfig } from '../../ApplicationSummary/types/checkYourAnswersCards';

export const getNWLCheckYourAnswersCards = async (): Promise<CheckYourAnswersCardsConfig> => {
    const {
        ApplicantDetailsSummaryCard,
        NWLApplicationDetailsSummaryCard,
        NoticeComplianceSummaryCard,
        OccupierDetailsSummaryCard,
        LandownerDetailsSummaryCard,
        RepresentativeDetailsSummaryCard,
        SiteAddressSummaryCard,
        LandLocationSummaryCard,
        AssetsPlanSummaryCard,
        NegotiationsSummaryCard,
        NWLAdditionalInformationSummaryCard,
    } = await import('../CheckYourAnswers/components');

    return {
        ApplicantDetails: ApplicantDetailsSummaryCard,
        ApplicationDetails: NWLApplicationDetailsSummaryCard,
        NoticeCompliance: NoticeComplianceSummaryCard,
        OccupierDetails: OccupierDetailsSummaryCard,
        LandownerDetails: LandownerDetailsSummaryCard,
        RepresentativeDetails: RepresentativeDetailsSummaryCard,
        SiteAddress: SiteAddressSummaryCard,
        LandLocation: LandLocationSummaryCard,
        Assets: AssetsPlanSummaryCard,
        Negotiations: NegotiationsSummaryCard,
        AdditionalInformation: NWLAdditionalInformationSummaryCard,
    };
};
