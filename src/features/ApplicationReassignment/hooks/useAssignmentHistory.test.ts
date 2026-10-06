import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from '../../../services/applicationApiService';
import { useAssignmentHistory } from './useAssignmentHistory';
import type { AssignmentDetails } from '../types/applicationReassignment';

vi.mock('../../../services/applicationApiService', () => ({
    applicationApiService: { getAssignmentHistory: vi.fn() },
}));

describe('assignment history loading', () => {
    beforeEach(() => vi.clearAllMocks());

    it('ignores the previous application response after navigation', async () => {
        let resolvePrevious!: (details: AssignmentDetails) => void;
        vi.mocked(applicationApiService.getAssignmentHistory).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolvePrevious = resolve;
                })
        );
        const current: AssignmentDetails = {
            application_reference: 'S3700002',
            current_assignee_name: 'Current contact',
            history: [],
        };
        vi.mocked(applicationApiService.getAssignmentHistory).mockResolvedValueOnce(current);
        const { result, rerender } = renderHook(({ id }) => useAssignmentHistory(id), {
            initialProps: { id: 'previous' },
        });
        expect(result.current.loading).toBe(true);
        rerender({ id: 'current' });
        await waitFor(() => expect(result.current.details).toEqual(current));
        await act(async () =>
            resolvePrevious({
                application_reference: 'S3700001',
                current_assignee_name: 'Old contact',
                history: [],
            })
        );
        expect(result.current.details).toEqual(current);
    });

    it('distinguishes a failed lookup from an unassigned application', async () => {
        vi.mocked(applicationApiService.getAssignmentHistory).mockRejectedValueOnce(
            new Error('Service unavailable')
        );
        const { result } = renderHook(() => useAssignmentHistory('application'));
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.details).toBeNull();
        expect(result.current.error).toContain('Unable to load reassignment history');
    });
});
