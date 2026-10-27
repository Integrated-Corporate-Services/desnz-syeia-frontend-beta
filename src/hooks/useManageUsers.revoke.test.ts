import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useManageUsers } from './useManageUsers';
import userService from '../services/userService';

// A superuser whose own organisation (DESNZ) differs from the coordinator list's organisation
const actor = vi.hoisted(() => ({ user_id: 'me', role: 'SUPERUSER', organisation_id: 'desnz-org', organisation_name: 'DESNZ' }));
vi.mock('../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: actor }) }));
vi.mock('../services/userService', () => ({ default: { getUsers: vi.fn(), suspendUser: vi.fn() } }));

const REASON = 'Access revoked by administrator';
const laura = { id: 'u1', fullName: 'Laura Green', email: 'laura.green@example.test', status: 'ACTIVE' };

describe('useManageUsers confirmRevokeAccess organisation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getUsers).mockResolvedValue({ success: true, data: [laura] } as never);
    vi.mocked(userService.suspendUser).mockResolvedValue({ success: true } as never);
  });

  it("superuser revoke sends the coordinator list's organisation, not the superuser's own", async () => {
    const { result } = renderHook(() => useManageUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    const onSuccess = vi.fn();
    await act(() => result.current.confirmRevokeAccess('u1', onSuccess, 'enwl-org'));
    expect(userService.suspendUser).toHaveBeenCalledWith('u1', REASON, 'enwl-org');
    expect(onSuccess).toHaveBeenCalledWith({ userName: 'Laura Green', userEmail: 'laura.green@example.test' });
  });

  it("falls back to the signed-in user's organisation when none is given", async () => {
    const { result } = renderHook(() => useManageUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(() => result.current.confirmRevokeAccess('u1', vi.fn()));
    expect(userService.suspendUser).toHaveBeenCalledWith('u1', REASON, 'desnz-org');
  });
});
