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
    Negotiations?: React.ComponentType<any>;
    [key: string]: React.ComponentType<any> | undefined;
}
