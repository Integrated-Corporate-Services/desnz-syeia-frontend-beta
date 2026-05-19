export const WITHDRAWAL_CONSTANTS = {
    PAGE_TITLE: 'Withdraw application',
    LOADING: 'Loading...',
    ERROR: 'Failed to process withdrawal request',

    BREADCRUMBS: {
        APPLICATIONS: 'My applications',
        SUMMARY: 'Application summary',
        WITHDRAW: 'Withdraw application',
    },

    WITHDRAW_PAGE: {
        HEADING: 'Withdraw application',
        WARNING_HEADING: 'Warning',
        WARNING_TEXT: 'Withdrawing your application is permanent and cannot be undone. You will need to submit a new application if you change your mind.',
        DESCRIPTION: 'Tell us why you want to withdraw this application.',
        
        VOLUNTARY_AGREEMENT_LABEL: 'Have you reached a voluntary agreement with the landowner or occupier?',
        VOLUNTARY_AGREEMENT_HINT: 'Select yes if you have reached a voluntary agreement.',
        VOLUNTARY_AGREEMENT_ERROR: 'Select yes if you have reached a voluntary agreement with the landowner or occupier',
        VOLUNTARY_AGREEMENT_YES: 'Yes',
        VOLUNTARY_AGREEMENT_NO: 'No',
        
        REASON_LABEL: 'Reason for withdrawal (optional)',
        REASON_HINT: 'Select the reason that best describes why you are withdrawing this application.',
        REASON_ERROR: 'Select a reason for withdrawal',
        
        COMMENTS_LABEL: 'Additional comments (optional)',
        COMMENTS_HINT: 'Provide any additional details about why you are withdrawing this application.',
        COMMENTS_MAXLENGTH: 1000,
        COMMENTS_REMAINING: (remaining: number) => `You have ${remaining} characters remaining`,
        
        CONFIRMATION_LABEL: 'I confirm I want to withdraw this application',
        CONFIRMATION_ERROR: 'You must confirm you want to withdraw this application',
        
        SUBMIT_BUTTON: 'Withdraw application',
        CANCEL_BUTTON: 'Cancel',
        SUBMITTING: 'Processing...',
    },

    REASONS: {
        NWL: [
            { value: 'no_longer_required', label: 'The wayleave is no longer required' },
            { value: 'submitted_in_error', label: 'Application submitted in error' },
            { value: 'voluntary_agreement', label: 'Voluntary agreement reached with landowner' },
            { value: 'alternative_route', label: 'Alternative route found' },
            { value: 'project_cancelled', label: 'Project has been cancelled' },
            { value: 'other', label: 'Other reason' },
        ],
        S37: [
            { value: 'no_longer_required', label: 'Consent no longer required' },
            { value: 'submitted_in_error', label: 'Application submitted in error' },
            { value: 'planning_refused', label: 'Planning permission refused' },
            { value: 'alternative_solution', label: 'Alternative solution found' },
            { value: 'project_cancelled', label: 'Project has been cancelled' },
            { value: 'other', label: 'Other reason' },
        ],
        TLP: [
            { value: 'no_longer_required', label: 'Land possession no longer required' },
            { value: 'submitted_in_error', label: 'Application submitted in error' },
            { value: 'voluntary_agreement', label: 'Voluntary agreement reached' },
            { value: 'alternative_arrangement', label: 'Alternative arrangement made' },
            { value: 'project_cancelled', label: 'Project has been cancelled' },
            { value: 'other', label: 'Other reason' },
        ],
    },

    CONFIRMATION_PAGE: {
        PANEL_TITLE: 'Application withdrawn',
        HEADING: 'Withdrawal confirmation',
        WHAT_HAPPENS_NEXT: 'What happens next',
        NEXT_STEPS: 'Your application has been withdrawn. You will receive an email confirmation shortly.',
        NO_FURTHER_ACTION: 'No further action is required from you.',
        NEW_APPLICATION: 'If you need to resubmit, you will need to create a new application.',
        FEEDBACK_HEADING: 'Help us improve this service',
        FEEDBACK_TEXT: 'Your feedback helps us make improvements.',
        FEEDBACK_LINK: 'What did you think of this service? (takes 2 minutes)',
        
        DETAILS_HEADING: 'Withdrawal details',
        APPLICATION_TYPE: 'Application type',
        WITHDRAWAL_DATE: 'Withdrawal date',
        REASON: 'Reason',
        
        BACK_TO_APPLICATIONS: 'Back to my applications',
        PRINT_CONFIRMATION: 'Print confirmation',
        DESNZ_REF: 'DESNZ Reference',
    },

    CASE_TYPES: {
        NWL: 'Notice of Wayleave',
        S37: 'Section 37 Consent',
        TLP: 'Temporary Land Possession',
    },

    ROUTES: {
        APPLICATIONS: '/frontend/workbasket',
        SUMMARY: (applicationType: string, applicationId: string) =>
            `/frontend/${applicationType.toLowerCase()}/${applicationId}/application-summary`,
        CONFIRMATION: (applicationType: string, applicationId: string) =>
            `/frontend/${applicationType.toLowerCase()}/${applicationId}/withdrawal-confirmation`,
    },
};
