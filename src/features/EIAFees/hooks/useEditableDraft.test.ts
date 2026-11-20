import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditableDraft } from './useEditableDraft';

const getApplicationById = vi.fn();
vi.mock('../../../services/applicationApiService', () => ({ applicationApiService: { getApplicationById: (id: string) => getApplicationById(id) } }));
vi.mock('../../../logger', () => ({ default: { error: vi.fn() } }));

describe('useEditableDraft (SYEIA-1485)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not ask until it is needed', () => {
    const { result } = renderHook(() => useEditableDraft('app-1', false));
    expect(result.current).toBe('idle');
    expect(getApplicationById).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: 'DRAFT', permissions: { canEdit: true } }, 'editable'],
    [{ status: 'SUBMITTED', permissions: { canEdit: false } }, 'locked'],
    [{ status: 'DRAFT', permissions: { canEdit: false } }, 'locked'],
  ])('maps %o to %s', async (application, expected) => {
    getApplicationById.mockResolvedValue(application);
    const { result } = renderHook(() => useEditableDraft('app-1', true));
    await waitFor(() => expect(result.current).toBe(expected));
  });

  it('treats a failed lookup as locked', async () => {
    getApplicationById.mockRejectedValue(new Error('500'));
    const { result } = renderHook(() => useEditableDraft('app-1', true));
    await waitFor(() => expect(result.current).toBe('locked'));
  });
});
