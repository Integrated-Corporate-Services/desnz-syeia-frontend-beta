import { EIA_ASSESSMENT, type EiaAssessment } from '../constants/eiaAssessment';

// The option is stored in the existing two answers so the Salesforce payload is unchanged (SYEIA-2619 moves it):
// No assessment = false/false, EIA screening = true/false, Full EIA = true/true.
export function getEiaAssessment(isEiaDevelopment?: boolean | null, screeningOnly?: boolean | null): EiaAssessment | null {
  if (isEiaDevelopment === true) return screeningOnly === true ? EIA_ASSESSMENT.FULL_EIA : EIA_ASSESSMENT.SCREENING;
  if (isEiaDevelopment === false) return EIA_ASSESSMENT.NONE;
  return null;
}

// A full EIA is not complete until its report has been uploaded (the upload page's required-file rule).
export function isEiaReportMissing(isEiaDevelopment: boolean | null | undefined, screeningOnly: boolean | null | undefined, reportCount: number): boolean {
  return getEiaAssessment(isEiaDevelopment, screeningOnly) === EIA_ASSESSMENT.FULL_EIA && reportCount === 0;
}

export function toEiaAnswers(assessment: EiaAssessment): { isEiaDevelopment: boolean; screeningOnly: boolean } {
  return {
    isEiaDevelopment: assessment !== EIA_ASSESSMENT.NONE,
    screeningOnly: assessment === EIA_ASSESSMENT.FULL_EIA,
  };
}
