import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangeUserRolePage from './ChangeUserRolePage';
import userService from '../../../services/userService';
import type { User } from '../../../types/user';

const state = vi.hoisted(() => ({
  users: [] as User[],
  actor: { role: 'SUPERUSER', organisation_id: 'superusers-own-org' },
}));
vi.mock('../../../hooks/useManageUsers', () => ({ useManageUsers: () => ({ users: state.users, loading: false }) }));
vi.mock('../../../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: state.actor }) }));
vi.mock('../../../context/BreadcrumbContext', () => ({ useBreadcrumb: () => {} }));
vi.mock('../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../config/appConfig', () => ({ isManageUserRoleChangeEnabled: () => true }));
vi.mock('../../../services/userService', () => ({ default: { updateUserRole: vi.fn() } }));
const applicant = 'APPLICANT_USER', coordinator = 'APPLICANT_TEAM_COORDINATOR';
const member = (organisationId: string, organisationName: string, role = applicant) => ({ organisationId, organisationName, role });
const target = (memberships = [member('org-a', 'Network A')]): User => ({
  id: 'target-user', fullName: 'Target User', email: 'target@example.test', status: 'ACTIVE',
  organisation: memberships.map(m => m.organisationName).join(', '), role: applicant, lastLogin: null,
  organisationIds: memberships.map(m => m.organisationId), organisationMemberships: memberships,
});
function Destination() { const location = useLocation(); return <div>Saved:{location.pathname}</div>; }
function mount() {
  return render(<MemoryRouter initialEntries={['/admin/manage-user/target-user/change-role']}>
    <Routes>
      <Route path="/admin/manage-user/:userId/change-role" element={<ChangeUserRolePage />} />
      <Route path="/admin/manage-user/:userId" element={<Destination />} />
    </Routes>
  </MemoryRouter>);
}
describe('organisation-scoped role changes', () => {
  beforeEach(() => {
    vi.clearAllMocks(); state.actor = { role: 'SUPERUSER', organisation_id: 'superusers-own-org' };
    state.users = [target()];
    vi.mocked(userService.updateUserRole).mockResolvedValue({ success: true });
  });
  it('submits the target membership organisation, not the superuser organisation', async () => {
    mount(); fireEvent.click(screen.getByRole('radio', { name: 'Team coordinator' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(userService.updateUserRole).toHaveBeenCalledWith('target-user', coordinator, 'org-a'));
    expect(await screen.findByText('Saved:/admin/manage-user/target-user')).toBeInTheDocument();
  });
  it('keeps coordinator changes scoped to the authenticated organisation', async () => {
    state.actor = { role: coordinator, organisation_id: 'org-a' }; mount();
    fireEvent.click(screen.getByRole('radio', { name: 'Team coordinator' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(userService.updateUserRole).toHaveBeenCalledWith('target-user', coordinator, 'org-a'));
  });
  it('requires an explicit organisation when the target has multiple memberships', async () => {
    state.users = [target([member('org-a', 'Network A'), member('org-b', 'Network B')])]; mount();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findAllByText('Select an organisation')).toHaveLength(3);
    expect(userService.updateUserRole).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('combobox', { name: 'Organisation' }), { target: { value: 'org-b' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Team coordinator' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(userService.updateUserRole).toHaveBeenCalledWith('target-user', coordinator, 'org-b'));
  });
  it('loads each organisation role and discards a previous organisation draft', () => {
    state.users = [target([member('org-a', 'Network A'), member('org-b', 'Network B', coordinator)])]; mount();
    const choice = screen.getByRole('combobox', { name: 'Organisation' });
    fireEvent.change(choice, { target: { value: 'org-a' } });
    expect(screen.getByRole('radio', { name: 'Applicant' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Team coordinator' }));
    fireEvent.change(choice, { target: { value: 'org-b' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Applicant' }));
    fireEvent.change(choice, { target: { value: 'org-a' } });
    expect(screen.getByRole('radio', { name: 'Applicant' })).toBeChecked();
  });
  it('combines memberships from separate address rows without choosing the first row silently', () => {
    state.users = [target([member('org-a', 'Network A')]), target([member('org-b', 'Network B')])]; mount();
    expect(screen.getByRole('combobox', { name: 'Organisation' })).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Network B' })).toBeInTheDocument();
  });
  it('does not submit a superuser change when membership IDs are missing', async () => {
    state.users = [{ ...target(), organisationMemberships: undefined, organisationIds: undefined }]; mount();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findAllByText(/Organisation details could not be loaded/)).toHaveLength(2);
    expect(userService.updateUserRole).not.toHaveBeenCalled();
  });
  it('supports an older API response with a single unambiguous organisation ID', async () => {
    state.users = [{ ...target(), organisationMemberships: undefined }]; mount();
    fireEvent.click(screen.getByRole('radio', { name: 'Team coordinator' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(userService.updateUserRole).toHaveBeenCalledWith('target-user', coordinator, 'org-a'));
  });
  it('shows a backend refusal and keeps the user on the role page', async () => {
    vi.mocked(userService.updateUserRole).mockResolvedValue({ success: false, message: 'Insufficient permissions' }); mount();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findAllByText('Insufficient permissions')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Which role applies to this user?' })).toBeInTheDocument();
  });
});
