import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';
import { useContactDetailsSubmit } from './useContactDetailsSubmit';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...await vi.importActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => navigate,
}));
const setError = vi.fn();
const application = { application_id: 'app', type: 'CPO', operator_ref: 'ref' } as any;
const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe('CPO applicant contact confirmation', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks();
    vi.spyOn(applicationApiService, 'saveNetworkOperator').mockResolvedValue({});
    vi.spyOn(progressApiService, 'updateApplicationProgress').mockResolvedValue({});
  });
  it.each([true, false])('saves %s with CPO progress and returns to the CPO task list', async confirmed => {
    const { result } = renderHook(() => useContactDetailsSubmit({ application, appId: 'app', contactIsConfirmed: confirmed, setError }), { wrapper });
    await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any));
    expect(applicationApiService.saveNetworkOperator).toHaveBeenCalledWith(expect.objectContaining({ type: 'CPO', contact_isconfirmed: confirmed }));
    expect(progressApiService.updateApplicationProgress).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/cpo/app/task-list');
  });
  it('does not navigate when saving fails', async () => {
    vi.mocked(applicationApiService.saveNetworkOperator).mockRejectedValue(new Error('Save failed'));
    const { result } = renderHook(() => useContactDetailsSubmit({ application, appId: 'app', contactIsConfirmed: true, setError }), { wrapper });
    await act(() => result.current.handleSubmit({ preventDefault: vi.fn() } as any));
    expect(setError).toHaveBeenCalledWith('Unable to save the applicant details. Try again.');
    expect(navigate).not.toHaveBeenCalled();
    expect(progressApiService.updateApplicationProgress).not.toHaveBeenCalled();
  });
});