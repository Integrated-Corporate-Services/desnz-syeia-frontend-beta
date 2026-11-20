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
  // Shown when a full EIA has no report but consultations have already started (SYEIA-1485 recovery).
  REPORT_MISSING_AFTER_CONSULTATION: 'You chose a full EIA but have not uploaded your EIA report. You need to upload it before you can submit this application.',
  // Shown when the report was uploaded but saving the answer failed, so the EIA section is not complete yet.
  REPORT_NOT_SAVED_AFTER_CONSULTATION: 'Your EIA report has been uploaded, but this section has not been saved. Select Save and continue to complete it.',
  FINISH_SAVING_REPORT: 'Finish saving your EIA report',
  SUMMARY_ASSESSMENT: 'EIA assessment',
  SUMMARY_REPORT: 'EIA report',
};

export const EIA_REPORT_MAX_FILES = 1;
