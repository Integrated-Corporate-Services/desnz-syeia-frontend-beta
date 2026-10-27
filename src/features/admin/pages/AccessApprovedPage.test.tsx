import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccessApprovedPage from './AccessApprovedPage';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../context/BreadcrumbContext';

const navigateToDashboard = vi.fn();
const navigateToPendingRequests = vi.fn();

vi.mock('../../../hooks', () => ({
  useAccessConfirmationNavigation: () => ({ navigateToDashboard, navigateToPendingRequests }),
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
  });

  it('Back link returns to the Access requests tab', () => {
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

  it('shows "Active users list" with a capital A for every role', () => {
    renderPage();
    expect(screen.getByText(/in your Active users list/)).toBeInTheDocument();
  });
});