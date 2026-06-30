import { describe, expect, it } from 'vitest';
import {
  clearKeyedErrors,
  clearObjectFieldErrors,
  clearRecordFieldErrors,
  filterErrorLinksByAnchors,
  getRelatedFieldAnchorIds,
} from './formValidationHelpers';

describe('formValidationHelpers', () => {
  it('returns related anchor ids for inputValue fields', () => {
    expect(getRelatedFieldAnchorIds('hasRelatedCpo-inputValue')).toEqual([
      'hasRelatedCpo-inputValue',
      'hasRelatedCpo',
    ]);
  });

  it('returns related anchor ids for base fields', () => {
    expect(getRelatedFieldAnchorIds('areWorkStartDatesKnown')).toEqual([
      'areWorkStartDatesKnown',
      'areWorkStartDatesKnown-inputValue',
    ]);
  });

  it('filters error summary links by anchor ids', () => {
    const errors = [
      '<a href="#hasRelatedCpo">Select \'Yes\' or \'No\'</a>',
      '<a href="#projectName-inputValue">Enter a project name</a>',
    ];

    expect(filterErrorLinksByAnchors(errors, ['hasRelatedCpo-inputValue', 'hasRelatedCpo'])).toEqual([
      '<a href="#projectName-inputValue">Enter a project name</a>',
    ]);
  });

  it('clears keyed validation errors', () => {
    const errors = [
      { key: 'wayleaves', message: 'Select yes or no' },
      { key: 'regulations', message: 'Confirm regulations' },
    ];

    expect(clearKeyedErrors(errors, ['wayleaves'])).toEqual([
      { key: 'regulations', message: 'Confirm regulations' },
    ]);
  });

  it('clears record field errors without creating a new object when unchanged', () => {
    const prev: Record<string, string> = { addingOrReplacingPoles: 'Select yes or no' };
    expect(clearRecordFieldErrors(prev, ['addingOrReplacingPoles'])).toEqual({});
    expect(clearRecordFieldErrors(prev, ['estimatedDuration'])).toBe(prev);
  });

  it('clears object field errors', () => {
    const prev: Record<string, string | undefined> = { reason: 'Select a reason', comments: 'Too long' };
    expect(clearObjectFieldErrors(prev, 'reason')).toEqual({ comments: 'Too long' });
    expect(clearObjectFieldErrors(prev, 'confirmation')).toBe(prev);
  });
});
