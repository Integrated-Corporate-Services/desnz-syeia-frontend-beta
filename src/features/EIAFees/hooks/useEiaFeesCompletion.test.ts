import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEiaFeesCompletion } from './useEiaFeesCompletion';
import { progressApiService } from '../../../services/progressApiService';

vi.mock('../../../services/progressApiService', () => ({ progressApiService: { fetchApplicationProgress: vi.fn() } }));
vi.mock('../../../logger', () => ({ default: { error: vi.fn() } }));
const fetchProgress = vi.mocked(progressApiService.fetchApplicationProgress);

describe('useEiaFeesCompletion (SYEIA-1485)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not ask when it is not needed', () => {
    const { result } = renderHook(() => useEiaFeesCompletion('app-1', false));
    expect(result.current).toBe('idle');
    expect(fetchProgress).not.toHaveBeenCalled();
  });

  it.each([
    ['complete', 'Completed'],
    ['incomplete', 'In Progress'],
  ])('is %s when the EIA fees task is %s', async (expected, status) => {
    fetchProgress.mockResolvedValue([{ subsection_name: 'Route', status: 'Completed' }, { subsection_name: 'EIA fees', status }]);
    const { result } = renderHook(() => useEiaFeesCompletion('app-1', true));
    await waitFor(() => expect(result.current).toBe(expected));
    expect(fetchProgress).toHaveBeenCalledWith('app-1');
  });

  it('is incomplete when the EIA fees task has no progress yet', async () => {
    fetchProgress.mockResolvedValue([]);
    const { result } = renderHook(() => useEiaFeesCompletion('app-1', true));
    await waitFor(() => expect(result.current).toBe('incomplete'));
  });

  it('counts a failed lookup as complete, so the pages stay read-only', async () => {
    fetchProgress.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useEiaFeesCompletion('app-1', true));
    await waitFor(() => expect(result.current).toBe('complete'));
  });
});
