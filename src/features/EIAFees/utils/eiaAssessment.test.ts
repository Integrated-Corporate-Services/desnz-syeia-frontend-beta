import { describe, expect, it } from 'vitest';
import { getEiaAssessment, toEiaAnswers } from './eiaAssessment';
import { EIA_ASSESSMENT } from '../constants/eiaAssessment';
import { validateAssessment, validateEiaReport } from '../validations';
import { MANDATORY_SCREENING_OPTIONS } from '../constants/eiaAssessment';

describe('EIA assessment mapping (SYEIA-1485)', () => {
  it.each([
    [EIA_ASSESSMENT.NONE, { isEiaDevelopment: false, screeningOnly: false }],
    [EIA_ASSESSMENT.SCREENING, { isEiaDevelopment: true, screeningOnly: false }],
    [EIA_ASSESSMENT.FULL_EIA, { isEiaDevelopment: true, screeningOnly: true }],
  ])('%s is stored in the two existing answers and read back', (option, answers) => {
    expect(toEiaAnswers(option)).toEqual(answers);
    expect(getEiaAssessment(answers.isEiaDevelopment, answers.screeningOnly)).toBe(option);
  });

  it('has no option before the question is answered', () => {
    expect(getEiaAssessment(undefined, undefined)).toBeNull();
  });
});

describe('EIA validation', () => {
  it('asks for an option, and rejects one the page does not offer', () => {
    expect(validateAssessment('', MANDATORY_SCREENING_OPTIONS)[0].message).toBe('Select an assessment option');
    expect(validateAssessment(EIA_ASSESSMENT.NONE, MANDATORY_SCREENING_OPTIONS)).toHaveLength(1);
    expect(validateAssessment(EIA_ASSESSMENT.SCREENING, MANDATORY_SCREENING_OPTIONS)).toEqual([]);
  });

  it('asks for a report file', () => {
    expect(validateEiaReport(0)[0].message).toBe('Select a file to upload');
    expect(validateEiaReport(1)).toEqual([]);
  });
});
