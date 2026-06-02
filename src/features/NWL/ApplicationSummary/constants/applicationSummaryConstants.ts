/**
 * NWL Application Summary Constants
 * All text, labels, and routes for the read-only NWL Application Summary page.
 */

export const NWL_APPLICATION_SUMMARY_CONSTANTS = {
    PAGE_TITLE: 'Application summary',
    HEADING: 'Application summary',
    LOADING: 'Loading application summary...',
    ERROR: 'Failed to load application summary. Please try again.',

    BREADCRUMBS: {
        TASK_LIST: 'Task list',
        APPLICATION_SUMMARY: 'Application summary',
    },

    SUMMARY_CARD: {
        TITLE: 'Summary',
        DESNZ_REF: 'DESNZ reference',
        CASE_TYPE: 'Case type',
        STATUS: 'Status',
        WITHDRAWAL_REQUEST_STATUS: 'Withdrawal request',
    },

    WITHDRAWAL: {
        NOTIFICATION_BANNER:
            'You sent a request to withdraw this application. This is being reviewed by your case officer.',
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

    SECTION_HEADINGS: {
        APPLICANT_DETAILS: 'Applicant details',
        APPLICATION_DETAILS: 'Application details',
        OWNER_OCCUPIER_DETAILS: 'Objector details',
        LAND_DETAILS: 'Land details',
        ASSETS: 'Assets',
        NEGOTIATIONS: 'Negotiations',
        ADDITIONAL_INFORMATION: 'Additional information',
        APPLICATION_DETAILS_GROUP: 'Application details',
    },

    NO_ASSETS: 'No assets provided.',

    WHAT_HAPPENS_NEXT: {
        HEADING: 'What happens next',
        EMAIL: 'You will receive an email to confirm your application has been submitted.',
        CONTACT: 'The wayleave team will contact you in due course with any follow up actions.',
        REVIEW_TIME: 'Application reviews typically take 4 to 6 weeks.',
        WITHDRAW: 'If you need to withdraw your application, you can do so using the button below.',
    },

    ACTIONS: {
        PRINT: 'Print this page',
        BACK_TO_APPLICATIONS: 'Back to applications',
    },

    STATUS_LABELS: {
        DRAFT: 'Draft',
        SUBMITTED: 'Submitted',
        UNDER_REVIEW: 'Under review',
        PENDING_INFORMATION: 'Pending information',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        WITHDRAWN: 'Withdrawn',
    } as Record<string, string>,

    DEFAULTS: {
        NOT_AVAILABLE: 'N/A',
    },
};
