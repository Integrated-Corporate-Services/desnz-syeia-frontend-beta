import { PaymentStatus } from '../../../ApplicationSummary/types';

export interface NWLApplicationSummaryData {
    applicationId: string;
    desnzRef?: string;
    applicantDetails: any;
    applicationDetails: any;
    noticeCompliance: any;
    occupierDetails: any;
    landownerDetails: any;
    representativeDetails: any;
    landDetails: any;
    assets: any[];
    additionalInformation: any;
    payment: {
        amount: number;
        status: PaymentStatus;
        paymentMethod?: 'CARD' | 'BANK_TRANSFER';
        paidDate?: string;
        invoiceNumber?: string;
        transactionId?: string;
    };
    permissions: {
        canWithdraw: boolean;
        canEdit: boolean;
    };
}

export const fetchNWLApplicationSummary = async (
    applicationId: string
): Promise<NWLApplicationSummaryData> => {
    const response = await fetch(`/backend/api/applications/${applicationId}/nwl-summary`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch NWL application summary: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        applicationId: data.applicationId || applicationId,
        desnzRef: data.desnzRef || data.reference_number,
        applicantDetails: data.sections?.applicantDetails || null,
        applicationDetails: data.sections?.applicationDetails || null,
        noticeCompliance: data.sections?.noticeCompliance || null,
        occupierDetails: data.sections?.occupierDetails || null,
        landownerDetails: data.sections?.landownerDetails || null,
        representativeDetails: data.sections?.representativeDetails || null,
        landDetails: data.sections?.landDetails || null,
        assets: data.sections?.assets || [],
        additionalInformation: data.sections?.additionalInformation || null,
        payment: {
            amount: data.payment?.amount || 0,
            status: data.payment?.status || PaymentStatus.PENDING,
            paymentMethod: data.payment?.method,
            paidDate: data.payment?.paid_date,
            invoiceNumber: data.payment?.invoice_number,
            transactionId: data.payment?.transaction_id,
        },
        permissions: {
            canWithdraw: data.permissions?.canWithdraw ?? true,
            canEdit: false,
        },
    };
};