import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applicationApiService } from '../../../../services/applicationApiService';
import * as csrf from '../../../../utils/csrf';
import { cpoPreSubmissionMeetingService } from '../services/cpoPreSubmissionMeetingService';
import CpoPreSubmissionMeetingPage from './CpoPreSubmissionMeetingPage';
import CpoPreSubmissionMeetingConfirmationPage from './CpoPreSubmissionMeetingConfirmationPage';

const navigateMock = vi.fn();

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const renderPage = (confirmation = false) => render(
  <MemoryRouter initialEntries={['/cpo/application-id/pre-submission-meeting']}>
    <Routes>
      <Route path="/cpo/:applicationId/pre-submission-meeting" element={confirmation
        ? <CpoPreSubmissionMeetingConfirmationPage /> : <CpoPreSubmissionMeetingPage />} />
    </Routes>
  </MemoryRouter>
);

describe('CPO pre-submission meeting', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', desnz_ref: 'CPO00001' });
    vi.spyOn(cpoPreSubmissionMeetingService, 'save').mockResolvedValue({});
  });

  const waitForForm = () => waitFor(() => expect(screen.getByRole('button', { name: 'Save and continue' })).toBeEnabled());

  it('requires a choice before completing the task', async () => {
    renderPage();
    await waitForForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(cpoPreSubmissionMeetingService.save).not.toHaveBeenCalled();
  });

  it.each([
    ["Yes, I've had this meeting", false, 'had-meeting'],
    ['No, I would like a pre-application meeting', true, 'request-meeting'],
  ])('saves %s and navigates to the appropriate page', async (label, requested, answer) => {
    renderPage();
    await waitForForm();
    fireEvent.click(screen.getByLabelText(label));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/pre-submission-meeting/confirmation'));
    expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', requested, true, { answer, reason: '' });
  });

  it.each(["Yes, I've had this meeting", 'No, I would like a pre-application meeting', "No, I don't need this meeting"])('clears a selection error when %s is chosen', async (label) => {
    renderPage();
    await waitForForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Select whether you have had');
    fireEvent.click(screen.getByLabelText(label));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(cpoPreSubmissionMeetingService.save).not.toHaveBeenCalled();
  });

  it('saves an unanswered draft for later without completing it', async () => {
    renderPage();
    await waitForForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/application-dashboard'));
    expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', null, false, { answer: null, reason: '' });
  });

  it('restores the saved No answer', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', pre_submission_meeting_requested: false });
    renderPage();
    await waitForForm();
    expect(screen.getByLabelText("No, I don't need this meeting")).toBeChecked();
  });

  it('does not show success or navigate when saving fails', async () => {
    vi.mocked(cpoPreSubmissionMeetingService.save).mockRejectedValue(new Error('Unable to save'));
    renderPage();
    await waitForForm();
    fireEvent.click(screen.getByLabelText("Yes, I've had this meeting"));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to save'));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('prevents saving after a load failure', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockRejectedValue(new Error('Unable to load'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to load'));
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save for later' })).toBeDisabled();
  });

  it('reveals and requires a reason only when a meeting is not needed', async () => {
    renderPage(); await waitForForm();
    expect(screen.getByRole('heading', { name: 'Have you had a pre-application meeting?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/application-id/task-list');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("No, I don't need this meeting"));
    const reason = screen.getByRole('textbox', { name: "Tell us why you don't need this meeting" });
    expect(reason).toHaveAttribute('maxlength', '4000');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(cpoPreSubmissionMeetingService.save).not.toHaveBeenCalled();
    fireEvent.change(reason, { target: { value: '  Already discussed with DESNZ.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', false, true, { answer: 'not-needed', reason: 'Already discussed with DESNZ.' }));
  });

  it('restores the saved choice and reason and omits a hidden reason when changing choice', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({ type: 'CPO', pre_submission_meeting_answer: 'not-needed', pre_submission_meeting_reason: 'Already discussed' });
    renderPage(); await waitForForm();
    expect(screen.getByRole('textbox')).toHaveValue('Already discussed');
    fireEvent.click(screen.getByLabelText("Yes, I've had this meeting"));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', false, true, { answer: 'had-meeting', reason: '' }));
  });

  it('allows saving an unfinished reason for later', async () => {
    renderPage(); await waitForForm();
    fireEvent.click(screen.getByLabelText("No, I don't need this meeting"));
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', false, false, { answer: 'not-needed', reason: '' }));
  });

  it('shows a persisted request and the real reference on confirmation', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({
      type: 'CPO', desnz_ref: 'CPO00042', pre_submission_meeting_requested: true,
      pre_submission_meeting_requested_at: '2026-10-06T12:00:00Z',
    });
    renderPage(true);
    expect(await screen.findByRole('heading', { name: 'Pre-submission meeting request submitted' })).toBeInTheDocument();
    expect(screen.getByText('DESNZ reference: CPO00042')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Save and continue' })).toHaveAttribute('href', '/cpo/application-id/task-list');
    expect(screen.getByRole('link', { name: 'See all applications' })).toHaveAttribute('href', '/application-dashboard');
  });

  it('does not confirm a draft or absent request', async () => {
    renderPage(true);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/pre-submission-meeting', { replace: true }));
    expect(screen.queryByRole('heading', { name: 'Pre-submission meeting request submitted' })).not.toBeInTheDocument();
  });

  it('shows Application started and the reference for a completed No answer', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({
      type: 'CPO', desnz_ref: 'CPO00043', pre_submission_meeting_requested: false,
      pre_submission_meeting_completed_at: '2026-10-06T12:00:00Z',
      pre_submission_meeting_requested_at: null,
    });
    renderPage(true);
    expect(await screen.findByRole('heading', { name: 'Application started' })).toBeInTheDocument();
    expect(screen.getByText('DESNZ reference: CPO00043')).toBeInTheDocument();
    expect(screen.getByText('use this reference on your public notices and whenever you contact DESNZ')).toBeInTheDocument();
    expect(screen.getByText('you can ask for a pre-submission meeting at any time before you submit')).toBeInTheDocument();
    expect(screen.queryByText('the case officer will be in touch via email to arrange a pre-submission meeting')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Save and continue' })).toHaveAttribute('href', '/cpo/application-id/task-list');
    expect(screen.getByRole('link', { name: 'See all applications' })).toHaveAttribute('href', '/application-dashboard');
  });

  it('does not confirm an incomplete No answer', async () => {
    vi.mocked(applicationApiService.getApplicationById).mockResolvedValue({
      type: 'CPO', pre_submission_meeting_requested: false,
      pre_submission_meeting_completed_at: null,
    });
    renderPage(true);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/pre-submission-meeting', { replace: true }));
    expect(screen.queryByRole('heading', { name: 'Application started' })).not.toBeInTheDocument();
  });
});

describe('CPO meeting save error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(csrf, 'getCsrfHeaders').mockReturnValue({ 'X-CSRF-Token': 'test-csrf-token' });
  });

  it.each([
    [401, 'Your session has expired'],
    [403, 'You do not have permission'],
    [404, 'The meeting service or application is unavailable'],
    [409, 'This application can no longer be updated'],
    [500, 'Unable to save your pre-submission meeting answer'],
  ])('reports a safe, specific error for HTTP %s', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Internal database details' }), { status }));
    await expect(cpoPreSubmissionMeetingService.save('application-id', true, true))
      .rejects.toMatchObject({ status, message: expect.stringContaining(message) });
  });
});