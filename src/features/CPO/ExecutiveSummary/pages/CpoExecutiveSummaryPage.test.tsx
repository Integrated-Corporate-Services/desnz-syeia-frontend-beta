import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CpoExecutiveSummaryPage from './CpoExecutiveSummaryPage';
import { cpoOrderDetailsService } from '../../OrderDetails/services/cpoOrderDetailsService';
import { EMPTY_ORDER_DETAILS } from '../../OrderDetails/constants/orderDetailsConstants';
import type { FileUploadProps } from '../../../../components/FileUpload';

const navigateMock = vi.fn();
const uploadState = vi.hoisted(() => ({ errors: [] as string[], props: undefined as FileUploadProps | undefined }));
vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});
vi.mock('../../../../components/FileUpload', async () => {
  const actual = await import('react');
  return { default: actual.forwardRef<unknown, FileUploadProps>((props, ref) => {
    uploadState.props = props;
    actual.useImperativeHandle(ref, () => ({
      isBusy: () => false,
      triggerUpload: async () => ({ scanErrors: uploadState.errors, uploadedFiles: [], applicationDocuments: [] }),
    }));
    return <input id="file-upload-input" type="file" aria-label="Upload your executive summary" />;
  }) };
});

const renderPage = (query = '') => render(
  <MemoryRouter initialEntries={[`/cpo/application-id/order-details/executive-summary${query}`]}>
    <Routes><Route path="/cpo/:applicationId/order-details/executive-summary" element={<CpoExecutiveSummaryPage />} /></Routes>
  </MemoryRouter>
);
const ready = () => waitFor(() => expect(screen.getByRole('button', { name: 'Save and continue' })).toBeEnabled());

describe('CPO executive summary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    uploadState.errors = [];
    vi.spyOn(cpoOrderDetailsService, 'get').mockResolvedValue({ details: EMPTY_ORDER_DETAILS, documents: [] });
    vi.spyOn(cpoOrderDetailsService, 'save').mockResolvedValue({ details: EMPTY_ORDER_DETAILS, documents: [] });
  });

  it('does not continue when the scan fails', async () => {
    uploadState.errors = ['The file could not be checked for viruses'];
    renderPage();
    await ready();
    expect(screen.getByRole('link', { name: 'Download executive summary template' })).toHaveAttribute('href', expect.stringContaining('/order-details/executive-summary-template'));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('could not be checked'));
    expect(cpoOrderDetailsService.save).not.toHaveBeenCalled();
  });

  it('does not clear an immediate upload error on Save', async () => {
    renderPage(); await ready();
    act(() => { uploadState.props?.onValidationErrors?.(['Upload service unavailable']); });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Upload service unavailable');
    expect(cpoOrderDetailsService.save).not.toHaveBeenCalled();
  });

  it('shows the reference heading, guidance and task-list Back link', async () => {
    renderPage(); await ready();
    expect(screen.getByRole('heading', { name: 'Provide the executive summary' })).toBeInTheDocument();
    expect(screen.getByText('Executive summary')).toHaveClass('govuk-caption-l');
    expect(screen.getByText(/Use our executive summary template to provide an overview/)).toHaveClass('govuk-body');
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/application-id/task-list');
    expect(uploadState.props).toMatchObject({ uploadImmediately: true });
  });

  it('returns a saved executive summary directly to its task list', async () => {
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/task-list'));
    expect(cpoOrderDetailsService.save).toHaveBeenCalledWith('application-id', 'executive-summary', {}, false);
  });

  it('preserves the application-review Back and save destinations', async () => {
    renderPage('?from=application-review'); await ready();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/application-id/check-and-submit');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/check-and-submit'));
  });

  it('saves an unfinished executive summary for later without completing it', async () => {
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(cpoOrderDetailsService.save).toHaveBeenCalledWith('application-id', 'executive-summary', {}, true));
    expect(navigateMock).toHaveBeenCalledWith('/application-dashboard');
  });

  it('disables the upload for view-only access', async () => {
    vi.mocked(cpoOrderDetailsService.get).mockResolvedValue({ details: EMPTY_ORDER_DETAILS, documents: [], canEdit: false });
    renderPage();
    await screen.findByText('You can view this executive summary but cannot change it.');
    expect(screen.getByLabelText('Upload your executive summary')).toBeDisabled();
  });

  it('disables saving and focuses the error when loading fails', async () => {
    vi.mocked(cpoOrderDetailsService.get).mockRejectedValue(new Error('Unable to load'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to load'));
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });
});
