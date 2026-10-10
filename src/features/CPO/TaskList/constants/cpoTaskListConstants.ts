import type { CpoTaskSection } from '../types/cpoTaskList';

export const CPO_SUBSECTIONS = {
  APPLICANT_DETAILS: 'Applicant details',
  CHECK_APPLICANT_CONTACT_DETAILS: 'Check applicant contact details',
  PRE_SUBMISSION_MEETING: 'Pre-submission meeting',
  ORDER_DETAILS: 'Order details',
  EXECUTIVE_SUMMARY: 'Executive summary',
  ORDER_DOCUMENTS: 'Order documents',
  RECORD_NOTICES: 'Record your notices',
  CHECK_AND_SUBMIT: 'Check and submit your application',
} as const;

export const CPO_TASK_SECTIONS: readonly CpoTaskSection[] = [
  {
    title: 'Applicant details',
    tasks: [
      { subsection: CPO_SUBSECTIONS.APPLICANT_DETAILS, label: 'Applicant details', slug: 'applicant-details' },
      { subsection: CPO_SUBSECTIONS.CHECK_APPLICANT_CONTACT_DETAILS, label: 'Check applicant details', slug: 'network-operator-contact-details' },
      { subsection: CPO_SUBSECTIONS.PRE_SUBMISSION_MEETING, label: 'Pre-application meeting', slug: 'pre-submission-meeting' },
    ],
  },
  {
    title: 'About the order',
    tasks: [
      { subsection: CPO_SUBSECTIONS.ORDER_DETAILS, label: 'Order details', slug: 'order-details' },
      { subsection: CPO_SUBSECTIONS.EXECUTIVE_SUMMARY, label: 'Executive summary', slug: 'order-details/executive-summary' },
      { subsection: CPO_SUBSECTIONS.ORDER_DOCUMENTS, label: 'Order documents', slug: 'order-documents' },
    ],
  },
  {
    title: 'Public notices',
    tasks: [
      { subsection: CPO_SUBSECTIONS.RECORD_NOTICES, label: 'Record your notices', slug: 'record-notices' },
    ],
  },
  {
    title: 'Check and submit',
    tasks: [
      { subsection: CPO_SUBSECTIONS.CHECK_AND_SUBMIT, label: 'Check and submit your application', slug: 'check-and-submit' },
    ],
  },
] as const;

export const CPO_TASK_COUNT = CPO_TASK_SECTIONS.reduce(
  (count, section) => count + section.tasks.length,
  0
);
