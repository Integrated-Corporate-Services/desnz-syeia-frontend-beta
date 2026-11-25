import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheckAnswersPage from './CheckAnswersPage';
import ObjectorNamePage from './ObjectorNamePage';
import WhoIsObjectingPage from './WhoIsObjectingPage';
import ObjectionDetailsPage from './ObjectionDetailsPage';
import { ObjectionFieldErrors, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const address = { line1: '10 Mill Lane', line2: '', town: 'Northtown', county: '', postcode: 'NT1 2AB' };
const answered = journeyFixture({
  fullName: 'Priya Shah',
  email: 'priya@example.com',
  emailVerified: true,
  address,
  objectorType: 'myself',
  objectionDetails: 'The route crosses our farm.',
  documents: [{ fileId: 'f1', fileName: 'objection.pdf', status: 'ready' }],
});

const card = (title: string) => screen.getByRole('heading', { level: 2, name: title }).closest('.govuk-summary-card') as HTMLElement;

describe('CheckAnswersPage (SYEIA-2933 / SYEIA-2939)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  it('shows every answer with Change links that return here', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(answered);
    renderPage(<CheckAnswersPage />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Check your answers before you submit your objection' })).toBeInTheDocument();
    expect(within(card('Compulsory purchase order')).getByText(answered.title)).toBeInTheDocument();

    const details = card('Your details');
    expect(within(details).getByText('Priya Shah')).toBeInTheDocument();
    expect(within(details).getByText('priya@example.com')).toBeInTheDocument();
    expect(within(details).getByText(/10 Mill Lane/)).toHaveTextContent('10 Mill LaneNorthtownNT1 2AB');
    expect(within(details).getByText('Myself')).toBeInTheDocument();
    expect(within(details).getAllByRole('term').map((term) => term.textContent)).toEqual(['Email address', 'Full name', 'Postal address', 'Objector type']);
    expect(within(details).getByRole('link', { name: 'Change full name' })).toHaveAttribute('href', '/object-to-a-cpo/your-name?change=true');
    expect(within(details).getByRole('link', { name: 'Change postal address' })).toHaveAttribute('href', '/object-to-a-cpo/find-your-address?change=true');
    expect(within(details).queryByRole('link', { name: 'Change email address' })).not.toBeInTheDocument();

    const objection = card('The objection');
    expect(within(objection).getByText('The route crosses our farm.')).toBeInTheDocument();
    expect(within(objection).getByText('objection.pdf')).toBeInTheDocument();
    expect(within(objection).getByRole('link', { name: 'Change the objection' })).toHaveAttribute('href', '/object-to-a-cpo/your-objection?change=true');

    expect(screen.queryByRole('heading', { name: 'Objector names' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/your-objection');
  });

  it('lists the objectors for an organisation (SYEIA-2939)', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue({ ...answered, objectorType: 'organisation', objectorNames: ['Chuck Sanders Snr', 'Chucky Sanders Jnr'] });
    renderPage(<CheckAnswersPage />);

    await screen.findByRole('heading', { level: 2, name: 'Objector names' });
    const objectors = card('Objector names');
    expect(Array.from(objectors.querySelectorAll('.govuk-summary-list__row')).map((row) => row.textContent))
      .toEqual(['Objector 1Chuck Sanders Snr', 'Objector 2Chucky Sanders Jnr']);
    expect(within(objectors).getByRole('link', { name: 'Change objector names' })).toHaveAttribute('href', '/object-to-a-cpo/names-of-objectors?change=true');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/object-to-a-cpo/names-of-objectors');
  });

  it('submits and shows the confirmation', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(answered);
    const submit = vi.spyOn(publicObjectionService, 'submit').mockResolvedValue({
      reference: 'CPO00001',
      objections: [{ objectorName: 'Priya Shah', objectionReference: 'OBJ-000107' }],
    });
    renderPage(<CheckAnswersPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Submit objection' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/objection-submitted'));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('links each missing answer to its row', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue({ ...answered, address: null });
    vi.spyOn(publicObjectionService, 'submit').mockRejectedValue(
      new ObjectionFieldErrors([{ field: 'address', message: 'Enter your postal address' }]),
    );
    renderPage(<CheckAnswersPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Submit objection' }));
    expect(await screen.findByRole('link', { name: 'Enter your postal address' })).toHaveAttribute('href', '#address');
    expect(document.getElementById('address')).toHaveTextContent('Not provided');
    expect(navigateMock).not.toHaveBeenCalled();
  });
});

describe('Change links return to check your answers (SYEIA-2933 AC5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });

  it('returns after changing the name', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(answered);
    vi.spyOn(publicObjectionService, 'saveFullName').mockResolvedValue({ ...answered, fullName: 'Priya Patel' });
    renderPage(<ObjectorNamePage />, '/object-to-a-cpo/your-name?change=true');

    fireEvent.change(await screen.findByLabelText('Enter your full name'), { target: { value: 'Priya Patel' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/check-your-answers'));
  });

  it('asks for objector names when changing to an organisation that has none', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(answered);
    vi.spyOn(publicObjectionService, 'chooseObjectorType').mockResolvedValue({ ...answered, objectorType: 'organisation' });
    renderPage(<WhoIsObjectingPage />, '/object-to-a-cpo/who-is-objecting?change=true');

    fireEvent.click(await screen.findByLabelText('An organisation I work for or am a member of'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/names-of-objectors?change=true'));
  });

  it('returns after changing the objection when the names are already given', async () => {
    const organisation = { ...answered, objectorType: 'organisation' as const, objectorNames: ['Chuck Sanders Snr'] };
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(organisation);
    vi.spyOn(publicObjectionService, 'saveObjectionDetails').mockResolvedValue(organisation);
    renderPage(<ObjectionDetailsPage />, '/object-to-a-cpo/your-objection?change=true');

    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/check-your-answers'));
  });
});
