import { afterEach, describe, expect, it, vi } from 'vitest';
import userService from './userService';
vi.mock('../utils/csrf', () => ({ getCsrfHeaders: () => ({ 'X-CSRF-Token': 'test-token' }) }));
vi.mock('../utils/apiConfig', () => ({ buildBackendUrl: (path: string) => 'https://api.example.test' + path }));
afterEach(() => vi.unstubAllGlobals());
describe('role change API data', () => {
  it('preserves each membership ID, label and role from the backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      user_id: 'target', organisation_ids: ['org-b', 'org-a'], organisation_name: 'A, B',
      organisation_memberships: [
        { organisation_id: 'org-a', organisation_name: 'A', role: 'APPLICANT_USER' },
        { organisation_id: 'org-b', organisation_name: 'B', role: 'APPLICANT_TEAM_COORDINATOR' },
      ],
    }]))));
    const result = await userService.getUsers();
    expect(result.data?.[0].organisationIds).toEqual(['org-b', 'org-a']);
    expect(result.data?.[0].organisationMemberships).toEqual([
      { organisationId: 'org-a', organisationName: 'A', role: 'APPLICANT_USER' },
      { organisationId: 'org-b', organisationName: 'B', role: 'APPLICANT_TEAM_COORDINATOR' },
    ]);
  });
  it('sends the chosen organisation in the credentialed PATCH body', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{}')); vi.stubGlobal('fetch', fetch);
    await userService.updateUserRole('target', 'APPLICANT_TEAM_COORDINATOR', 'org-b');
    expect(fetch).toHaveBeenCalledWith('https://api.example.test/api/users/target/role', expect.objectContaining({
      method: 'PATCH', credentials: 'include', headers: expect.objectContaining({ 'X-CSRF-Token': 'test-token' }),
      body: JSON.stringify({ role: 'APPLICANT_TEAM_COORDINATOR', organisationId: 'org-b' }),
    }));
  });
});
