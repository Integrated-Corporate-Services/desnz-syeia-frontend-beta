import type { User } from '../../../types/user';

/**
 * Pick the user record to show for the organisation chosen on the list that linked here
 * (e.g. the team coordinators list), so the page shows, and acts on, that membership.
 *
 * The same user id can arrive as separate rows per organisation, or as one row with
 * several organisation memberships. Either way the result carries the chosen
 * organisation's name and role. Without an organisationId, or when nothing matches,
 * it falls back to the first row for that id.
 */
export const findUserForOrganisation = (
  users: User[],
  userId: string | undefined,
  organisationId?: string
): User | undefined => {
  const rows = users.filter(candidate => candidate.id === userId);
  if (!organisationId) return rows[0];

  for (const row of rows) {
    const membership = row.organisationMemberships?.find(item => item.organisationId === organisationId);
    if (membership) {
      return { ...row, organisation: membership.organisationName, role: membership.role };
    }
  }

  return rows.find(row => row.organisationIds?.includes(organisationId)) ?? rows[0];
};
