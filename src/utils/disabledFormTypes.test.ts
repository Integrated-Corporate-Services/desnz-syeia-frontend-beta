import { describe, it, expect, vi, beforeEach } from 'vitest';

const getRuntimeEnv = vi.fn();
vi.mock('../config/runtimeEnv', () => ({
  getRuntimeEnv: (...args: unknown[]) => getRuntimeEnv(...args),
}));

import {
  getDisabledFormTypes,
  isFirFeatureDisabled,
  isNotificationsFeatureDisabled,
  isReassignmentFeatureDisabled,
} from './disabledFormTypes';

describe('disabledFormTypes', () => {
  beforeEach(() => getRuntimeEnv.mockReset());

  it('returns empty list when unset', () => {
    getRuntimeEnv.mockReturnValue('');
    expect(getDisabledFormTypes()).toEqual([]);
    expect(isNotificationsFeatureDisabled()).toBe(false);
  });

  it('detects notifications flag among others, case/space insensitive', () => {
    getRuntimeEnv.mockReturnValue('fir, Notifications');
    expect(isNotificationsFeatureDisabled()).toBe(true);
    expect(isFirFeatureDisabled()).toBe(true);
  });

  it('does not disable notifications for unrelated types', () => {
    getRuntimeEnv.mockReturnValue('fir');
    expect(isNotificationsFeatureDisabled()).toBe(false);
  });

  it('detects the reassignment flag only when listed', () => {
    getRuntimeEnv.mockReturnValue('your-details,reassignment');
    expect(isReassignmentFeatureDisabled()).toBe(true);
    getRuntimeEnv.mockReturnValue('fir');
    expect(isReassignmentFeatureDisabled()).toBe(false);
  });
});
