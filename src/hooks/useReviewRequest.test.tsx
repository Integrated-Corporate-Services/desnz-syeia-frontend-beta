import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReviewRequest } from './useReviewRequest';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn(), isAxiosError: vi.fn(() => false) } }));
const data = {
  access_request_id: 'shared-request', organisation_id: 'org-b', organisation_name: 'Organisation B',
  first_name: 'Test', last_name: 'Agent', email: 'agent@example.test', is_agent: true,
  status: 'PENDING', requested_at: '2026-10-20',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(axios.get).mockResolvedValue({ data });
  vi.mocked(axios.post).mockResolvedValue({ data: { message: 'Success' } });
});

describe('reviewing one organisation', () => {
  it('sends the selected organisation when loading, approving and rejecting', async () => {
    const { result } = renderHook(() => useReviewRequest('shared-request', 'org-b'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(axios.get).toHaveBeenCalledWith('/api/access-requests/shared-request', { params: { organisationId: 'org-b' } });
    expect(result.current.requestData?.organisation_name).toBe('Organisation B');

    await act(async () => { await result.current.approveRequest(); });
    expect(axios.post).toHaveBeenCalledWith('/api/access-requests/shared-request/approve', undefined, { params: { organisationId: 'org-b' } });

    act(() => result.current.updateRejectReason('Not known to this organisation'));
    await act(async () => { await result.current.rejectRequest(); });
    expect(axios.post).toHaveBeenCalledWith('/api/access-requests/shared-request/reject',
      { reason: 'Not known to this organisation' }, { params: { organisationId: 'org-b' } });
  });

  it('uses the scoped organisation returned for a coordinator opening an existing notification link', async () => {
    const { result } = renderHook(() => useReviewRequest('shared-request'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.approveRequest(); });
    expect(axios.post).toHaveBeenCalledWith('/api/access-requests/shared-request/approve', undefined, { params: { organisationId: 'org-b' } });
  });

  it('cannot approve if no organisation details were loaded', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('Select an organisation'));
    const { result } = renderHook(() => useReviewRequest('shared-request'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.approveRequest(); });
    expect(axios.post).not.toHaveBeenCalled();
    expect(result.current.errors[0].message).toContain('Select an organisation');
  });

  it('reloads the details when switching organisations under the same request', async () => {
    const { result, rerender } = renderHook(({ org }) => useReviewRequest('shared-request', org), { initialProps: { org: 'org-b' } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(axios.get).mockResolvedValue({ data: { ...data, organisation_id: 'org-c', organisation_name: 'Organisation C' } });
    rerender({ org: 'org-c' });
    await waitFor(() => expect(result.current.requestData?.organisation_id).toBe('org-c'));
    await act(async () => { await result.current.approveRequest(); });
    expect(axios.post).toHaveBeenLastCalledWith('/api/access-requests/shared-request/approve', undefined, { params: { organisationId: 'org-c' } });
  });

  it('ignores a late response from the previously selected organisation', async () => {
    let resolveOld!: (response: { data: typeof data }) => void;
    vi.mocked(axios.get).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
    const { result, rerender } = renderHook(({ org }) => useReviewRequest('shared-request', org), { initialProps: { org: 'org-a' } });
    rerender({ org: 'org-b' });
    await waitFor(() => expect(result.current.requestData?.organisation_id).toBe('org-b'));
    await act(async () => {
      resolveOld({ data: { ...data, organisation_id: 'org-a', organisation_name: 'Organisation A' } });
    });
    expect(result.current.requestData?.organisation_id).toBe('org-b');
  });

});
