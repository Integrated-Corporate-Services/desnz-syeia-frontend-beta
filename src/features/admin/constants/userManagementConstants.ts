// User-facing text for the admin user management pages and components.
// Keep wording here so the pages only deal with layout and behaviour.

export const ADMIN_COMMON_CONSTANTS = {
    BACK: 'Back',
    RETURN_TO_DASHBOARD: 'Return to dashboard',
    RETURN_TO_USER_MANAGEMENT: 'Return to user management',
    ERROR_SUMMARY_TITLE: 'There is a problem',
    ERROR_PREFIX: 'Error:',
    NOT_APPLICABLE: 'N/A',
    PROCESSING: 'Processing...',
    USER_NOT_FOUND_TITLE: 'User not found',
};

// Summary list labels shared by the Manage user and Revoke access pages
export const USER_DETAILS_CONSTANTS = {
    FULL_NAME: 'Full name',
    ORGANISATION: 'Organisation',
    EMAIL_ADDRESS: 'Email address',
    PHONE_NUMBER: 'Phone number',
    ROLE: 'Role',
    AGENCY_NAME: 'Agency name',
    STATUS: 'Status',
    STATUS_ACTIVE: 'Active',
    LAST_LOGIN: 'Last login',
    LAST_LOGIN_NEVER: 'Never',
    NOT_PROVIDED: '-',
};

export const USER_MANAGEMENT_DASHBOARD_CONSTANTS = {
    PAGE_TITLE: 'User management dashboard',
    HEADING: 'User Management Dashboard',
    INTRO_SUPERUSER: 'Manage all applicant organisations, access requests and users.',
    INTRO_TEAM_COORDINATOR: 'Manage access request and users for your Organisation',
};

export const TAB_NAVIGATION_CONSTANTS = {
    ORGANISATIONS: 'Organisations',
    ACTIVE_USERS: 'Active users',
    ACCESS_REQUESTS: (count: number) => `Access requests (${count})`,
};

export const ORGANISATIONS_TAB_CONSTANTS = {
    HEADING: 'Organisations',
    RESULT_SINGULAR: 'result',
    RESULT_PLURAL: 'results',
    TABLE_HEADERS: {
        ORGANISATION_NAME: 'Organisation name',
        TEAM_COORDINATORS: 'Team coordinators',
        ORGANISATION_ADDRESS: 'Organisation address',
        ACTION: 'Action',
    },
    NO_ORGANISATIONS: 'No organisations found.',
    MANAGE: 'Manage',
};

export const PENDING_REQUESTS_TAB_CONSTANTS = {
    HEADING: 'Access requests',
    EMPTY_MESSAGE: 'No access requests.',
    RESULTS: (count: number) => `${count} results`,
    TABLE_HEADERS: {
        NAME: 'Name',
        ORGANISATION: 'Organisation',
        EMAIL: 'Email',
        REQUESTED_ON: 'Requested on',
        ACTIONS: 'Action(s)',
    },
    REVIEW: 'Review',
    LIST_ARIA_LABEL: 'Pending requests list',
    PENDING: 'Pending',
    CARD_LABELS: {
        ORGANISATION: 'Organisation: ',
        EMAIL: 'Email: ',
        REQUESTED_ON: 'Requested on: ',
    },
};

export const MANAGE_ORGANISATION_SETTINGS_CONSTANTS = {
    TITLE: 'Manage organisation',
    ORGANISATION_NOT_FOUND: 'Organisation not found',
    SUCCESS: 'Success',
    UPDATED: (section: string) => `Organisation ${section} updated`,
    ORGANISATION_NAME: 'Organisation name',
    ORGANISATION_ADDRESS: 'Organisation address',
    TEAM_COORDINATORS: 'Team coordinators',
    CHANGE: 'Change',
    CHANGE_NAME_HIDDEN: ' organisation name',
    CHANGE_ADDRESS_HIDDEN: ' organisation address',
    CHANGE_TEAM_COORDINATORS_HIDDEN: ' team coordinators',
    ADDRESS_NOT_AVAILABLE: 'Not available',
    NO_TEAM_COORDINATORS: 'No team coordinators',
};

export const TEAM_COORDINATORS_CONSTANTS = {
    TITLE: 'Manage team coordinators',
    HEADING: (count: number) => `Manage team coordinators (${count})`,
    INTRO: 'Manage the team coordinators who review access requests and manage users for this organisation.',
    TABLE_HEADERS: {
        FULL_NAME: 'Full name',
        EMAIL_ADDRESS: 'Email address',
        ACTION: 'Action',
    },
    NO_COORDINATORS: 'No team coordinators found',
    MANAGE: 'Manage',
};

export const MANAGE_USER_CONSTANTS = {
    TITLE: 'Manage user',
    NOT_FOUND_MESSAGE: 'The user you are trying to manage could not be found.',
    CHANGE: 'Change',
    CHANGE_ROLE_HIDDEN: ' role',
    REVOKE_ACCESS: 'Revoke access',
};

export const CHANGE_USER_ROLE_CONSTANTS = {
    TITLE: 'Choose a role for this user',
    TEAM_COORDINATOR_LABEL: 'Team coordinator',
    USER_ROLE_DESCRIPTION: "Can create, edit and submit their own applications, and view their organisation's applications.",
    TEAM_COORDINATOR_ROLE_DESCRIPTION: 'Can manage access for all users and create, edit and submit all applications for their organisation.',
    SELECT_ORGANISATION: 'Select an organisation',
    ORGANISATION_LOAD_ERROR: 'Organisation details could not be loaded. Return to user management and try again.',
    SELECT_ROLE: 'Select a role',
    UPDATE_ROLE_FAILED: 'Failed to update user role',
    NOT_FOUND_MESSAGE: 'The user you are trying to manage could not be found.',
    ORGANISATION_LABEL: 'Organisation',
    ORGANISATION_HINT: "Choose the organisation where this user's role should change.",
    SAVE_CHANGES: 'Save changes',
    RETURN_TO_MANAGE_USER: 'Return to manage user',
};

export const REVOKE_USER_ACCESS_CONSTANTS = {
    TITLE: 'Revoke access',
    NOT_FOUND_MESSAGE: 'The user you are trying to revoke access for could not be found.',
    WARNING: "This action cannot be undone. This user will no longer be able to coordinate access requests for this organisation and will no longer be able to submit applications on the organisation's behalf.",
    REVOKING: 'Revoking access...',
};

export const REVIEW_REQUEST_PAGE_CONSTANTS = {
    TITLE: 'Review access request',
    LOADING: 'Loading request details...',
    NOT_FOUND_TITLE: 'Request not found',
    NOT_FOUND_MESSAGE: 'The requested access request could not be found.',
    INTRO: "Review the applicant's details before approving or rejecting this request.",
};

export const REVIEW_REQUEST_COMPONENTS_CONSTANTS = {
    APPLICANT_DETAILS: {
        FULL_NAME: 'Full name',
        EMAIL_ADDRESS: 'Email address',
        ORGANISATION: 'Organisation',
        AGENT_OR_EMPLOYEE: 'Agent or employee',
        EMPLOYEE: 'Employee',
        AGENT: 'Agent',
        AGENCY_NAME: 'Agency name',
        REQUESTED_ON: 'Requested on',
    },
    REJECTION_FORM: {
        LABEL: 'Reason for rejection',
        HINT: 'Explain why this request is being rejected. This will be included in the email sent to the applicant.',
        CONFIRM: 'Confirm rejection',
        CANCEL: 'Cancel',
    },
    ACTION_BUTTONS: {
        APPROVE: 'Approve access',
        REJECT: 'Reject access',
    },
    RELATED_CONTENT: {
        HEADING: 'Related content',
        GUIDELINES: 'Guidelines for reviewing requests',
        APPLICANT_TYPES: 'Types of applicants',
        APPROVE_OR_REJECT: 'When to approve or reject',
        CONTACT_SUPPORT: 'Contact support team',
    },
};

export const ACCESS_APPROVED_CONSTANTS = {
    TITLE: 'Access granted',
    DEFAULT_USER_NAME: 'the applicant',
    PANEL_BODY: (userName: string) => `${userName} can now sign in and use the service`,
    WHAT_HAPPENS_NEXT: 'What happens next',
    EMAIL_SENT: (userName: string) => `We have sent an email to ${userName} to let them know their access request has been approved.`,
    SIGN_IN_INFO: 'They can now sign in to the service using their GOV.UK One Login account.',
    ACTIVE_USERS_INFO: 'The user will appear in your Active users list and can start using the service immediately.',
};

export const ACCESS_DENIED_CONSTANTS = {
    TITLE: 'Access rejected',
    DEFAULT_USER_NAME: 'the applicant',
    PANEL_BODY: (userName: string) => `${userName} has been notified`,
    WHAT_HAPPENS_NEXT: 'What happens next',
    EMAIL_SENT: 'We have sent an email to the user to let them know their access request has been rejected',
    WITH_REASON_SUFFIX: ' for this reason:',
    WITHOUT_REASON_SUFFIX: '.',
    CONTACT_INFO: 'If they believe the decision is incorrect, they can contact you directly or submit a new request.',
};
