import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useConsultationDetails } from './useConsultationDetails';

const fetchConsultationDetails = vi.fn();
vi.mock('../services/consultationService', () => ({
  fetchConsultationDetails: (appId: string, userId: string) => fetchConsultationDetails(appId, userId),
}));
vi.mock('../logger', () => ({ default: { debug: vi.fn(), error: vi.fn() } }));

describe('useConsultationDetails checked flag', () => {
  it('is false until the fetch for this application and user has finished', async () => {
    fetchConsultationDetails.mockResolvedValue([{ status: 'Closed' }]);
    const { result } = renderHook(() => useConsultationDetails('app-1', 'user-1'));
    expect(result.current.checked).toBe(false);
    await waitFor(() => expect(result.current.checked).toBe(true));
    expect(result.current.consultations).toHaveLength(1);
  });

  it('stays false with the error when the fetch fails, and becomes true after a successful refetch', async () => {
    fetchConsultationDetails.mockRejectedValueOnce(new Error('Failed to fetch consultation details'));
    const { result } = renderHook(() => useConsultationDetails('app-2', 'user-1'));
    await waitFor(() => expect(result.current.error).toBe('Failed to fetch consultation details'));
    expect(result.current.loading).toBe(false);
    expect(result.current.checked).toBe(false);
    fetchConsultationDetails.mockResolvedValueOnce([]);
    await act(() => result.current.refetch());
    expect(result.current.checked).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('stays false while there is no user yet', () => {
    const { result } = renderHook(() => useConsultationDetails('app-1', undefined));
    expect(result.current.checked).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});
