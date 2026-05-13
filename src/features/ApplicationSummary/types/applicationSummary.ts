export enum PaymentStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    NOT_REQUIRED = 'NOT_REQUIRED',
}

export enum ApplicationStatus {
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    PENDING_INFORMATION = 'PENDING_INFORMATION',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
}

export interface SummaryRow {
    key: {
        text: string;
        classes?: string;
    };
    value: {
        text: string;
        html?: string;
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

export interface SummaryCardConfig {
    title: string;
    rows: SummaryRow[];
    actions?: Array<{
        href: string;
        text: string;
    }>;
    classes?: string;
}

export interface PaymentDetails {
    amount: number;
    status: PaymentStatus;
    paymentMethod?: 'CARD' | 'BANK_TRANSFER';
    paidDate?: string;
    invoiceNumber?: string;
    transactionId?: string;
}

export interface ApplicationSummaryData {
    applicationId: string;
    applicationType: 'NWL' | 'S37' | 'TLP';
    desnzRef?: string;
    status: ApplicationStatus;
    submittedDate: string;
    lastUpdated?: string;
    payment: PaymentDetails;
    sections: SummaryCardConfig[];
    canWithdraw: boolean;
    canEdit: boolean;
}
