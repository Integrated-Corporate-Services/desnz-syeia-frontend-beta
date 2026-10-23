import { describe, expect, it } from 'vitest';
import { formatDateAtTime } from './formatters';

const at = (hours: number, minutes: number) => new Date(2026, 9, 19, hours, minutes).toISOString();

describe('formatDateAtTime', () => {
  it('formats a morning time without a leading zero on the hour', () => {
    expect(formatDateAtTime(at(9, 7))).toBe('19 October 2026 at 9:07am');
    expect(formatDateAtTime(at(11, 55))).toBe('19 October 2026 at 11:55am');
  });

  it('formats an afternoon time on the 12-hour clock', () => {
    expect(formatDateAtTime(at(15, 30))).toBe('19 October 2026 at 3:30pm');
  });

  it('formats noon as 12:00pm', () => {
    expect(formatDateAtTime(at(12, 0))).toBe('19 October 2026 at 12:00pm');
  });

  it('formats just after midnight as 12:05am', () => {
    expect(formatDateAtTime(at(0, 5))).toBe('19 October 2026 at 12:05am');
  });
});