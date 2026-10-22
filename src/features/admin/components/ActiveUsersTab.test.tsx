import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActiveUsersTab } from './ActiveUsersTab';

// SYEIA-2722: a long email address must be able to wrap, so the table and cards stay within the grid.
const longEmail =
  'a.very.long.email.address.to.test.the.layout.overflow@an-extremely-long-subdomain-for-testing.example.test';

describe('ActiveUsersTab', () => {
  it('lets a long email wrap in both the table and the mobile card', () => {
    render(
      <ActiveUsersTab
        totalResults={1}
        usersError=""
        usersLoading={false}
        paginatedUsers={[
          {
            id: 'user-1',
            fullName: 'Longemail Testuser',
            email: longEmail,
            organisation: 'National Grid',
            role: 'APPLICANT_USER',
            status: 'ACTIVE',
            lastLogin: null,
          },
        ]}
        navigateToRevokeUser={vi.fn()}
        currentPage={1}
        totalPages={1}
        handlePageChange={vi.fn()}
      />
    );

    const emails = screen.getAllByText(longEmail);
    expect(emails).toHaveLength(2);
    emails.forEach((email) => expect(email).toHaveClass('active-users-email'));
  });
});