export const FIR_CATEGORY_LABELS: Record<string, string> = {
  FIR_PLAN_INFORMATION: 'Plan information',
  FIR_ENVIRONMENTAL_AND_ARCHAEOLOGICAL: 'Environmental and archaeological',
  FIR_SUPPORTING_DOCUMENTS: 'Supporting documents',
  FIR_NWL_NOTICE_TO_REMOVE: 'Notice to Remove',
  FIR_NWL_EXPIRED_WAYLEAVE: 'Expired wayleave',
  FIR_NWL_TERMINATED_WAYLEAVE: 'Terminated wayleave',
  FIR_NWL_NOTICE_TO_TERMINATE: 'Notice to Terminate',
  FIR_NWL_WAYLEAVE_NOTICE: 'Wayleave notice',
  FIR_NWL_LAND_REGISTRY: 'Land registry',
  FIR_NWL_SITE_INFORMATION: 'Site information',
  FIR_NWL_UNREGISTERED_LAND: 'Unregistered land details',
  FIR_NWL_APPLICATION_PLAN: 'Application plan',
  FIR_NWL_EVIDENCE_OF_NEGOTIATIONS: 'Evidence of negotiations',
  FIR_NWL_ADDITIONAL_DOCUMENTS: 'Additional documents',
};

export const S37_FIR_CATEGORY_GROUPS: Array<{ heading?: string; categories: string[] }> = [
  {
    categories: [
      'FIR_PLAN_INFORMATION',
      'FIR_ENVIRONMENTAL_AND_ARCHAEOLOGICAL',
      'FIR_SUPPORTING_DOCUMENTS',
    ],
  },
];

export const NWL_FIR_CATEGORY_GROUPS: Array<{ heading: string; categories: string[] }> = [
  {
    heading: 'Application details',
    categories: [
      'FIR_NWL_NOTICE_TO_REMOVE',
      'FIR_NWL_EXPIRED_WAYLEAVE',
      'FIR_NWL_TERMINATED_WAYLEAVE',
      'FIR_NWL_NOTICE_TO_TERMINATE',
      'FIR_NWL_WAYLEAVE_NOTICE',
    ],
  },
  {
    heading: 'Land details',
    categories: [
      'FIR_NWL_LAND_REGISTRY',
      'FIR_NWL_SITE_INFORMATION',
      'FIR_NWL_UNREGISTERED_LAND',
    ],
  },
  { heading: 'Assets', categories: ['FIR_NWL_APPLICATION_PLAN'] },
  { heading: 'Negotiations', categories: ['FIR_NWL_EVIDENCE_OF_NEGOTIATIONS'] },
  { heading: 'Additional information', categories: ['FIR_NWL_ADDITIONAL_DOCUMENTS'] },
];

export const FIR_CATEGORY_GROUPS = [
  ...S37_FIR_CATEGORY_GROUPS,
  ...NWL_FIR_CATEGORY_GROUPS,
];

export const FIR_MESSAGES = {
  REQUEST_LOAD_FAILED: 'The further information request could not be loaded.',
  UPLOAD_CHOICE_REQUIRED: 'Select whether you are uploading documents.',
  DOCUMENT_TYPE_REQUIRED: 'Select at least one type of document.',
  RESPONSE_REQUIRED: 'Provide information or upload a document.',
  RESPONSE_FAILED: 'The information could not be submitted. Try again shortly.',
} as const;
