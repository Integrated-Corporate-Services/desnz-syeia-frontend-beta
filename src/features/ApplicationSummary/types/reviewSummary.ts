/* eslint-disable @typescript-eslint/no-explicit-any */

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
}

/** Full /review payload shape used by NWL ReviewApplicationSummary (S-37-style layout). */
export interface ApplicationReviewSummaryData {
    applicationId: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    desnzRef: string | null;
    status: string | null;
    applicantDetails: any;
    applicationDetails: any;
    noticeCompliance: any;
    occupierDetails: any;
    landownerDetails: any;
    representativeDetails: any;
    landDetails: any;
    assets: any[];
    assetsMetadata: unknown | null;
    negotiations: any;
    additionalInformation: any;
    payment: ReviewSummaryPayment | null;
    permissions: ReviewSummaryPermissions;
}
