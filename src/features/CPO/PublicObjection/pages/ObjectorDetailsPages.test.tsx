import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ObjectorNamePage from './ObjectorNamePage';
import ObjectorEmailPage from './ObjectorEmailPage';
import { ObjectionFieldErrors, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('Your details pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  describe('ObjectorNamePage (SYEIA-2926)', () => {
    it('shows the saved name and goes to the email page', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ fullName: 'Priya Shah' }));
      const save = vi.spyOn(publicObjectionService, 'saveFullName').mockResolvedValue(journeyFixture({ fullName: 'Priya Shah' }));
      renderPage(<ObjectorNamePage />);

      const input = await screen.findByLabelText('Enter your full name');
      await waitFor(() => expect(input).toHaveValue('Priya Shah'));
      expect(screen.getByText('Order CPO00001')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/what-do-you-want-to-do');

      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/your-email'));
      expect(save).toHaveBeenCalledWith('Priya Shah');
    });

    it('shows a name error', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      vi.spyOn(publicObjectionService, 'saveFullName').mockRejectedValue(
        new ObjectionFieldErrors([{ field: 'fullName', message: 'Enter a valid full name' }]),
      );
      renderPage(<ObjectorNamePage />);

      fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
      expect(await screen.findByRole('link', { name: 'Enter a valid full name' })).toHaveAttribute('href', '#full-name');
      expect(screen.getByLabelText('Enter your full name')).toHaveClass('govuk-input--error');
    });
  });

  describe('ObjectorEmailPage (SYEIA-2928)', () => {
    it('explains the security code and the postal alternative, then goes to the code page', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ email: 'name@example.com' }));
      const save = vi.spyOn(publicObjectionService, 'saveEmail').mockResolvedValue(journeyFixture({ email: 'name@example.com' }));
      renderPage(<ObjectorEmailPage />);

      const input = await screen.findByLabelText('Enter your email address');
      await waitFor(() => expect(input).toHaveValue('name@example.com'));
      expect(screen.getByText('We will send you a security code, which you must enter on the next page')).toBeInTheDocument();
      expect(screen.getByText(/submit objections in writing to the postal address/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/your-name');

      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/check-your-email'));
      expect(save).toHaveBeenCalledWith('name@example.com');
    });

    it('asks for the email used to submit, and goes back to the choice of action, when withdrawing (SYEIA-2943)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ action: 'withdraw' }));
      renderPage(<ObjectorEmailPage />);
      await screen.findByLabelText('Enter the email address used to submit the objection');
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/what-do-you-want-to-do');
      expect(screen.getByText('I don’t have access to the email address')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'compulsorypurchaseorders@energysecurity.gov.uk' }))
        .toHaveAttribute('href', 'mailto:compulsorypurchaseorders@energysecurity.gov.uk');
      expect(screen.queryByText(/submit objections in writing to the postal address/)).not.toBeInTheDocument();
    });

    it('stays on the page when the code cannot be sent', async () => {
      const message = 'We could not send a security code to this email address. Try again or use a different email address.';
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      vi.spyOn(publicObjectionService, 'saveEmail').mockRejectedValue(new ObjectionFieldErrors([{ field: 'email', message }]));
      renderPage(<ObjectorEmailPage />);

      fireEvent.change(await screen.findByLabelText('Enter your email address'), { target: { value: 'name@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(await screen.findByRole('link', { name: message })).toHaveAttribute('href', '#email');
      expect(navigateMock).not.toHaveBeenCalled();
    });
  });
});
