import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CpoReferencePage from './CpoReferencePage';
import { ObjectionFieldErrors, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

describe('CpoReferencePage (SYEIA-2924)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  it('starts the journey and goes to the choice of action', async () => {
    const start = vi.spyOn(publicObjectionService, 'start').mockResolvedValue(journeyFixture({ action: null }));
    renderPage(<CpoReferencePage />);

    fireEvent.change(screen.getByLabelText('Enter the CPO reference number'), { target: { value: ' cpo00001 ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/what-do-you-want-to-do'));
    expect(start).toHaveBeenCalledWith(' cpo00001 ');
  });

  it('shows the API error in the summary and against the field', async () => {
    vi.spyOn(publicObjectionService, 'start').mockRejectedValue(
      new ObjectionFieldErrors([{ field: 'reference', message: 'CPO reference number not found' }]),
    );
    renderPage(<CpoReferencePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    const summaryLink = await screen.findByRole('link', { name: 'CPO reference number not found' });
    expect(summaryLink).toHaveAttribute('href', '#reference');
    expect(screen.getByLabelText('Enter the CPO reference number')).toHaveClass('govuk-input--error');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('explains where to find the reference', () => {
    renderPage(<CpoReferencePage />);
    const toggle = screen.getByRole('button', { name: 'Where to find the CPO reference number' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByText(/published online, in local newspapers/).length).toBeGreaterThan(0);
  });
});
