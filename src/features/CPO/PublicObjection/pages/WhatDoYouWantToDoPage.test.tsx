import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WhatDoYouWantToDoPage from './WhatDoYouWantToDoPage';
import { ObjectionFieldErrors, ObjectionJourneyMissing, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('WhatDoYouWantToDoPage (SYEIA-2925)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  it('shows the CPO details and a link to change the reference', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ action: null }));
    renderPage(<WhatDoYouWantToDoPage />);

    expect(await screen.findByRole('heading', { level: 1, name: /North Ridge Connection/ })).toBeInTheDocument();
    expect(screen.getByText('Order CPO00001')).toBeInTheDocument();
    expect(screen.getByText('This CPO was made by Northtown Power Networks Ltd.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'enter a different CPO reference number' }))
      .toHaveAttribute('href', '/object-to-a-cpo/cpo-reference');
  });

  it.each([
    ['Submit a new objection', 'submit', '/object-to-a-cpo/your-name'],
    ['Withdraw an objection I have submitted', 'withdraw', '/object-to-a-cpo/your-email'],
  ] as const)('%s goes to the right next step', async (label, action, next) => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ action: null }));
    const choose = vi.spyOn(publicObjectionService, 'chooseAction').mockResolvedValue(journeyFixture({ action }));
    renderPage(<WhatDoYouWantToDoPage />);

    fireEvent.click(await screen.findByLabelText(label));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith(next));
    expect(choose).toHaveBeenCalledWith(action);
  });

  it('keeps the previous choice when coming back', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ action: 'withdraw' }));
    renderPage(<WhatDoYouWantToDoPage />);
    expect(await screen.findByLabelText('Withdraw an objection I have submitted')).toBeChecked();
  });

  it('shows the error when nothing is chosen', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(journeyFixture({ action: null }));
    vi.spyOn(publicObjectionService, 'chooseAction').mockRejectedValue(new ObjectionFieldErrors([
      { field: 'action', message: 'Select whether you want to submit or withdraw an objection' },
    ]));
    renderPage(<WhatDoYouWantToDoPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('link', { name: 'Select whether you want to submit or withdraw an objection' }))
      .toHaveAttribute('href', '#action-submit');
    expect(screen.getAllByText('Select whether you want to submit or withdraw an objection')).toHaveLength(2);
  });

  it('sends the user back to the reference page when the session has ended', async () => {
    vi.spyOn(publicObjectionService, 'get').mockRejectedValue(new ObjectionJourneyMissing());
    renderPage(<WhatDoYouWantToDoPage />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/cpo-reference', { replace: true }));
  });
});
