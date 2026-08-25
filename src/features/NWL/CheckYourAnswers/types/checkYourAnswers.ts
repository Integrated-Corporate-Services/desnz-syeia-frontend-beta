
export interface CheckYourAnswersData {
    applicationDetails?: any;
    objectorDetails?: any; 
    landDetails?: any; 
    assets?: any; 
    negotiations?: any; 
    additionalInformation?: any; 
    applicationId: string;
    lastUpdated?: string;
}

/**
 * Summary row for GOV.UK summary list
 */

export interface DocumentLink {
    fileKey: string;
    fileId?: string;
    documentId?: string;
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
