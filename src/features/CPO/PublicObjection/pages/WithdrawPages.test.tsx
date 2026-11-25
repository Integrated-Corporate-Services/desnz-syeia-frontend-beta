import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WithdrawSelectPage from './WithdrawSelectPage';
import WithdrawConfirmPage from './WithdrawConfirmPage';
import ObjectionWithdrawnPage from './ObjectionWithdrawnPage';
import { ObjectionFieldErrors, ObjectionJourneyMissing, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';
import type { WithdrawableObjection } from '../types/objectionJourney';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const journey = journeyFixture({ action: 'withdraw', email: 'priya@example.com', emailVerified: true });
const objection = (id: string, reference: string, objectorName: string): WithdrawableObjection => ({
  objectionId: id,
  objectionReference: reference,
  objectorName,
  objectionDetails: 'The route crosses our farm.',
  documentNames: ['objection.pdf'],
});
const first = objection('o1', 'OBJ-000108', 'Chuck Sanders Snr');
const second = objection('o2', 'OBJ-000109', 'Chucky Sanders Jnr');

describe('Withdraw pages (SYEIA-2943 / SYEIA-2946)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journey);
  });

  describe('WithdrawSelectPage', () => {
    it('lets the user choose from several objections', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [first, second], selected: [] });
      const select = vi.spyOn(publicObjectionService, 'selectForWithdrawal').mockResolvedValue({ selected: ['o2'] });
      renderPage(<WithdrawSelectPage />);

      expect(await screen.findByText('Select all objections to be withdrawn')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Chucky Sanders Jnr'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/withdraw/confirm'));
      expect(select).toHaveBeenCalledWith(['o2']);
    });

    it('shows the error when nothing is selected', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [first, second], selected: [] });
      vi.spyOn(publicObjectionService, 'selectForWithdrawal').mockRejectedValue(
        new ObjectionFieldErrors([{ field: 'withdrawSelection', message: 'Select the objections you want to withdraw' }]),
      );
      renderPage(<WithdrawSelectPage />);

      fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
      expect(await screen.findByRole('link', { name: 'Select the objections you want to withdraw' })).toHaveAttribute('href', '#withdraw-selection');
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('goes straight to confirming when there is only one objection', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [first], selected: [] });
      renderPage(<WithdrawSelectPage />);
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/withdraw/confirm', { replace: true }));
    });

    it('says when there is nothing to withdraw', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [], selected: [] });
      renderPage(<WithdrawSelectPage />);
      expect(await screen.findByRole('heading', { level: 1, name: 'There are no objections to withdraw' })).toBeInTheDocument();
    });

    it('sends the user to the start without a verified withdraw journey', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockRejectedValue(new ObjectionJourneyMissing());
      renderPage(<WithdrawSelectPage />);
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/cpo-reference', { replace: true }));
    });
  });

  describe('WithdrawConfirmPage', () => {
    it('confirms the only objection with an optional reason', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [first], selected: [] });
      const withdraw = vi.spyOn(publicObjectionService, 'withdraw').mockResolvedValue({
        reference: 'CPO00001',
        objections: [{ objectorName: first.objectorName, objectionReference: first.objectionReference }],
      });
      renderPage(<WithdrawConfirmPage />);

      expect(await screen.findByRole('heading', { level: 1, name: 'Confirm you want to withdraw this objection' })).toBeInTheDocument();
      const card = screen.getByRole('heading', { level: 2, name: 'Objection OBJ-000108' }).closest('.govuk-summary-card') as HTMLElement;
      expect(within(card).getByText('Chuck Sanders Snr')).toBeInTheDocument();
      expect(within(card).getByText('objection.pdf')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Cancel' })).toHaveAttribute('href', '/object-to-a-cpo');

      fireEvent.change(screen.getByLabelText('Reason for withdrawing (optional)'), { target: { value: 'We have agreed terms.' } });
      fireEvent.click(screen.getByLabelText('I confirm I want to withdraw this objection and understand this action cannot be undone.'));
      fireEvent.click(screen.getByRole('button', { name: 'Withdraw objection' }));
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/objection-withdrawn'));
      expect(withdraw).toHaveBeenCalledWith('We have agreed terms.', true);
    });

    it('shows only the selected objections, in the plural', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [first, second], selected: ['o1', 'o2'] });
      renderPage(<WithdrawConfirmPage />);

      expect(await screen.findByRole('heading', { level: 1, name: 'Confirm you want to withdraw these objections' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Objection OBJ-000109' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Withdraw objections' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/withdraw');
    });

    it('needs the confirmation ticked', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [first], selected: [] });
      vi.spyOn(publicObjectionService, 'withdraw').mockRejectedValue(new ObjectionFieldErrors([{
        field: 'withdrawConfirmed', message: 'Confirm that you want to withdraw and understand this cannot be undone',
      }]));
      renderPage(<WithdrawConfirmPage />);

      fireEvent.click(await screen.findByRole('button', { name: 'Withdraw objection' }));
      expect(await screen.findByRole('link', { name: 'Confirm that you want to withdraw and understand this cannot be undone' }))
        .toHaveAttribute('href', '#withdraw-confirmed');
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('goes back to choose when several objections are found but none is selected', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawable').mockResolvedValue({ objections: [first, second], selected: [] });
      renderPage(<WithdrawConfirmPage />);
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/withdraw', { replace: true }));
    });
  });

  describe('ObjectionWithdrawnPage', () => {
    it('confirms one withdrawn objection and who is told', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawn').mockResolvedValue({
        reference: 'CPO00001',
        organisation: 'Northtown Power Networks Ltd',
        objections: [{ objectorName: 'Priya Shah', objectionReference: 'OBJ-000107' }],
      });
      renderPage(<ObjectionWithdrawnPage />);

      expect(await screen.findByRole('heading', { level: 1, name: 'Objection withdrawn' })).toBeInTheDocument();
      expect(screen.getByText('You will receive an email to confirm the objection OBJ-000107 has been withdrawn.')).toBeInTheDocument();
      expect(screen.getByText('We will tell Northtown Power Networks Ltd that you have withdrawn your objection.')).toBeInTheDocument();
      expect(screen.getByText('Your objection stays on record, but it will not be considered in the decision on the CPO.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Submit or withdraw another objection to a CPO' })).toHaveAttribute('href', '/object-to-a-cpo');
    });

    it('lists several withdrawn objections', async () => {
      vi.spyOn(publicObjectionService, 'getWithdrawn').mockResolvedValue({
        reference: 'CPO00001',
        organisation: 'Northtown Power Networks Ltd',
        objections: [
          { objectorName: 'Chuck Sanders Snr', objectionReference: 'OBJ-000108' },
          { objectorName: 'Chucky Sanders Jnr', objectionReference: 'OBJ-000109' },
        ],
      });
      renderPage(<ObjectionWithdrawnPage />);

      expect(await screen.findByRole('heading', { level: 1, name: 'Objections withdrawn' })).toBeInTheDocument();
      expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(3);
      expect(screen.getByText('We will tell Northtown Power Networks Ltd that you have withdrawn your objections.')).toBeInTheDocument();
    });
  });
});
