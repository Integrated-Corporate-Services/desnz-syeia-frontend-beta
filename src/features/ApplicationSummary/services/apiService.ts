import { ApplicationSummaryData, PaymentStatus } from '../types';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';

const mapReviewResponse = (
    data: Record<string, unknown>,
    applicationId: string,
    applicationType: 'NWL' | 'S37' | 'TLP'
): ApplicationReviewSummaryData => {
    const sections = (data.sections as Record<string, unknown>) || {};
    const permissions = (data.permissions as Record<string, boolean>) || {};

    return {
        applicationId: (data.applicationId as string) || applicationId,
        applicationType: (data.formType as 'NWL' | 'S37' | 'TLP') || applicationType,
        desnzRef: (data.desnzRef as string) || null,
        status: (data.status as string) || null,
        applicantDetails: sections.applicantDetails || null,
        applicationDetails: sections.applicationDetails || null,
        noticeCompliance: sections.noticeCompliance || null,
        occupierDetails: sections.occupierDetails || null,
        landownerDetails: sections.landownerDetails || null,
        representativeDetails: sections.representativeDetails || null,
        landDetails: sections.landDetails || null,
        assets: (sections.assets as unknown[]) || [],
        negotiations: sections.negotiations || null,
        additionalInformation: sections.additionalInformation || null,
        payment: (sections.payment as ApplicationReviewSummaryData['payment']) || null,
        permissions: {
            canEdit: permissions.canEdit ?? false,
            canWithdraw: permissions.canWithdraw ?? false,
        },
    };
};

export const fetchApplicationReviewSummary = async (
    applicationId: string,
    applicationType: 'NWL' | 'S37' | 'TLP'
): Promise<ApplicationReviewSummaryData> => {
    const response = await fetch(`/backend/api/applications/${applicationId}/review`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch application summary: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return mapReviewResponse(data, applicationId, applicationType);
};

export const fetchApplicationSummary = async (
    applicationId: string,
    applicationType: 'NWL' | 'S37' | 'TLP'
): Promise<ApplicationSummaryData> => {
    if (applicationType === 'NWL') {
        const review = await fetchApplicationReviewSummary(applicationId, applicationType);
        return {
            applicationId: review.applicationId,
            applicationType: review.applicationType,
            desnzRef: review.desnzRef ?? undefined,
            status: review.status as ApplicationSummaryData['status'],
            submittedDate: '',
            payment: {
                amount: review.payment?.amount ?? 0,
                status: review.payment?.is_successful ? PaymentStatus.PAID : PaymentStatus.PENDING,
            },
            sections: [],
            canWithdraw: review.permissions.canWithdraw,
            canEdit: review.permissions.canEdit,
        };
    }

    const typeParam = applicationType.toLowerCase();
    const response = await fetch(`/backend/api/applications/${applicationId}/${typeParam}-summary`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch application summary: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        applicationId: data.applicationId || applicationId,
        applicationType: data.applicationType || applicationType,
        desnzRef: data.desnzRef || data.reference_number,
        status: data.status,
        submittedDate: data.submittedDate || data.submitted_date,
        lastUpdated: data.lastUpdated || data.last_updated,
        payment: {
            amount: data.payment?.amount || 0,
            status: data.payment?.status,
            paymentMethod: data.payment?.method,
            paidDate: data.payment?.paid_date,
            invoiceNumber: data.payment?.invoice_number,
            transactionId: data.payment?.transaction_id,
        },
        sections: data.sections || [],
        canWithdraw: data.permissions?.canWithdraw ?? true,
        canEdit: data.permissions?.canEdit ?? false,
    };
};
