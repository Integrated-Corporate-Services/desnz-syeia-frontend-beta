export const APPLICATION_SUMMARY_CONSTANTS = {
    PAGE_TITLE: 'Application Summary',
    LOADING: 'Loading application summary...',
    ERROR: 'Failed to load application summary',
    BREADCRUMBS: {
        HOME: 'Home',
        APPLICATIONS: 'My applications',
        SUMMARY: 'Application summary',
        TASK_LIST: 'Task list',
        APPLICATION_SUMMARY: 'Application summary',
    },

    PAYMENT_PANEL: {
        TITLE: 'Application submitted',
        PAYMENT_RECEIVED: 'Payment received',
        PAYMENT_PENDING: 'Payment pending',
        DESNZ_REFERENCE: 'DESNZ reference',
        CASE_TYPE: 'Case type',
        APPLICATION_FEE: 'Application fee',
        PAYMENT_METHOD: 'Payment method',
        PAYMENT_DATE: 'Payment date',
        INVOICE_NUMBER: 'Invoice number',
        TRANSACTION_ID: 'Transaction ID',
    },

    CASE_TYPES: {
        NWL: 'Necessary Wayleave (NWL)',
        S37: 'Section 37 Consent',
        TLP: 'Temporary Land Possession',
    },

    PAYMENT_METHODS: {
        CARD: 'Credit or debit card',
        BANK_TRANSFER: 'Bank transfer (BACS)',
    },

    WHAT_HAPPENS_NEXT: {
        HEADING: 'What happens next',
        PAYMENT_CONFIRMED: 'We will review your application and contact you if we need any additional information.',
        PAYMENT_PENDING: 'We can only start processing your application after we receive your payment. Please make your payment using the details provided in your confirmation email.',
        REVIEW_TIME: 'Application reviews typically take 4 to 6 weeks.',
        WITHDRAW: 'If you need to withdraw your application, you can do so using the button below.',
    },

    ACTIONS: {
        WITHDRAW: 'Withdraw application',
        WITHDRAW_APPLICATION: 'Withdraw application',
        PRINT: 'Print this page',
        BACK_TO_APPLICATIONS: 'Back to my applications',
    },

    SECTION_HEADINGS: {
        PAYMENT_CONFIRMATION: 'Payment confirmation',
        APPLICATION_DETAILS: 'Application details',
        APPLICANT_DETAILS: 'Applicant details',
        OWNER_OCCUPIER_DETAILS: 'Objector details',
        LAND_DETAILS: 'Land details',
        ASSETS: 'Assets',
        NEGOTIATIONS: 'Negotiations',
        ADDITIONAL_INFORMATION: 'Additional information',
    },

    REVIEW_LAYOUT: {
        HEADING: 'Application summary',
        SUMMARY_CARD: {
            TITLE: 'Summary',
            DESNZ_REF: 'DESNZ reference',
            CASE_TYPE: 'Case type',
            STATUS: 'Status',
            WITHDRAWAL_REQUEST_STATUS: 'Withdrawal request',
        },
        CASE_TYPE_LABEL: 'Necessary Wayleave (NWL)',
        PAYMENT: {
            HEADING: 'Payment',
            APPLICATION_FEE: 'Application fee',
            PAYMENT_METHOD: 'Payment method',
            PAYMENT_STATUS: 'Payment status',
            PAYMENT_DATE: 'Payment date',
            PAYMENT_REFERENCE: 'Payment reference number',
            STATUS_PAID: 'Paid',
            STATUS_PENDING: 'Pending',
            METHODS: {
                card: 'Credit or debit card',
                bank_transfer: 'Bank transfer (BACS)',
            } as Record<string, string>,
        },
        WITHDRAWAL: {
            NOTIFICATION_BANNER:
                'You sent a request to withdraw this application. This is being reviewed by your case officer.',
        },
        NO_ASSETS: 'No assets provided.',
        DEFAULTS: {
            NOT_AVAILABLE: 'N/A',
        },
    },

    STATUS_LABELS: {
        DRAFT: 'Draft',
        SUBMITTED: 'Application submitted',
        UNDER_REVIEW: 'Under review',
        PENDING_INFORMATION: 'Pending information',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        WITHDRAWN: 'Withdrawn',
    } as Record<string, string>,

    ROUTES: {
        APPLICATIONS: '/frontend/workbasket',
        WITHDRAW: (applicationType: string, applicationId: string) => 
            `/frontend/${applicationType.toLowerCase()}/${applicationId}/withdraw`,
    },
};
