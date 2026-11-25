import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FindAddressPage from './FindAddressPage';
import ChooseAddressPage from './ChooseAddressPage';
import ManualAddressPage from './ManualAddressPage';
import { ObjectionFieldErrors, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';
import type { ObjectionJourney } from '../types/objectionJourney';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const searched = (status: 'found' | 'none' | 'unavailable', results: { id: string; label: string }[] = []): ObjectionJourney =>
  journeyFixture({ emailVerified: true, addressSearch: { postcode: 'BN11 5RG', property: '', status, results } });

describe('Address pages (SYEIA-2930)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  describe('FindAddressPage', () => {
    it('shows the guidance, both fields and the manual link; Back goes to the code page (AC1, AC11)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ emailVerified: true }));
      renderPage(<FindAddressPage />);

      expect(await screen.findByRole('heading', { level: 1, name: 'Find your postal address' })).toBeInTheDocument();
      expect(screen.getByText(/We usually send these letters as attachments via email to the address you have provided/)).toBeInTheDocument();
      expect(screen.getByLabelText('Enter your postcode')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter your property name or number (optional)')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Enter the address manually' })).toHaveAttribute('href', '/object-to-a-cpo/enter-your-address');
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/check-your-email');
    });

    it('keeps the earlier search when coming back (AC10)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ addressSearch: { postcode: 'BN11 5RG', property: '1', status: 'found', results: [] } }));
      renderPage(<FindAddressPage />);
      await waitFor(() => expect(screen.getByLabelText('Enter your postcode')).toHaveValue('BN11 5RG'));
      expect(screen.getByLabelText('Enter your property name or number (optional)')).toHaveValue('1');
    });

    it('goes to the list when addresses are found (AC2)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      const search = vi.spyOn(publicObjectionService, 'searchAddress').mockResolvedValue(searched('found', [{ id: '1', label: '1 Arundel Mews' }]));
      renderPage(<FindAddressPage />);

      fireEvent.change(await screen.findByLabelText('Enter your postcode'), { target: { value: 'bn115rg' } });
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/choose-your-address'));
      expect(search).toHaveBeenCalledWith('bn115rg', '');
    });

    it.each([
      ['none', /We could not find any addresses for BN11 5RG/],
      ['unavailable', /Sorry, we cannot find addresses at the moment/],
    ] as const)('stays on the page with a manual option when the result is %s (AC7, AC8)', async (status, message) => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      vi.spyOn(publicObjectionService, 'searchAddress').mockResolvedValue(searched(status));
      renderPage(<FindAddressPage />);

      fireEvent.change(await screen.findByLabelText('Enter your postcode'), { target: { value: 'BN11 5RG' } });
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(navigateMock).not.toHaveBeenCalled();
      expect(screen.getAllByRole('link', { name: /enter the address manually/i }).length).toBeGreaterThan(1);
    });

    it('shows a postcode error (AC4, AC5)', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      vi.spyOn(publicObjectionService, 'searchAddress').mockRejectedValue(new ObjectionFieldErrors([{ field: 'postcode', message: 'Enter a postcode' }]));
      renderPage(<FindAddressPage />);

      fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
      expect(await screen.findByRole('link', { name: 'Enter a postcode' })).toHaveAttribute('href', '#postcode');
    });
  });

  describe('ChooseAddressPage', () => {
    const found = searched('found', [{ id: '1', label: '1 Arundel Mews, Worthing, BN11 5RG' }, { id: '2', label: '2a Arundel Mews, Worthing, BN11 5RG' }]);

    it('saves the chosen address and moves on to who is objecting', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(found);
      const select = vi.spyOn(publicObjectionService, 'selectAddress').mockResolvedValue(found);
      renderPage(<ChooseAddressPage />);

      fireEvent.click(await screen.findByLabelText('2a Arundel Mews, Worthing, BN11 5RG'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/who-is-objecting'));
      expect(select).toHaveBeenCalledWith('2');
    });

    it('goes to manual entry for "My address is not shown here"', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(found);
      renderPage(<ChooseAddressPage />);
      fireEvent.click(await screen.findByLabelText('My address is not shown here'));
      fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
      expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/enter-your-address');
    });

    it('sends the user back to the search when there is nothing to choose from', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      renderPage(<ChooseAddressPage />);
      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/find-your-address', { replace: true }));
    });
  });

  describe('ManualAddressPage (AC9)', () => {
    it('saves the typed address and moves on to who is objecting', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(searched('none'));
      const saveAddress = vi.spyOn(publicObjectionService, 'saveAddress').mockResolvedValue(journeyFixture());
      renderPage(<ManualAddressPage />);

      await waitFor(() => expect(screen.getByLabelText('Postcode')).toHaveValue('BN11 5RG'));
      fireEvent.change(screen.getByLabelText('Address line 1'), { target: { value: '1 Arundel Mews' } });
      fireEvent.change(screen.getByLabelText('Town or city'), { target: { value: 'Worthing' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

      await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/who-is-objecting'));
      expect(saveAddress).toHaveBeenCalledWith({ addressLine1: '1 Arundel Mews', addressLine2: '', town: 'Worthing', county: '', postcode: 'BN11 5RG' });
    });

    it('shows every missing field', async () => {
      vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture());
      vi.spyOn(publicObjectionService, 'saveAddress').mockRejectedValue(new ObjectionFieldErrors([
        { field: 'addressLine1', message: 'Enter address line 1, typically the building and street' },
        { field: 'town', message: 'Enter town or city' },
      ]));
      renderPage(<ManualAddressPage />);

      fireEvent.click(await screen.findByRole('button', { name: 'Save and continue' }));
      expect(await screen.findByRole('link', { name: 'Enter address line 1, typically the building and street' })).toHaveAttribute('href', '#address-line-1');
      expect(screen.getByRole('link', { name: 'Enter town or city' })).toHaveAttribute('href', '#town');
    });
  });
});
