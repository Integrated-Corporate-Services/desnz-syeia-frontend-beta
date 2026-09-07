import { describe, expect, it } from 'vitest';
import { ROLES } from '../constants/roles';
import { formatUserRoleLabel } from './roleUtils';

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
});
