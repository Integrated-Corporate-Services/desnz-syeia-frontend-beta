import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ObjectionDetailsPage from './ObjectionDetailsPage';
import { ObjectionFieldErrors, publicObjectionService } from '../services/publicObjectionService';
import { journeyFixture, renderPage } from '../utils/testUtils';
import type { ObjectionDocument } from '../types/objectionJourney';

const navigateMock = vi.fn();
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const verified = (documents: ObjectionDocument[] = [], objectionDetails = '') =>
  journeyFixture({ emailVerified: true, documents, objectionDetails });
const photos: ObjectionDocument = { fileId: 'file-1', fileName: 'ridge-lane-photos.pdf', status: 'ready' };

describe('ObjectionDetailsPage (SYEIA-2932)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigateMock.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('shows the guidance, keeps saved text and goes on to check your answers', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(verified([], 'Saved text'));
    const save = vi.spyOn(publicObjectionService, 'saveObjectionDetails').mockResolvedValue(verified([], 'Saved text'));
    renderPage(<ObjectionDetailsPage />);

    const textarea = await screen.findByLabelText('Enter the objection');
    await waitFor(() => expect(textarea).toHaveValue('Saved text'));
    expect(screen.getByRole('heading', { level: 1, name: 'Provide the objection' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read the guidance on objecting to a CPO (opens in a new tab)' }))
      .toHaveAttribute('target', '_blank');
    expect(screen.getByText('You have 3,990 characters remaining')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/object-to-a-cpo/check-your-answers'));
    expect(save).toHaveBeenCalledWith('Saved text');
  });

  it('counts characters over the 4,000 limit', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(verified());
    renderPage(<ObjectionDetailsPage />);

    fireEvent.change(await screen.findByLabelText('Enter the objection'), { target: { value: 'a'.repeat(4002) } });
    expect(screen.getByText('You have 2 characters too many')).toHaveClass('govuk-error-message');
  });

  it('shows the error when there is no text and no document', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(verified());
    vi.spyOn(publicObjectionService, 'saveObjectionDetails').mockRejectedValue(new ObjectionFieldErrors([
      { field: 'objectionDetails', message: 'Enter the details of your objection or upload a supporting document' },
    ]));
    renderPage(<ObjectionDetailsPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    expect(await screen.findByRole('link', { name: 'Enter the details of your objection or upload a supporting document' }))
      .toHaveAttribute('href', '#objection-details');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('uploads a chosen file and lists it', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(verified());
    const upload = vi.spyOn(publicObjectionService, 'uploadDocument').mockResolvedValue(verified([photos]));
    renderPage(<ObjectionDetailsPage />);

    const file = new File(['%PDF'], 'ridge-lane-photos.pdf', { type: 'application/pdf' });
    fireEvent.change(await screen.findByLabelText('Upload documents (optional)'), { target: { files: [file] } });

    expect(await screen.findByText('ridge-lane-photos.pdf', { selector: '.govuk-task-list__name-and-hint > span' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Documents uploaded' })).toBeInTheDocument();
    expect(upload).toHaveBeenCalledWith(file);
  });

  it('uploads a file dropped on the drop zone', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(verified());
    const upload = vi.spyOn(publicObjectionService, 'uploadDocument').mockResolvedValue(verified([photos]));
    renderPage(<ObjectionDetailsPage />);

    const file = new File(['%PDF'], 'ridge-lane-photos.pdf', { type: 'application/pdf' });
    const dropZone = (await screen.findByText('or drop file')).closest('.gds-upload-dropzone') as HTMLElement;
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    await waitFor(() => expect(upload).toHaveBeenCalledWith(file));
    expect(await screen.findByText('ridge-lane-photos.pdf', { selector: '.govuk-task-list__name-and-hint > span' })).toBeInTheDocument();
  });

  it('shows why a file was refused', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(verified());
    vi.spyOn(publicObjectionService, 'uploadDocument').mockRejectedValue(new ObjectionFieldErrors([
      { field: 'document', message: 'The selected file must be a PDF, Word, Excel, JPG or PNG file' },
    ]));
    renderPage(<ObjectionDetailsPage />);

    const file = new File(['gif'], 'map.gif', { type: 'image/gif' });
    fireEvent.change(await screen.findByLabelText('Upload documents (optional)'), { target: { files: [file] } });

    expect(await screen.findByRole('link', { name: 'The selected file must be a PDF, Word, Excel, JPG or PNG file' }))
      .toHaveAttribute('href', '#objection-documents');
  });

  it('removes a document', async () => {
    vi.spyOn(publicObjectionService, 'get').mockResolvedValue(verified([photos]));
    const remove = vi.spyOn(publicObjectionService, 'removeDocument').mockResolvedValue(verified());
    renderPage(<ObjectionDetailsPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Remove ridge-lane-photos.pdf' }));

    await waitFor(() => expect(screen.queryByText('ridge-lane-photos.pdf', { selector: '.govuk-task-list__name-and-hint > span' })).not.toBeInTheDocument());
    expect(remove).toHaveBeenCalledWith('file-1');
  });

  it('checks again until the virus scan has finished', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const get = vi.spyOn(publicObjectionService, 'get')
      .mockResolvedValueOnce(verified([{ ...photos, status: 'checking' }]))
      .mockResolvedValue(verified([{ ...photos, status: 'rejected' }]));
    renderPage(<ObjectionDetailsPage />);

    expect(await screen.findByText('Checking for viruses')).toBeInTheDocument();
    await act(async () => { await vi.advanceTimersByTimeAsync(3100); });

    expect(await screen.findByText('Could not be uploaded')).toHaveClass('govuk-error-message');
    expect(get).toHaveBeenCalledTimes(2);
  });
});
