import { CheckYourAnswersCardsConfig } from '../utils/checkYourAnswersCardMapper';

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
        AssetSummaryCard,
        NegotiationsSummaryCard,
        NWLAdditionalInformationSummaryCard,
    } = await import('../../NWL/CheckYourAnswers/components');

    return {
        ApplicantDetails: ApplicantDetailsSummaryCard,
        ApplicationDetails: NWLApplicationDetailsSummaryCard,
        NoticeCompliance: NoticeComplianceSummaryCard,
        OccupierDetails: OccupierDetailsSummaryCard,
        LandownerDetails: LandownerDetailsSummaryCard,
        RepresentativeDetails: RepresentativeDetailsSummaryCard,
        SiteAddress: SiteAddressSummaryCard,
        LandLocation: LandLocationSummaryCard,
        Assets: AssetSummaryCard,
        Negotiations: NegotiationsSummaryCard,
        AdditionalInformation: NWLAdditionalInformationSummaryCard,
    };
};
