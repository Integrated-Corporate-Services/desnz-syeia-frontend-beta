import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoPreSubmissionMeetingService } from '../services/cpoPreSubmissionMeetingService';
import type { CpoMeetingApplication } from '../types/preSubmissionMeeting';
import CpoPreSubmissionMeetingPage from './CpoPreSubmissionMeetingPage';
import CpoPreSubmissionMeetingConfirmationPage from './CpoPreSubmissionMeetingConfirmationPage';

const navigateMock = vi.fn();

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

let application: CpoMeetingApplication;
const seedApplication = (overrides: Partial<CpoMeetingApplication> = {}) => {
  application = {
    application_id: 'application-id', type: 'CPO', status: 'DRAFT', desnz_ref: 'CPO00001', created_by: 'user-id',
    created_at: '2026-10-06T12:00:00Z', submitted_at: '', permissions: { canEdit: true } as CpoMeetingApplication['permissions'],
    pre_submission_meeting_requested: null, pre_submission_meeting_answer: null, pre_submission_meeting_reason: null,
    pre_submission_meeting_requested_at: null, pre_submission_meeting_completed_at: null, ...overrides,
  };
};

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
    seedApplication();
    vi.spyOn(cpoPreSubmissionMeetingService, 'get').mockImplementation(async () => ({ ...application }));
    vi.spyOn(cpoPreSubmissionMeetingService, 'save').mockImplementation(async () => ({ ...application }));
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
    ["Yes, I’ve had this meeting", false, 'Yes, I’ve had this meeting'],
    ['No, I would like a pre-application meeting', true, 'No, I would like a pre-application meeting'],
  ])('saves %s through the backend and navigates to the confirmation', async (label, requested, answer) => {
    renderPage();
    await waitForForm();
    fireEvent.click(screen.getByLabelText(label));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/pre-submission-meeting/confirmation'));
    expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', requested, true, { answer, reason: '' });
  });

  it.each(["Yes, I’ve had this meeting", 'No, I would like a pre-application meeting', "No, I don’t need this meeting"])('clears a selection error when %s is chosen', async (label) => {
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

  it('restores the saved answer', async () => {
    seedApplication({ pre_submission_meeting_requested: false, pre_submission_meeting_answer: 'No, I don’t need this meeting', pre_submission_meeting_reason: 'Already discussed' });
    renderPage();
    await waitForForm();
    expect(screen.getByLabelText("No, I don’t need this meeting")).toBeChecked();
    expect(screen.getByRole('textbox')).toHaveValue('Already discussed');
  });

  it('restores a legacy answer that only has the requested flag', async () => {
    seedApplication({ pre_submission_meeting_requested: true });
    renderPage();
    await waitForForm();
    expect(screen.getByLabelText('No, I would like a pre-application meeting')).toBeChecked();
  });

  it('does not show success or navigate when saving fails', async () => {
    vi.mocked(cpoPreSubmissionMeetingService.save).mockRejectedValue(new Error('Unable to save'));
    renderPage();
    await waitForForm();
    fireEvent.click(screen.getByLabelText("Yes, I’ve had this meeting"));
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to save'));
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('prevents saving after a load failure', async () => {
    vi.mocked(cpoPreSubmissionMeetingService.get).mockRejectedValue(new Error('Unable to load'));
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to load'));
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save for later' })).toBeDisabled();
  });

  it('rejects an application that is not a CPO or cannot be edited', async () => {
    seedApplication({ type: 'NWL' });
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('only available for compulsory purchase order'));
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });

  it('blocks a read-only application', async () => {
    seedApplication({ permissions: { canEdit: false } as CpoMeetingApplication['permissions'] });
    renderPage();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('cannot update this application'));
    expect(screen.getByRole('button', { name: 'Save and continue' })).toBeDisabled();
  });

  it('reveals and requires a reason only when a meeting is not needed', async () => {
    renderPage(); await waitForForm();
    expect(screen.getByRole('heading', { name: 'Have you had a pre-application meeting?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/cpo/application-id/task-list');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("No, I don’t need this meeting"));
    const reason = screen.getByRole('textbox', { name: "Tell us why you don’t need this meeting" });
    expect(reason).toHaveAttribute('maxlength', '4000');
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(cpoPreSubmissionMeetingService.save).not.toHaveBeenCalled();
    fireEvent.change(reason, { target: { value: '  Already discussed with DESNZ.  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', false, true, { answer: 'No, I don’t need this meeting', reason: 'Already discussed with DESNZ.' }));
    expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/pre-submission-meeting/confirmation');
  });

  it('omits a hidden reason when the choice changes', async () => {
    seedApplication({ pre_submission_meeting_answer: 'No, I don’t need this meeting', pre_submission_meeting_requested: false, pre_submission_meeting_reason: 'Already discussed' });
    renderPage(); await waitForForm();
    fireEvent.click(screen.getByLabelText("Yes, I’ve had this meeting"));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
    await waitFor(() => expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', false, true, { answer: 'Yes, I’ve had this meeting', reason: '' }));
  });

  it('allows saving an unfinished reason for later', async () => {
    renderPage(); await waitForForm();
    fireEvent.click(screen.getByLabelText("No, I don’t need this meeting"));
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await waitFor(() => expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith('application-id', false, false, { answer: 'No, I don’t need this meeting', reason: '' }));
  });

  it('keeps a submitted meeting request editable', async () => {
    seedApplication({ pre_submission_meeting_requested: true, pre_submission_meeting_requested_at: '2026-10-06T12:00:00Z' });
    renderPage();
    await waitForForm();
    expect(screen.getByLabelText('No, I would like a pre-application meeting')).toBeChecked();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('shows the shorter confirmation and real reference for a persisted request', async () => {
    seedApplication({
      desnz_ref: 'CPO00042', pre_submission_meeting_requested: true, pre_submission_meeting_requested_at: '2026-10-06T12:00:00Z',
      pre_submission_meeting_completed_at: '2026-10-06T12:00:00Z',
    });
    renderPage(true);
    expect(await screen.findByRole('heading', { name: 'Application started' })).toBeInTheDocument();
    expect(screen.getByText('DESNZ reference: CPO00042')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'compulsorypurchaseorders@energysecurity.gov.uk' })).not.toBeInTheDocument();
    expect(screen.queryByText('you must complete the executive summary before you have the pre-application meeting')).not.toBeInTheDocument();
    expect(screen.getByText('you can continue working on your application now')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/cpo/application-id/task-list');
  });

  it('does not confirm a draft or absent request', async () => {
    renderPage(true);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/pre-submission-meeting', { replace: true }));
    expect(screen.queryByRole('heading', { name: 'Application started' })).not.toBeInTheDocument();
  });

  it.each(['Yes, I’ve had this meeting', 'No, I don’t need this meeting'] as const)('shows the full confirmation for a completed %s answer', async (answer) => {
    seedApplication({
      desnz_ref: 'CPO00043', pre_submission_meeting_requested: false, pre_submission_meeting_answer: answer,
      pre_submission_meeting_reason: answer === 'No, I don’t need this meeting' ? 'Already discussed with DESNZ' : '',
      pre_submission_meeting_completed_at: '2026-10-06T12:00:00Z', pre_submission_meeting_requested_at: null,
    });
    renderPage(true);
    expect(await screen.findByRole('heading', { name: 'Application started' })).toBeInTheDocument();
    expect(screen.getByText('DESNZ reference: CPO00043')).toBeInTheDocument();
    expect(screen.getByText('quote the DESNZ reference whenever you contact us')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'compulsorypurchaseorders@energysecurity.gov.uk' })).toHaveAttribute('href', 'mailto:compulsorypurchaseorders@energysecurity.gov.uk');
    expect(screen.getByText('you must complete the executive summary before you have the pre-application meeting')).toBeInTheDocument();
    expect(screen.getByText('you can continue working on your application now')).toBeInTheDocument();
    expect(screen.getByText('You should use the DESNZ reference number in all your public notices.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/cpo/application-id/task-list');
  });

  it('does not confirm an incomplete No answer', async () => {
    seedApplication({ pre_submission_meeting_requested: false, pre_submission_meeting_completed_at: null });
    renderPage(true);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/cpo/application-id/pre-submission-meeting', { replace: true }));
    expect(screen.queryByRole('heading', { name: 'Application started' })).not.toBeInTheDocument();
  });

  it('shows a load error on the confirmation page', async () => {
    vi.mocked(cpoPreSubmissionMeetingService.get).mockRejectedValue(new Error('down'));
    renderPage(true);
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load your application confirmation');
  });
});
