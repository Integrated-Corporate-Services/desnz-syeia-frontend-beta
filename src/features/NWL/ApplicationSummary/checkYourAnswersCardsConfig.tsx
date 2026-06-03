import { CheckYourAnswersCardsConfig } from '../../ApplicationSummary/utils/checkYourAnswersCardMapper';

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
        AdditionalInformation: NWLAdditionalInformationSummaryCard,
    };
};
