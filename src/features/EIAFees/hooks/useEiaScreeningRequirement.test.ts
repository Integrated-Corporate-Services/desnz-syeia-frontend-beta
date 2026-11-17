import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEiaScreeningRequirement } from './useEiaScreeningRequirement';

const fetchEiaScreeningRequirement = vi.fn();
vi.mock('../../../services/eiafeesservice', () => ({
  fetchEiaScreeningRequirement: (id: string) => fetchEiaScreeningRequirement(id),
}));
vi.mock('../../../logger', () => ({ default: { error: vi.fn() } }));

describe('useEiaScreeningRequirement (SYEIA-1485)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reports mandatory screening for 132kV or a sensitive area', async () => {
    fetchEiaScreeningRequirement.mockResolvedValue({ highVoltage: true, sensitiveArea: false });
    const { result } = renderHook(() => useEiaScreeningRequirement('app-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ failed: false, mandatory: true, highVoltage: true, sensitiveArea: false });
  });

  it('keeps the requirement unknown when the lookup fails, and loads it on retry', async () => {
    fetchEiaScreeningRequirement.mockRejectedValueOnce(new Error('500'));
    const { result } = renderHook(() => useEiaScreeningRequirement('app-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ failed: true, mandatory: false });

    fetchEiaScreeningRequirement.mockResolvedValueOnce({ highVoltage: false, sensitiveArea: true });
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.failed).toBe(false));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ mandatory: true, sensitiveArea: true });
    expect(fetchEiaScreeningRequirement).toHaveBeenCalledTimes(2);
  });
});
