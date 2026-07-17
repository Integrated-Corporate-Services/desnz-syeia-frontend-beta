/**
 * Check Your Answers Types
 * Aggregated data from all NWL sections
 */

// Import types from each section
// TODO: Update these imports when section types are finalized
// For now, using any to allow compilation
// import { ApplicationDetailsData } from '../../ApplicationDetails/types';
// import { ObjectorDetailsData } from '../../ObjectorDetails/types';
// import { LandDetailsData } from '../../LandDetails/types';
// import { NegotiationsData } from '../../Negotiations/types';
// import { AdditionalInformationData } from '../../AdditionalInformation/types';
// import { AssetsData } from '../../Assets/types';

/**
 * Aggregated application data for Check Your Answers page
 */
export interface CheckYourAnswersData {
    applicationDetails?: any; // TODO: Replace with ApplicationDetailsData
    objectorDetails?: any; // TODO: Replace with ObjectorDetailsData
    landDetails?: any; // TODO: Replace with LandDetailsData
    assets?: any; // TODO: Replace with AssetsData
    negotiations?: any; // TODO: Replace with NegotiationsData
    additionalInformation?: any; // TODO: Replace with AdditionalInformationData
    applicationId: string;
    lastUpdated?: string;
}

/**
 * Summary row for GOV.UK summary list
 */

export interface DocumentLink {
    fileKey: string;
    filename: string;
    downloadUrl: string;
}

export interface SummaryRow {
    key: {
        text: string;
        classes?: string;
    };
    value: {
        text?: string;
        html?: string;
        reactElement?: React.ReactNode;
        documents?: DocumentLink[];
        classes?: string;
    };
    actions?: {
        items: Array<{
            href: string;
            text: string;
            visuallyHiddenText?: string;
        }>;
    };
}
