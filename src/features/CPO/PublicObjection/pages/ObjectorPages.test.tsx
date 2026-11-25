import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WhoIsObjectingPage from './WhoIsObjectingPage';
import ObjectorNamesPage from './ObjectorNamesPage';
import ObjectionDetailsPage from './ObjectionDetailsPage';
import { ObjectionFieldErrors, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('Objector pages', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  describe('WhoIsObjectingPage (SYEIA-2931)', () => {
    it('shows the three options with their hints and keeps the saved choice (AC1, AC7)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ objectorType: 'representative' }));
      renderPage(<WhoIsObjectingPage />);

      expect(await screen.findByRole('heading', { level: 1, name: 'Who are you submitting this objection for?' })).toBeInTheDocument();
      expect(screen.getByText('Order CPO00001')).toBeInTheDocument();
      expect(screen.getByLabelText('Myself')).toHaveAccessibleDescription('You are submitting your own objection');
      expect(screen.getByLabelText('An organisation I work for or am a member of')).toBeInTheDocument();
      await waitFor(() => expect(screen.getByLabelText('A person, group or organisation I represent')).toBeChecked());
    });

    it('saves the choice and goes to the objection page (AC2 to AC4)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      const choose = vi.spyOn(publicObjectionService, 'chooseObjectorType').mockResolvedValue(journeyFixture({ objectorType: 'organisation' }));
      renderPage(<WhoIsObjectingPage />);

      fireEvent.click(await screen.findByLabelText('An organisation I work for or am a member of'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/your-objection'));
      expect(choose).toHaveBeenCalledWith('organisation');
    });

    it('needs a choice (AC5)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      vi.spyOn(publicObjectionService, 'chooseObjectorType').mockRejectedValue(new ObjectionFieldErrors([
        { field: 'objectorType', message: 'Select who you are submitting this objection for' },
      ]));
      renderPage(<WhoIsObjectingPage />);

      fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
      expect(await screen.findByRole('link', { name: 'Select who you are submitting this objection for' })).toHaveAttribute('href', '#objector-type');
    });
  });

  describe('ObjectionDetailsPage next step', () => {
    it.each([
      ['myself', '/object-to-a-cpo/check-your-answers'],
      ['organisation', '/object-to-a-cpo/names-of-objectors'],
      ['representative', '/object-to-a-cpo/names-of-objectors'],
    ] as const)('for %s goes to %s', async (objectorType, next) => {
      const journey = journeyFixture({ emailVerified: true, objectorType, objectionDetails: 'Text' });
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journey);
      vi.spyOn(publicObjectionService, 'saveObjectionDetails').mockResolvedValue(journey);
      renderPage(<ObjectionDetailsPage />);

      fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(next));
    });
  });

  describe('ObjectorNamesPage (SYEIA-2937)', () => {
    it('adds and removes name fields, keeping at least one (AC5, AC6, AC10)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ objectorType: 'organisation' }));
      renderPage(<ObjectorNamesPage />);

      expect(await screen.findByRole('heading', { level: 1, name: 'Provide the names of all objectors' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Add another name' }));
      expect(screen.getAllByRole('textbox')).toHaveLength(2);
      fireEvent.click(screen.getByRole('button', { name: 'Remove objector 2' }));
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
    });

    it('saves every name and goes to check your answers (AC4)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ objectorNames: ['Chuck Sanders Snr'] }));
      const saveNames = vi.spyOn(publicObjectionService, 'saveObjectorNames').mockResolvedValue(journeyFixture());
      renderPage(<ObjectorNamesPage />);

      await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('Chuck Sanders Snr'));
      fireEvent.click(screen.getByRole('button', { name: 'Add another name' }));
      fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'Chucky Sanders Jnr' } });
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/check-your-answers'));
      expect(saveNames).toHaveBeenCalledWith(['Chuck Sanders Snr', 'Chucky Sanders Jnr']);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/your-objection');
    });

    it('marks the blank row (AC8)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ objectorNames: ['Chuck Sanders', ''] }));
      vi.spyOn(publicObjectionService, 'saveObjectorNames').mockRejectedValue(new ObjectionFieldErrors([
        { field: 'objectorNames.1', message: 'Enter the name of the objector' },
      ]));
      renderPage(<ObjectorNamesPage />);

      await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(2));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(await screen.findByRole('link', { name: 'Enter the name of the objector' })).toHaveAttribute('href', '#objector-name-1');
      expect(screen.getAllByRole('textbox')[1]).toHaveClass('govuk-input--error');
    });
  });
});
