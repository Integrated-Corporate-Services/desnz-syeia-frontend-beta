import { describe, expect, it } from 'vitest';
import { formatApplicantType, formatLastLogin, formatLastLoginDate } from './userDetails';

// Built from local parts so the expected text does not depend on the machine's time zone.
const local = (y: number, m: number, d: number, h: number, min: number) => new Date(y, m, d, h, min).toISOString();

describe('formatLastLogin (SYEIA-2168 AC2, 2170 AC6, 2171 AC1, 2182 AC1)', () => {
  it.each([
    [local(2026, 1, 22, 10, 32), '22 February 2026 at 10:32am'],
    [local(2026, 9, 9, 14, 20), '9 October 2026 at 2:20pm'],
    [local(2026, 0, 1, 0, 5), '1 January 2026 at 12:05am'],
    [local(2026, 0, 1, 12, 0), '1 January 2026 at 12:00pm'],
  ])('formats %s as "%s"', (value, expected) => {
    expect(formatLastLogin(value)).toBe(expected);
  });

  it('shows "Never" when the user has not signed in', () => {
    expect(formatLastLogin(null)).toBe('Never');
  });
});

describe('formatLastLoginDate (SYEIA-2168 AC2, Active users list)', () => {
  it.each([
    [local(2025, 1, 22, 10, 32), '22 February 2025'],
    [local(2025, 2, 5, 14, 20), '05 March 2025'],
    [local(2025, 3, 2, 0, 5), '02 April 2025'],
  ])('formats %s as "%s", with no time', (value, expected) => {
    expect(formatLastLoginDate(value)).toBe(expected);
  });

  it('shows "Never" when the user has not signed in', () => {
    expect(formatLastLoginDate(null)).toBe('Never');
  });
});

describe('formatApplicantType (SYEIA-2170 AC1, 2171 AC1)', () => {
  it.each([
    [{ isAgent: true, role: 'APPLICANT_USER' }, 'Agent'],
    [{ isAgent: false, role: 'APPLICANT_AGENT' }, 'Agent'],
    [{ isAgent: false, role: 'APPLICANT_USER' }, 'Employee'],
    [{ role: 'APPLICANT_TEAM_COORDINATOR' }, 'Employee'],
  ])('%o is shown as %s', (user, expected) => {
    expect(formatApplicantType(user)).toBe(expected);
  });
});
