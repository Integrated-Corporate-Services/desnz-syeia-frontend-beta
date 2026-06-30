export interface ReviewSummaryPayment {
    payment_id?: string | null;
    amount?: number | null;
    total_amount?: string | null;
    status?: string | null;
    kind?: string | null;
    reference?: string | null;
    transaction_number?: string | null;
    created_at?: string | null;
    is_successful?: boolean;
    is_complete?: boolean;
}

export interface ReviewSummaryPermissions {
    canEdit: boolean;
    canWithdraw: boolean;
    canDownload?: boolean;
}

export interface ApplicationReviewSummaryData {
    applicationId: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    formType?: string;
    desnzRef: string | null;
    status: string | null;
    applicantDetails: any;
    payment: ReviewSummaryPayment | null;
    permissions: ReviewSummaryPermissions;
    applicationDetails?: any;
    noticeCompliance?: any;
    objectorDetails?: any;
    landownerDetails?: any;
    representativeDetails?: any;
    landDetails?: any;
    assets?: any[];
    assetsMetadata?: unknown | null;
    negotiations?: any;
    additionalInformation?: any;
    consultations?: any;
    worksOverview?: any;
    eiaFees?: any;
    sensitiveAreas?: any;
}
