import { describe, expect, it } from 'vitest';
import { ROLES } from '../constants/roles';
import {
  formatUserRoleLabel,
  DESNZ_CASEWORKER,
  APPLICANT_FINANCE,
  BUSINESS_ADMIN,
  CONSULTANT,
  REVIEWER,
} from './roleUtils';

describe('formatUserRoleLabel', () => {
  it('formats the DNO Team Coordinator label consistently', () => {
    expect(formatUserRoleLabel(ROLES.APPLICANT_TEAM_COORDINATOR)).toBe('DNO Team Coordinator');
  });

  it('keeps the other role labels aligned with the admin UI', () => {
    expect(formatUserRoleLabel(ROLES.DESNZ_ADMIN)).toBe('DESNZ Admin');
    expect(formatUserRoleLabel(ROLES.TECH_ADMIN)).toBe('Tech Admin');
    expect(formatUserRoleLabel(ROLES.APPLICANT_AGENT)).toBe('Applicant agent');
    expect(formatUserRoleLabel(ROLES.APPLICANT)).toBe('Applicant');
  });

  it('formats the remaining known roles from roleUtils', () => {
    expect(formatUserRoleLabel(DESNZ_CASEWORKER)).toBe('DESNZ Caseworker');
    expect(formatUserRoleLabel(APPLICANT_FINANCE)).toBe('Applicant finance');
    expect(formatUserRoleLabel(BUSINESS_ADMIN)).toBe('Business Admin');
    expect(formatUserRoleLabel(CONSULTANT)).toBe('Consultant');
    expect(formatUserRoleLabel(REVIEWER)).toBe('Reviewer');
  });

  it('falls back to "Applicant" when no role is provided', () => {
    expect(formatUserRoleLabel(undefined)).toBe('Applicant');
  });

  it('falls back to the raw role code for unknown roles', () => {
    expect(formatUserRoleLabel('SOME_UNKNOWN_ROLE')).toBe('SOME_UNKNOWN_ROLE');
  });
});
