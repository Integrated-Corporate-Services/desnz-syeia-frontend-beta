import { describe, expect, it } from 'vitest';
import { formatNotificationDate } from './formatNotificationDate';

// Built from local dates, so the expectations hold in any timezone.
const local = (...parts: [number, number, number, number, number]) => new Date(...parts).toISOString();

describe('formatNotificationDate', () => {
  it('uses the GOV.UK style from the design', () => {
    expect(formatNotificationDate(local(2026, 5, 30, 9, 0))).toBe('30 June 2026 at 9:00am');
    expect(formatNotificationDate(local(2026, 5, 9, 15, 48))).toBe('9 June 2026 at 3:48pm');
  });

  it('shows midnight and midday as 12', () => {
    expect(formatNotificationDate(local(2026, 8, 1, 0, 5))).toBe('1 September 2026 at 12:05am');
    expect(formatNotificationDate(local(2026, 8, 1, 12, 0))).toBe('1 September 2026 at 12:00pm');
  });
});
