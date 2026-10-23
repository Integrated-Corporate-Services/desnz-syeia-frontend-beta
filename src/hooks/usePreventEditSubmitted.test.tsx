import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useApplicationReadOnly } from './usePreventEditSubmitted';
import { ROLES } from '../constants/roles';
import type { Application } from '../types/application';
import type { AuthUser } from '../types/auth';

describe('useApplicationReadOnly', () => {
  it.each([
    [ROLES.SUPERUSER, 'draft', true],
    [ROLES.SUPERUSER, 'submitted', true],
    [ROLES.APPLICANT_USER, 'draft', false],
    [ROLES.APPLICANT_USER, 'submitted', true],
  ])('handles role %s and status %s (read-only %s)', (role, status, expected) => {
    const application = { status } as Application;
    const user: AuthUser = { user_id: 'user-1', email: 'user@example.test', role };
    const { result } = renderHook(() => useApplicationReadOnly(application, user));
    expect(result.current).toBe(expected);
  });

  it('keeps Superusers read-only before application data loads', () => {
    const user: AuthUser = { user_id: 'user-1', email: 'user@example.test', role: ROLES.SUPERUSER };
    const { result } = renderHook(() => useApplicationReadOnly(undefined, user));
    expect(result.current).toBe(true);
  });
});