import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ObjectionSubmittedPage from './ObjectionSubmittedPage';
import { ObjectionJourneyMissing, publicObjectionService } from '../services/publicObjectionService';
import { renderPage } from '../utils/testUtils';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('ObjectionSubmittedPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  it('shows one objection reference (SYEIA-2942)', async () => {
    vi.spyOn(publicObjectionService, 'getSubmission').mockResolvedValue({
      reference: 'CPO00001',
      objections: [{ objectorName: 'Priya Shah', objectionReference: 'OBJ-000107' }],
    });
    renderPage(<ObjectionSubmittedPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Objection submitted' })).toBeInTheDocument();
    expect(screen.getByText(/Your objection reference number is/)).toHaveTextContent('Your objection reference number isOBJ-000107');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('You will receive an email to confirm this objection has been submitted.')).toBeInTheDocument();
    expect(screen.getByText('You can withdraw this objection at any time before a decision on the CPO is made.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Submit or withdraw another objection to a CPO' }))
      .toHaveAttribute('href', '/object-to-a-cpo');
  });

  it('shows a table of references for several objectors (SYEIA-2934)', async () => {
    vi.spyOn(publicObjectionService, 'getSubmission').mockResolvedValue({
      reference: 'CPO00001',
      objections: [
        { objectorName: 'Chuck Sanders Snr', objectionReference: 'OBJ-000108' },
        { objectorName: 'Chucky Sanders Jnr', objectionReference: 'OBJ-000109' },
      ],
    });
    renderPage(<ObjectionSubmittedPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Objections submitted' })).toBeInTheDocument();
    expect(screen.getByText('Each objector has their own objection reference')).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows.map((row) => row.textContent)).toEqual([
      'ObjectorObjection reference',
      'Chuck Sanders SnrOBJ-000108',
      'Chucky Sanders JnrOBJ-000109',
    ]);
    expect(screen.getByText('You will receive an email to confirm these objections have been submitted.')).toBeInTheDocument();
    expect(screen.getByText('You can withdraw one or more objections at any time before a decision on the CPO is made.')).toBeInTheDocument();
  });

  it('sends the user to the start when there is nothing to confirm', async () => {
    vi.spyOn(publicObjectionService, 'getSubmission').mockRejectedValue(new ObjectionJourneyMissing());
    renderPage(<ObjectionSubmittedPage />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/cpo-reference', { replace: true }));
  });
});
