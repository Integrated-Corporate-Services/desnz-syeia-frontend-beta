import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Application } from '../../../types/application';
import { useApplicationDashboardFilters } from './useApplicationDashboardFilters';

const currentUserId = 'current-user';

function application(overrides: Partial<Application> = {}): Application {
  return {
    application_id: 'application-id',
    type: 'S37',
    desnz_ref: 'S3700001',
    status: 'DRAFT',
    created_by: 'original-creator',
    created_at: '2026-10-16',
    submitted_at: '',
    ...overrides,
  };
}

describe('dashboard assignment visibility', () => {
  it.each(['APPLICANT_USER', 'APPLICANT_AGENT'] as const)(
    'shows reassigned applications and tab counts for %s after login',
    (role) => {
      const assigned = application({ assigned_to: currentUserId });
      const { result } = renderHook(() =>
        useApplicationDashboardFilters([assigned], currentUserId, role),
      );

      expect(result.current.submittedBy).toBe('me');
      expect(result.current.filteredApplications).toEqual([assigned]);
      expect(result.current.tabCounts.draft).toBe(1);

      act(() => result.current.setActiveTab('active'));
      expect(result.current.filteredApplications).toEqual([]);
    },
  );

  it('excludes applications reassigned away even when created by the current user', () => {
    const reassigned = application({ created_by: currentUserId, assigned_to: 'other-user' });
    const { result } = renderHook(() =>
      useApplicationDashboardFilters([reassigned], currentUserId, 'APPLICANT_USER'),
    );

    expect(result.current.filteredApplications).toEqual([]);
    expect(result.current.tabCounts.draft).toBe(0);
  });

  it.each([undefined, null])('falls back to the creator for legacy assignment %s', (assignedTo) => {
    const legacy = application({ created_by: currentUserId, assigned_to: assignedTo });
    const { result } = renderHook(() =>
      useApplicationDashboardFilters([legacy], currentUserId, 'APPLICANT_USER'),
    );

    expect(result.current.filteredApplications).toEqual([legacy]);
  });

  it('retains organisation-wide visibility when all is selected', () => {
    const other = application({ assigned_to: 'other-user' });
    const { result } = renderHook(() =>
      useApplicationDashboardFilters([other], currentUserId, 'APPLICANT_TEAM_COORDINATOR'),
    );

    expect(result.current.submittedBy).toBe('all');
    expect(result.current.filteredApplications).toEqual([other]);
    act(() => result.current.setSubmittedBy('me'));
    expect(result.current.filteredApplications).toEqual([]);
  });
});