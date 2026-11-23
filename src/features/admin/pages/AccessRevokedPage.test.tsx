import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AccessRevokedPage from './AccessRevokedPage';
import { BreadcrumbProvider } from '../../../context/BreadcrumbContext';

const navigateToDashboard = vi.fn();
vi.mock('../../../hooks', () => ({ useManageUsersNavigation: () => ({ navigateToDashboard }) }));

const renderPage = (state?: { userName?: string; userEmail?: string }) =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[{ pathname: '/admin/access-revoked', state }]}>
        <AccessRevokedPage />
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('AccessRevokedPage (SYEIA-2172)', () => {
  it('uses the GOV.UK confirmation panel with no inline styles', () => {
    const { container } = renderPage({ userName: 'Jane Austen', userEmail: 'jane@example.test' });
    expect(container.querySelector('.govuk-panel')).toHaveClass('govuk-panel--confirmation');
    expect(container.querySelectorAll('[style]')).toHaveLength(0);
  });

  it("shows the user's name and email, letting a long email wrap", () => {
    renderPage({ userName: 'Jane Austen', userEmail: 'jane@example.test' });
    expect(screen.getByRole('heading', { level: 1, name: 'Access revoked' })).toBeInTheDocument();
    expect(screen.getByText('Jane Austen')).toBeInTheDocument();
    expect(screen.queryByText(/Jane Austen can no longer sign in and use the service/)).not.toBeInTheDocument();
    expect(screen.getByText('jane@example.test')).toHaveClass('govuk-!-text-break-word');
  });

  it('says access can be reinstated within 180 days from the User Management Dashboard', () => {
    renderPage({ userName: 'Jane Austen' });
    expect(
      screen.getByText(
        'The user has been notified by email that their access has been revoked. They will no longer be able to sign in to the service.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'They have 180 days to ask for their access to be reinstated. After 180 days they will need to create a new access request.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/reinstated later from the User Management Dashboard/)).toBeInTheDocument();
    expect(screen.queryByText(/you or another/)).not.toBeInTheDocument();
    expect(screen.queryByText(/30 days/)).not.toBeInTheDocument();
  });

  it('Return to dashboard goes to the User Management dashboard', () => {
    renderPage({ userName: 'Jane Austen' });
    fireEvent.click(screen.getByRole('button', { name: 'Return to dashboard' }));
    expect(navigateToDashboard).toHaveBeenCalled();
  });
});
