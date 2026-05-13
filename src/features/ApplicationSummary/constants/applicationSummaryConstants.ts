export const APPLICATION_SUMMARY_CONSTANTS = {
    PAGE_TITLE: 'Application Summary',
    LOADING: 'Loading application summary...',
    BREADCRUMBS: {
        HOME: 'Home',
        APPLICATIONS: 'My applications',
        SUMMARY: 'Application summary',
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
        PRINT: 'Print this page',
        BACK_TO_APPLICATIONS: 'Back to my applications',
    },

    SECTION_HEADINGS: {
        PAYMENT_CONFIRMATION: 'Payment confirmation',
        APPLICATION_DETAILS: 'Application details',
    },

    STATUS_LABELS: {
        SUBMITTED: 'Submitted',
        UNDER_REVIEW: 'Under review',
        PENDING_INFORMATION: 'Pending information',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        WITHDRAWN: 'Withdrawn',
    },

    ROUTES: {
        APPLICATIONS: '/frontend/workbasket',
        WITHDRAW: (applicationType: string, applicationId: string) => 
            `/frontend/${applicationType.toLowerCase()}/${applicationId}/withdraw`,
    },
};
