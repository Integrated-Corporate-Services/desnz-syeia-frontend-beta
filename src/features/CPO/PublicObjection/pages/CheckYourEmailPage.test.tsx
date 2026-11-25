import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheckYourEmailPage from './CheckYourEmailPage';
import { ObjectionFieldErrors, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const withEmail = journeyFixture({ email: 'name@example.com' });

describe('CheckYourEmailPage (SYEIA-2929)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(withEmail);
  });

  it('says where the code was sent and how long it lasts', async () => {
    renderPage(<CheckYourEmailPage />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Enter the security code' })).toBeInTheDocument();
    expect(screen.getByText('We have sent a security code to name@example.com. This code expires in 60 minutes.')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter the 6-digit security code')).toHaveAttribute('autocomplete', 'one-time-code');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/your-email');
  });

  it.each([
    ['submit', '/object-to-a-cpo/find-your-address'],
    ['withdraw', '/object-to-a-cpo/withdraw'],
  ] as const)('moves on after a correct code when the action is %s', async (action, next) => {
    vi.spyOn(publicObjectionService, 'verifySecurityCode').mockResolvedValue({ ...withEmail, action, emailVerified: true });
    renderPage(<CheckYourEmailPage />);

    fireEvent.change(await screen.findByLabelText('Enter the 6-digit security code'), { target: { value: '482916' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(next));
  });

  it('shows a wrong code error', async () => {
    vi.spyOn(publicObjectionService, 'verifySecurityCode').mockRejectedValue(
      new ObjectionFieldErrors([{ field: 'securityCode', message: 'Enter the correct security code' }]),
    );
    renderPage(<CheckYourEmailPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('link', { name: 'Enter the correct security code' })).toHaveAttribute('href', '#security-code');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('sends a new code and confirms it', async () => {
    const resend = vi.spyOn(publicObjectionService, 'resendSecurityCode').mockResolvedValue(withEmail);
    renderPage(<CheckYourEmailPage />);

    fireEvent.click(await screen.findByText('Email not received?'));
    expect(screen.getByRole('link', { name: 'Change your email address' })).toHaveAttribute('href', '/object-to-a-cpo/your-email');
    fireEvent.click(screen.getByRole('button', { name: 'Send a new code' }));

    expect(await screen.findByText('We have sent a new security code to name@example.com')).toBeInTheDocument();
    expect(resend).toHaveBeenCalled();
  });
});
