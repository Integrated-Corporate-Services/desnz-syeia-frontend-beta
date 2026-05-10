export const PAGE_HEADINGS = {
  SETTINGS: "Cookies on Submit your Energy Infrastructure Application",
  ESSENTIAL: "Essential cookies",
  ANALYTICS: "Analytics cookies (optional)",
  MONITORING: "Monitoring cookies (optional)",
  COOKIE_DETAILS: "Cookie details",
} as const;

export const SUCCESS_MESSAGES = {
  PREFERENCES_SAVED: "Your cookie preferences have been saved.",
  SUCCESS_TITLE: "Success",
} as const;

export const ERROR_MESSAGES = {
  PROBLEM_TITLE: "There is a problem",
  SAVE_FAILED: "Failed to save preferences. Please try again.",
  WITHDRAW_FAILED: "Failed to withdraw consent. Please try again.",
  CATALOG_LOAD_FAILED: "Failed to load cookie catalog:",
} as const;

export const CONTENT = {
  INTRO_DESCRIPTION: "Cookies are small files saved on your phone, tablet or computer when you visit a website.",
  USAGE_DESCRIPTION: "We use cookies to make this service work and collect information about how you use our service.",
  PRIVACY_NOTICE_TEXT: "Read our privacy notice to find out more about how we collect, use and store your personal information.",
  
  ESSENTIAL_DESCRIPTION: "Essential cookies keep your information secure while you use this service. We do not need to ask permission to use them.",
  
  ANALYTICS_DESCRIPTION: "With your permission, we use Google Analytics to collect data about how you use this service. This information helps us to improve our service.",
  ANALYTICS_INFO_HEADING: "Google Analytics stores anonymised information about:",
  ANALYTICS_INFO_POINTS: [
    "how you got to this service",
    "the pages you visit and how long you spend on them",
    "what you click on while you're visiting the service",
  ],
  
  MONITORING_DESCRIPTION: "With your permission, we use AWS CloudWatch RUM to monitor the performance and reliability of this service. This helps us identify and fix technical issues.",
} as const;

export const FORM_LABELS = {
  ANALYTICS_QUESTION: "Do you want to accept analytics cookies?",
  MONITORING_QUESTION: "Do you want to accept monitoring cookies?",
  YES: "Yes",
  NO: "No",
} as const;

export const BUTTON_TEXT = {
  SAVE: "Save cookie settings",
  SAVING: "Saving…",
  WITHDRAW: "Withdraw all consent",
} as const;

export const TABLE_HEADERS = {
  COOKIE_NAME: "Cookie name",
  PURPOSE: "Purpose",
  EXPIRES: "Expires",
} as const;

export const CONFIRMATION_MESSAGES = {
  WITHDRAW_CONFIRM: "This will reject all non-essential cookies and you will need to set your preferences again if you change your mind.",
} as const;

export const BANNER = {
  HEADING: "Cookies on Submit Your Energy Infrastructure Application",
  ARIA_LABEL: "Cookies on Submit Your Energy Infrastructure Application",
  ESSENTIAL_MESSAGE: "We use some essential cookies to make this service work.",
  ADDITIONAL_MESSAGE: "We'd like to set additional cookies so we can remember your settings, understand how you use the service and make improvements. See our",
  PRIVACY_LINK_TEXT: "privacy notice",
  PRIVACY_LINK_SUFFIX: "for more information.",
  ACCEPT_BUTTON: "Accept analytics cookies",
  REJECT_BUTTON: "Reject analytics cookies",
  VIEW_COOKIES_LINK: "View cookies",
  ACCEPTED_HEADING: "You've accepted analytics cookies",
  REJECTED_HEADING: "You've rejected analytics cookies",
  CHANGE_SETTINGS_PREFIX: "You can",
  CHANGE_SETTINGS_LINK: "change your cookie settings",
  CHANGE_SETTINGS_SUFFIX: "at any time.",
  HIDE_BUTTON: "Hide cookie message",
  ERROR_FALLBACK: "Something went wrong. Please try again.",
} as const;
