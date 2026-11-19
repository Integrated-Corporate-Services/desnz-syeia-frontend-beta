import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActiveUsersTab } from './ActiveUsersTab';

// SYEIA-2722: a long email address must be able to wrap, so the table and cards stay within the grid.
const longEmail =
  'a.very.long.email.address.to.test.the.layout.overflow@an-extremely-long-subdomain-for-testing.example.test';

const activeUser = (overrides: Partial<React.ComponentProps<typeof ActiveUsersTab>['paginatedUsers'][number]> = {}) => ({
  id: 'user-1',
  fullName: 'Longemail Testuser',
  email: longEmail,
  organisation: 'National Grid',
  role: 'APPLICANT_USER',
  status: 'ACTIVE',
  lastLogin: null,
  ...overrides,
});

const renderTab = (users = [activeUser()], showOrganisation = true) =>
  render(
    <ActiveUsersTab
      totalResults={users.length}
      usersError=""
      usersLoading={false}
      paginatedUsers={users}
      showOrganisation={showOrganisation}
      navigateToRevokeUser={vi.fn()}
      currentPage={1}
      totalPages={1}
      handlePageChange={vi.fn()}
    />
  );

describe('ActiveUsersTab', () => {
  it('lets a long email wrap in both the table and the mobile card', () => {
    renderTab();

    const emails = screen.getAllByText(longEmail);
    expect(emails).toHaveLength(2);
    emails.forEach((email) => expect(email).toHaveClass('active-users-email'));
  });

  // SYEIA-2168: the Ultra Superuser's table shows each user's organisation, in the column order of the design.
  it('shows an Organisation column after Name', () => {
    renderTab();

    const headers = within(screen.getByRole('table')).getAllByRole('columnheader').map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Name', 'Organisation', 'Email', 'Role', 'Status', 'Last login', 'Action(s)']);

    const cells = within(screen.getByRole('table')).getAllByRole('cell').map((td) => td.textContent?.trim());
    expect(cells.slice(0, 2)).toEqual(['Longemail Testuser', 'National Grid']);
  });

  // SYEIA-2168 AC2: last login is the date only, as in the design ("05 March 2025"), in the table and the mobile card.
  it('shows last login as a date with no time', () => {
    renderTab([activeUser({ lastLogin: new Date(2025, 2, 5, 14, 20).toISOString() })]);

    const cells = within(screen.getByRole('table')).getAllByRole('cell').map((td) => td.textContent?.trim());
    expect(cells[5]).toBe('05 March 2025');
    expect(screen.getAllByText('05 March 2025')).toHaveLength(2);
    expect(screen.queryByText(/2:20pm/)).not.toBeInTheDocument();
  });

  it('shows "Never" for a user who has not signed in', () => {
    renderTab();

    const cells = within(screen.getByRole('table')).getAllByRole('cell').map((td) => td.textContent?.trim());
    expect(cells[5]).toBe('Never');
  });

  it('lists every organisation of a user who belongs to more than one', () => {
    renderTab([activeUser({ organisation: 'National Grid, SSE Networks' })]);

    expect(within(screen.getByRole('table')).getByText('National Grid, SSE Networks')).toBeInTheDocument();
  });

  it('shows N/A in the table and the mobile card when a user has no organisation', () => {
    renderTab([activeUser({ organisation: '' })]);

    expect(within(screen.getByRole('table')).getByText('N/A')).toBeInTheDocument();
    const card = screen.getByRole('listitem');
    expect(within(card).getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByText('SSE Networks')).not.toBeInTheDocument();
  });

  // The API lists a user once per organisation, so rows share a user id. Changing page must not leave
  // the previous page's rows behind.
  it('shows only the current page rows for a user listed once per organisation', () => {
    const multiOrg = [
      activeUser({ id: 'agent-1', fullName: 'David Clarke-Agent', email: 'david.agent@example.test', organisation: 'Electricity North West' }),
      activeUser({ id: 'agent-1', fullName: 'David Clarke-Agent', email: 'david.agent@example.test', organisation: 'National Grid Electricity Distribution' }),
    ];
    const nextPageUsers = [activeUser({ id: 'user-2', fullName: 'Emma Davies', email: 'emma@example.test', organisation: 'SP Manweb' })];
    const props = { totalResults: 3, usersError: '', usersLoading: false, showOrganisation: true, navigateToRevokeUser: vi.fn(), currentPage: 1, totalPages: 2, handlePageChange: vi.fn() };
    const { rerender } = render(<ActiveUsersTab {...props} paginatedUsers={multiOrg} />);

    const firstPage = within(screen.getByRole('table')).getAllByRole('row').slice(1).map((tr) => tr.textContent);
    expect(firstPage).toHaveLength(2);
    expect(firstPage[0]).toContain('Electricity North West');
    expect(firstPage[1]).toContain('National Grid Electricity Distribution');

    rerender(<ActiveUsersTab {...props} currentPage={2} paginatedUsers={nextPageUsers} />);

    expect(within(screen.getByRole('table')).getAllByRole('row').slice(1)).toHaveLength(1);
    expect(screen.queryByText('David Clarke-Agent')).not.toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Active users list' })).getAllByRole('listitem')).toHaveLength(1);
  });

  it('spans every column with the empty message', () => {
    renderTab([]);

    const emptyCell = within(screen.getByRole('table')).getByText('No active users found.').closest('td');
    expect(emptyCell).toHaveAttribute('colspan', '7');
  });

  // SYEIA-2168: a team coordinator only sees users of their own organisation, so the column is not shown.
  describe('for a team coordinator', () => {
    it('does not show the Organisation column', () => {
      renderTab([activeUser()], false);

      const headers = within(screen.getByRole('table')).getAllByRole('columnheader').map((th) => th.textContent?.trim());
      expect(headers).toEqual(['Name', 'Email', 'Role', 'Status', 'Last login', 'Action(s)']);

      const cells = within(screen.getByRole('table')).getAllByRole('cell').map((td) => td.textContent?.trim());
      expect(cells.slice(0, 2)).toEqual(['Longemail Testuser', longEmail]);
    });

    it('does not show the organisation on the mobile card', () => {
      renderTab([activeUser()], false);

      const card = screen.getByRole('listitem');
      expect(within(card).queryByText('Organisation:')).not.toBeInTheDocument();
      expect(screen.queryByText('National Grid')).not.toBeInTheDocument();
    });

    it('spans the remaining six columns with the empty message', () => {
      renderTab([], false);

      const emptyCell = within(screen.getByRole('table')).getByText('No active users found.').closest('td');
      expect(emptyCell).toHaveAttribute('colspan', '6');
    });
  });
});
