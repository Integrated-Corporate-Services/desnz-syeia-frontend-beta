import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import accessRequestAdminService from '../services/accessRequestAdminService';
import userService from '../services/userService';
import { useDashboard } from './useDashboard';

vi.mock('../services/accessRequestAdminService', () => ({ default: { getPendingRequests: vi.fn() } }));
vi.mock('../services/userService', () => ({ default: { getUsers: vi.fn() } }));

const request = (id: string, first_name: string, last_name: string, requested_at: string, status = 'PENDING') => ({
  access_request_id: id, first_name, last_name, email: `${id}@example.test`, organisation_id: `org-${id}`,
  is_agent: false, requested_at, status,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(userService.getUsers).mockResolvedValue({ success: true, data: [] } as never);
  vi.mocked(accessRequestAdminService.getPendingRequests).mockResolvedValue({
    success: true,
    data: [
      request('1', 'Zara', 'Young', '2026-10-25'),
      request('2', 'adam', 'Smith', '2026-10-01'),
      request('3', 'Mark', 'Brown', '2026-10-28'),
      request('4', 'Adam', 'Jones', '2026-10-10'),
      request('5', 'Aaron', 'Approved', '2026-10-27', 'APPROVED'),
    ],
  });
});

describe('useDashboard access request order', () => {
  it('lists pending access requests alphabetically by name, ignoring case', async () => {
    const { result } = renderHook(() => useDashboard('SUPERUSER'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.pendingRequests.map((r) => `${r.first_name} ${r.last_name}`))
      .toEqual(['Adam Jones', 'adam Smith', 'Mark Brown', 'Zara Young']);
  });

  it('keeps the name order when recent requests are worked out by date', async () => {
    const { result, rerender } = renderHook(() => useDashboard('APPLICANT_TEAM_COORDINATOR'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.recentRequests.map((r) => r.access_request_id)).toEqual(['3', '1', '4', '2']);
    rerender();
    expect(result.current.pendingRequests.map((r) => r.access_request_id)).toEqual(['4', '2', '3', '1']);
  });
});