export const ACCESSIBILITY = {
  PAGE_TITLE: "Accessibility statement",
  SERVICE_NAME: "SYEIA (Submit Your Energy Infrastructure Application)",
  LAST_UPDATED: "5 May 2026",
  LAST_TESTED: "1 May 2026",
  
  INTRO: {
    DESCRIPTION: "This accessibility statement applies to the {serviceName} service.",
    RUN_BY: "This service is run by the Department for Energy Security and Net Zero (DESNZ). We want as many people as possible to be able to use this service.",
    CAPABILITIES_INTRO: "For example, that means you should be able to:",
    CAPABILITIES: [
      "change colours, contrast levels and fonts",
      "zoom in up to 300% without the text spilling off the screen",
      "navigate most of the service using just a keyboard",
      "navigate most of the service using speech recognition software",
      "listen to most of the service using a screen reader (including the most recent versions of JAWS, NVDA and VoiceOver)",
    ],
    TEXT_SIMPLICITY: "We've also made the service text as simple as possible to understand.",
    ABILITY_NET_LINK: "https://mcmw.abilitynet.org.uk/",
    ABILITY_NET_TEXT: "AbilityNet has advice on making your device easier to use if you have a disability.",
  },
  
  SECTIONS: {
    HOW_ACCESSIBLE: "How accessible this service is",
    FEEDBACK: "Feedback and contact information",
    REPORTING: "Reporting accessibility problems with this service",
    ENFORCEMENT: "Enforcement procedure",
    TECHNICAL_INFO: "Technical information about this service's accessibility",
    COMPLIANCE: "Compliance status",
    NON_ACCESSIBLE: "Non-accessible content",
    NON_COMPLIANCE: "Non-compliance with the accessibility regulations",
    DISPROPORTIONATE: "Disproportionate burden",
    OUT_OF_SCOPE: "Content that's not within the scope of the accessibility regulations",
    PREPARATION: "Preparation of this accessibility statement",
  },
  
  CONTENT: {
    NOT_ACCESSIBLE_INTRO: "We know some parts of this service are not fully accessible:",
    NOT_ACCESSIBLE_ITEMS: [
      "some PDF documents are not fully accessible to screen reader software",
      "some older documents may not meet accessibility standards",
      "map interactions may be difficult for keyboard-only users",
    ],
    FEEDBACK_INTRO: "If you need information on this service in a different format like accessible PDF, large print, easy read, audio recording or braille, please contact:",
    FEEDBACK_EMAIL: "accessibility@energysecurity.gov.uk",
    FEEDBACK_RESPONSE: "We'll consider your request and get back to you within 5 working days.",
    REPORTING_INTRO: "We're always looking to improve the accessibility of this service. If you find any problems not listed on this page or think we're not meeting accessibility requirements, please contact:",
    ENFORCEMENT_INTRO: "The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the 'accessibility regulations').",
    ENFORCEMENT_UNHAPPY: "If you're not happy with how we respond to your complaint, contact the Equality Advisory and Support Service (EASS).",
    EASS_LINK: "https://www.equalityadvisoryservice.com/",
    TECHNICAL_COMMITMENT: "DESNZ is committed to making this service accessible, in accordance with the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018.",
    COMPLIANCE_STATUS: "This service is partially compliant with the Web Content Accessibility Guidelines version 2.1 AA standard, due to the non-compliances listed below.",
    WCAG_LINK: "https://www.w3.org/TR/WCAG21/",
    NON_COMPLIANCE_INTRO: "The content listed below is non-accessible for the following reasons.",
    NON_COMPLIANCE_ITEMS: [
      "Some PDF documents do not have proper document structure tags (WCAG 2.1 success criterion 1.3.1)",
      "Some interactive map features are not fully keyboard accessible (WCAG 2.1 success criterion 2.1.1)",
    ],
    FIX_TIMELINE: "We plan to fix these issues by December 2026.",
    DISPROPORTIONATE_TEXT: "Not applicable.",
    OUT_OF_SCOPE_TEXT: "Some older PDF documents published before September 2018 may not meet accessibility standards. These are exempt from the accessibility regulations.",
    PREPARATION_TEXT: "This statement was prepared on {lastUpdated}. It was last reviewed on {lastUpdated}.",
    TESTING_TEXT: "This service was last tested on {lastTested}. The test was carried out by DESNZ internal teams and external accessibility consultants.",
    TESTED_INTRO: "We tested:",
    TESTED_ITEMS: [
      "all main user journeys",
      "forms and form validation",
      "error messages and notifications",
    ],
  },
} as const;

export const CONTACT = {
  PAGE_TITLE: "Contact us",
  INTRO: "Get in touch with the Submit Your Energy Infrastructure Application (SYEIA) team.",
  
  SECTIONS: {
    EMAIL: "Email",
    TELEPHONE: "Telephone",
    POST: "Post",
    ACCESS_REQUESTS: "Access requests",
    TECHNICAL_SUPPORT: "Technical support",
    FEEDBACK: "Feedback",
    PRIVACY_ENQUIRIES: "Privacy enquiries",
  },
  
  EMAIL_INTRO: "For general enquiries about the service:",
  RESPONSE_TIME: "We aim to respond within 5 working days.",
  
  TELEPHONE_INTRO: "For urgent technical issues:",
  CALL_CHARGES_LINK: "https://www.gov.uk/call-charges",
  CALL_CHARGES_TEXT: "Find out about call charges",
  
  POST_INTRO: "If you need to send documents or correspondence by post:",
  
  ACCESS_INTRO: "For questions about account access or permissions:",
  
  TECHNICAL_INTRO: "For technical issues or problems using the service:",
  TECHNICAL_INCLUDE_INTRO: "When reporting technical issues, please include:",
  TECHNICAL_INCLUDE_ITEMS: [
    "a description of the problem",
    "what you were trying to do",
    "any error messages you saw",
    "the web browser and device you're using",
    "screenshots if relevant",
  ],
  
  FEEDBACK_INTRO: "We welcome your feedback to help us improve the service:",
  
  PRIVACY_ENQUIRIES: "Privacy enquiries",
  PRIVACY_INTRO: "For questions about how we handle your personal data, see our",
  PRIVACY_LINK_TEXT: "privacy notice",
  PRIVACY_OR_CONTACT: "or contact:",
  
  CONTACTS: {
    GENERAL_NAME: "General Enquiries",
    GENERAL_EMAIL: "syeia.support@energysecurity.gov.uk",
    SUPPORT_NAME: "Support Line",
    SUPPORT_PHONE: "0300 123 4567",
    SUPPORT_HOURS: "Monday to Friday, 9am to 5pm",
    POST_NAME: "SYEIA Team",
    POST_ADDRESS: [
      "Department for Energy Security and Net Zero",
      "1 Victoria Street",
      "London",
      "SW1H 0ET",
    ],
    ACCESS_NAME: "Access Team",
    ACCESS_EMAIL: "syeia.access@energysecurity.gov.uk",
    TECHNICAL_NAME: "Technical Support",
    TECHNICAL_EMAIL: "syeia.technical@energysecurity.gov.uk",
    FEEDBACK_NAME: "Feedback",
    FEEDBACK_EMAIL: "syeia.feedback@energysecurity.gov.uk",
    PRIVACY_NAME: "Privacy Team",
    PRIVACY_EMAIL: "privacy@energysecurity.gov.uk",
  },
} as const;

export const HELP = {
  PAGE_TITLE: "Help",
  INTRO: "Get help using the Submit Your Energy Infrastructure Application (SYEIA) service.",
  
  SECTIONS: {
    GETTING_STARTED: "Getting started",
    TECHNICAL_REQUIREMENTS: "Technical requirements",
    COMMON_QUESTIONS: "Common questions",
  },
  
  GETTING_STARTED: {
    INTRO: "To use this service, you will need:",
    ITEMS: [
      "an account with appropriate permissions",
      "details about your energy infrastructure project",
      "relevant supporting documents",
    ],
  },
  
  TECHNICAL_REQUIREMENTS: {
    INTRO: "This service works with the latest versions of modern browsers including:",
    BROWSERS: [
      "Google Chrome",
      "Microsoft Edge",
      "Mozilla Firefox",
      "Apple Safari",
    ],
    JAVASCRIPT: "JavaScript must be enabled for the service to work.",
  },
  
  QUESTIONS: {
    ACCOUNT: {
      QUESTION: "How do I create an account?",
      ANSWER: "You need to request access through your organisation administrator. If you are the first user from your organisation, you can submit an access request form.",
    },
    SUBMIT: {
      QUESTION: "How do I submit an application?",
      ANSWER: "Once you have an account, you can start a new application from your dashboard. Follow the task list to complete all required sections before submitting.",
    },
    DOCUMENTS: {
      QUESTION: "What documents do I need to upload?",
      ANSWER: "Required documents vary depending on your application type. The service will guide you through the specific requirements for your application.",
    },
    TIMELINE: {
      QUESTION: "How long does the application process take?",
      ANSWER: "Processing times vary depending on the complexity of your application and statutory consultation requirements. You will be notified of progress via email.",
    },
  },
} as const;

export const TERMS = {
  PAGE_TITLE: "Terms and conditions",
  INTRO: "By using this service, you agree to our terms and conditions.",
  
  SECTIONS: {
    GENERAL: "General terms of use",
    RESPONSIBLE_USE: "Using this service responsibly",
    INFORMATION_SUBMIT: "Information you submit",
    ACCURACY: "Accuracy of information",
    AVAILABILITY: "Availability of service",
    LINKING_TO: "Linking to this service",
    LINKING_FROM: "Linking from this service",
    VIRUS_PROTECTION: "Virus protection",
    LIABILITY: "Liability",
    GOVERNING_LAW: "Governing law",
    CHANGES: "Changes to these terms and conditions",
  },
  
  GENERAL: {
    OPERATOR: "This service is operated by the Department for Energy Security and Net Zero (DESNZ).",
    APPLIES: "These terms and conditions apply to your use of this service. If you do not agree to these terms, you should not use this service.",
  },
  
  RESPONSIBLE_USE: {
    INTRO: "You must use this service responsibly and not misuse it. You must not:",
    ITEMS: [
      "attempt to gain unauthorised access to the service or any systems or networks connected to it",
      "introduce viruses, trojans, worms, logic bombs or other material that is malicious or harmful",
      "attempt to damage, disable, overburden or impair the service",
      "use automated systems or software to extract data from the service for commercial purposes",
      "submit false or misleading information",
    ],
  },
  
  INFORMATION_SUBMIT: {
    INTRO: "You are responsible for ensuring that any information you submit to this service is:",
    ITEMS: [
      "accurate and complete",
      "not defamatory or offensive",
      "not in breach of any legal duty owed to a third party (such as a contractual duty or a duty of confidence)",
      "not used to impersonate any person or to misrepresent your identity or affiliation with any person",
    ],
  },
  
  ACCURACY: {
    TEXT: "While we make every effort to ensure the information on this service is accurate, we cannot guarantee its completeness or accuracy and do not accept liability for errors or omissions.",
  },
  
  AVAILABILITY: {
    AIM: "We aim to make this service available 24 hours a day, but cannot guarantee continuous availability.",
    SUSPEND: "We may suspend or withdraw the service for operational, maintenance or security reasons, or in emergencies.",
  },
  
  LINKING_TO: {
    TEXT: "We welcome and encourage links to this service. However, we do not endorse or approve of any content on websites that link to this service.",
  },
  
  LINKING_FROM: {
    TEXT: "This service contains links to other websites. We are not responsible for the content or reliability of the linked websites and do not endorse the views expressed within them.",
  },
  
  VIRUS_PROTECTION: {
    EFFORT: "We make every effort to check and test this service for viruses at every stage of production.",
    USER_RESPONSIBILITY: "You must ensure that the way you use this service does not expose you to the risk of viruses, malicious computer code or other forms of interference which may damage your computer system.",
    NO_LIABILITY: "We are not responsible for any loss, disruption or damage to your data or computer system that may occur while using this service.",
  },
  
  LIABILITY: {
    NO_LIABILITY: "DESNZ does not accept liability for loss or damage incurred by users of this service, whether direct, indirect or consequential, whether caused by tort, breach of contract or otherwise.",
    INCLUDES: "This includes loss of income or revenue, business, profits or contracts, anticipated savings, data, goodwill, tangible property or wasted time.",
    EXCLUSIONS: "This condition does not affect any liability we may have for death or personal injury arising from our negligence, nor our liability for fraudulent misrepresentation or misrepresentation as to a fundamental matter, nor any other liability which cannot be excluded or limited under applicable law.",
  },
  
  GOVERNING_LAW: {
    LAW: "These terms and conditions are governed by and construed in accordance with the laws of England and Wales.",
    JURISDICTION: "Any dispute arising under these terms and conditions will be subject to the exclusive jurisdiction of the courts of England and Wales.",
  },
  
  CHANGES: {
    TEXT: "We may update these terms and conditions from time to time. We will notify you of any significant changes.",
  },
} as const;

export const RELATED_LINKS = {
  PRIVACY: { to: "/privacy", label: "Privacy notice" },
  COOKIES: { to: "/cookies", label: "Cookie policy and settings" },
  ACCESSIBILITY: { to: "/accessibility", label: "Accessibility statement" },
  TERMS: { to: "/terms", label: "Terms and conditions" },
  CONTACT: { to: "/contact", label: "Contact us" },
  HELP: { to: "/help", label: "Help" },
} as const;
