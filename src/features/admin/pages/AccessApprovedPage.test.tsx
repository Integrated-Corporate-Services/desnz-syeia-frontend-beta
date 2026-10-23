import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccessApprovedPage from './AccessApprovedPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

const navigateToDashboard = vi.fn();
const navigateToPendingRequests = vi.fn();
let isSuperUser = true;

vi.mock('../../../hooks', () => ({
  useAccessConfirmationNavigation: () => ({ navigateToDashboard, navigateToPendingRequests }),
}));
vi.mock('../../../hooks/useIsSuperUser', () => ({
  useIsSuperUser: () => isSuperUser,
}));

const BreadcrumbOutlet = () => {
  const { breadcrumb } = useBreadcrumbContext();
  return <>{breadcrumb}</>;
};

const renderPage = () =>
  render(
    <BreadcrumbProvider>
      <MemoryRouter initialEntries={[{ pathname: '/admin/access-approved', state: { userName: 'Jane Austen', userEmail: 'jane@example.com' } }]}>
        <BreadcrumbOutlet />
        <AccessApprovedPage />
      </MemoryRouter>
    </BreadcrumbProvider>
  );

describe('AccessApprovedPage (SYEIA-2721)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSuperUser = true;
  });

  it.each([true, false])('Back link returns to the Access requests tab (superuser: %s)', (superUser) => {
    isSuperUser = superUser;
    renderPage();
    const back = screen.getByRole('link', { name: 'Back' });
    expect(back).toHaveClass('govuk-back-link');
    fireEvent.click(back);
    expect(navigateToPendingRequests).toHaveBeenCalledTimes(1);
    expect(navigateToDashboard).not.toHaveBeenCalled();
  });

  it('Return to dashboard button goes to the dashboard', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Return to dashboard' }));
    expect(navigateToDashboard).toHaveBeenCalledTimes(1);
  });

  it('Ultrasuperuser sees "Active users list" with a capital A', () => {
    renderPage();
    expect(screen.getByText(/in your Active users list/)).toBeInTheDocument();
  });

  it('Team coordinator keeps "active users list"', () => {
    isSuperUser = false;
    renderPage();
    expect(screen.getByText(/in your active users list/)).toBeInTheDocument();
  });
});