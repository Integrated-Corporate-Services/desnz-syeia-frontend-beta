// SYEIA-1485: EIA assessment options and page content.
export const EIA_ASSESSMENT = {
  NONE: 'NONE',
  SCREENING: 'SCREENING',
  FULL_EIA: 'FULL_EIA',
} as const;

export type EiaAssessment = (typeof EIA_ASSESSMENT)[keyof typeof EIA_ASSESSMENT];

export const EIA_ASSESSMENT_LABELS: Record<EiaAssessment, string> = {
  NONE: 'No assessment required',
  SCREENING: 'EIA screening',
  FULL_EIA: 'Full EIA',
};

// Policy set the order: by cost when screening is optional; the option to consider first when it is mandatory.
export const OPTIONAL_SCREENING_OPTIONS: EiaAssessment[] = [EIA_ASSESSMENT.NONE, EIA_ASSESSMENT.SCREENING, EIA_ASSESSMENT.FULL_EIA];
export const MANDATORY_SCREENING_OPTIONS: EiaAssessment[] = [EIA_ASSESSMENT.FULL_EIA, EIA_ASSESSMENT.SCREENING];

export const EIA_LINKS = {
  EIA_REPORT: 'https://www.legislation.gov.uk/uksi/2017/580/regulation/17',
  FEE: 'https://www.gov.uk/guidance/overhead-lines-applying-for-consent#fees',
  MANDATORY_SCREENING: 'https://www.legislation.gov.uk/uksi/2017/580/schedule/2',
};

export const EIA_CONTENT = {
  PAGE_TITLE: 'Environmental Impact Assessment (EIA)',
  BREADCRUMB: 'EIA',
  QUESTION: 'Select an assessment option',
  UPLOAD_TITLE: 'Upload your EIA report',
  SUMMARY_ASSESSMENT: 'EIA assessment',
  SUMMARY_REPORT: 'EIA report',
};

export const EIA_REPORT_MAX_FILES = 1;
