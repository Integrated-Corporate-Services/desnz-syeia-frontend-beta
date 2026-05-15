import { ApplicationSummaryData } from '../types';

export const fetchApplicationSummary = async (
    applicationId: string,
    applicationType: 'NWL' | 'S37' | 'TLP'
): Promise<ApplicationSummaryData> => {
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
