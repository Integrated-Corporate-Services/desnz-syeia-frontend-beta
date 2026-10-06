export const CPO_SUBSECTIONS = {
  APPLICANT_DETAILS: 'Applicant details',
  PRE_SUBMISSION_MEETING: 'Pre-submission meeting',
  ORDER_DETAILS: 'Order details',
  ORDER_DOCUMENTS: 'Order documents',
  NOTICE_REQUIREMENTS: 'What your notices must include',
  RECORD_NOTICES: 'Record your notices',
  CHECK_AND_SUBMIT: 'Check and submit your application',
} as const;

type CpoTask = {
  readonly subsection: (typeof CPO_SUBSECTIONS)[keyof typeof CPO_SUBSECTIONS];
  readonly label: string;
  readonly slug: string;
};

type CpoTaskSection = {
  readonly title: string;
  readonly tasks: readonly CpoTask[];
};

export const CPO_TASK_SECTIONS: readonly CpoTaskSection[] = [
  {
    title: 'Applicant details',
    tasks: [
      { subsection: CPO_SUBSECTIONS.APPLICANT_DETAILS, label: 'Applicant details', slug: 'applicant-details' },
      { subsection: CPO_SUBSECTIONS.PRE_SUBMISSION_MEETING, label: 'Pre-submission meeting', slug: 'pre-submission-meeting' },
    ],
  },
  {
    title: 'About the order',
    tasks: [
      { subsection: CPO_SUBSECTIONS.ORDER_DETAILS, label: 'Order details', slug: 'order-details' },
      { subsection: CPO_SUBSECTIONS.ORDER_DOCUMENTS, label: 'Order documents', slug: 'order-documents' },
    ],
  },
  {
    title: 'Public notices',
    tasks: [
      { subsection: CPO_SUBSECTIONS.NOTICE_REQUIREMENTS, label: 'What your notices must include', slug: 'notice-requirements' },
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
