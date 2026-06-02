/**
 * NWL Application Summary Types
 *
 * Read-only, post-submission view of a submitted NWL application.
 * Data is sourced from GET /api/applications/:id/review (ReviewPayload).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Payment details as returned by the review payload (mapDbToReviewPayment).
 * Amounts are stored in pence; total_amount is a pre-formatted "£X.XX" string.
 */
export interface NWLSummaryPayment {
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

export interface NWLSummaryPermissions {
    canEdit: boolean;
    canWithdraw: boolean;
}

/**
 * Aggregated application data for the NWL Application Summary page.
 */
export interface NWLApplicationSummaryData {
    applicationId: string;
    desnzRef: string | null;
    formType: string | null;
    status: string | null;
    applicantDetails: any;
    applicationDetails: any;
    noticeCompliance: any;
    occupierDetails: any;
    landownerDetails: any;
    representativeDetails: any;
    landDetails: any;
    assets: any[];
    negotiations: any;
    additionalInformation: any;
    payment: NWLSummaryPayment | null;
    permissions: NWLSummaryPermissions;
}
