import React from 'react';

export interface CheckYourAnswersCardsConfig {
    ApplicantDetails: React.ComponentType<any>;
    ApplicationDetails: React.ComponentType<any>;
    NoticeCompliance?: React.ComponentType<any>;
    OccupierDetails?: React.ComponentType<any>;
    LandownerDetails?: React.ComponentType<any>;
    RepresentativeDetails?: React.ComponentType<any>;
    SiteAddress: React.ComponentType<any>;
    LandLocation?: React.ComponentType<any>;
    Assets: React.ComponentType<any>;
    AdditionalInformation: React.ComponentType<any>;
    [key: string]: React.ComponentType<any> | undefined;
}

export interface ApplicationSummaryCardsProps {
    data: any;
    applicationId: string;
    canEdit?: boolean;
}

const checkYourAnswersRegistry: Record<string, () => Promise<CheckYourAnswersCardsConfig>> = {};

export const registerCheckYourAnswersCards = (
    applicationType: string,
    loader: () => Promise<CheckYourAnswersCardsConfig>
) => {
    checkYourAnswersRegistry[applicationType.toUpperCase()] = loader;
};

export const getCheckYourAnswersCards = async (
    applicationType: 'NWL' | 'S37' | 'TLP'
): Promise<CheckYourAnswersCardsConfig | null> => {
    const loader = checkYourAnswersRegistry[applicationType];
    if (!loader) {
        return null;
    }
    return await loader();
};
