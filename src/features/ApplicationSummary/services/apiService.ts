import { PaymentStatus, ApplicationStatus } from '../types';
import { ApplicationReviewSummaryData } from '../types/reviewSummary';
import { buildBackendUrl } from '../../../utils/apiConfig';

interface ApplicationSummaryData {
    applicationId: string;
    applicationType: 'NWL' | 'S37';
    desnzRef?: string;
    status: ApplicationStatus;
    submittedDate: string;
    lastUpdated?: string;
    payment: {
        amount: number;
        status: PaymentStatus;
        paymentMethod?: 'CARD' | 'BANK_TRANSFER';
        paidDate?: string;
        invoiceNumber?: string;
        transactionId?: string;
    };
    sections: any[];
    canWithdraw: boolean;
    canEdit: boolean;
}

const mapReviewResponse = (
    data: Record<string, unknown>,
    applicationId: string
): ApplicationReviewSummaryData => {
    const sections = (data.sections as Record<string, unknown>) || {};
    const permissions = (data.permissions as Record<string, boolean>) || {};
    const reviewAssetsSection = sections.assets;
    
    const normalizedAssets = Array.isArray(reviewAssetsSection)
        ? reviewAssetsSection
        : (reviewAssetsSection as { installed_assets?: unknown[] })?.installed_assets || [];
    
    const assetsMetadata = reviewAssetsSection && typeof reviewAssetsSection === 'object' && !Array.isArray(reviewAssetsSection)
        ? reviewAssetsSection
        : null;

    return {
        applicationId: (data.applicationId as string) || applicationId,
        applicationType: (data.formType as 'NWL' | 'S37') || 'NWL',
        formType: (data.formType as string) || 'NWL',
        desnzRef: (data.desnzRef as string) || null,
        status: (data.status as string) || null,
        applicantDetails: sections.applicantDetails || null,
        applicationDetails: sections.applicationDetails || null,
        noticeCompliance: sections.noticeCompliance || null,
        objectorDetails: sections.objectorDetails || null,
        landownerDetails: sections.landownerDetails || null,
        representativeDetails: sections.representativeDetails || null,
        landDetails: sections.landDetails || null,
        assets: normalizedAssets,
        assetsMetadata,
        negotiations: sections.negotiations || null,
        additionalInformation: sections.additionalInformation || null,
        payment: (sections.payment as ApplicationReviewSummaryData['payment']) || null,
        permissions: {
            canEdit: permissions.canEdit ?? false,
            canWithdraw: permissions.canWithdraw ?? false,
            canDownload: permissions.canDownload !== false, // Default to true (allow downloads post-submission)
        },
    };
};

export const fetchApplicationReviewSummary = async (
    applicationId: string
): Promise<ApplicationReviewSummaryData> => {
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/review`), {
        credentials: 'include',
    });

    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Failed to fetch application summary: ${response.status} ${errorText}`) as Error & { status?: number };
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    return mapReviewResponse(data, applicationId);
};

export const fetchApplicationSummary = async (
    applicationId: string,
    applicationType: 'NWL' | 'S37'
): Promise<ApplicationSummaryData> => {
    if (applicationType === 'NWL') {
        const review = await fetchApplicationReviewSummary(applicationId);
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
    const response = await fetch(buildBackendUrl(`/api/applications/${applicationId}/${typeParam}-summary`), {
        credentials: 'include',
    });

    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(`Failed to fetch application summary: ${response.status} ${errorText}`) as Error & { status?: number };
        error.status = response.status;
        throw error;
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
