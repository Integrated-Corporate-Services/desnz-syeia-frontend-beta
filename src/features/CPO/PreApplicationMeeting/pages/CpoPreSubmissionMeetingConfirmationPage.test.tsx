import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cpoPreSubmissionMeetingService } from '../services/cpoPreSubmissionMeetingService';
import type { CpoMeetingAnswer, CpoMeetingApplication } from '../types/preSubmissionMeeting';
import CpoPreSubmissionMeetingPage from './CpoPreSubmissionMeetingPage';
import CpoPreSubmissionMeetingConfirmationPage from './CpoPreSubmissionMeetingConfirmationPage';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../services/cpoPreSubmissionMeetingService', () => ({
  cpoPreSubmissionMeetingService: { get: vi.fn(), save: vi.fn() },
}));

const formPath = '/cpo/application-id/pre-submission-meeting';
const confirmationPath = `${formPath}/confirmation`;
const timestamp = '2026-10-19T12:00:00Z';
const meetingEmail = 'compulsorypurchaseorders@energysecurity.gov.uk';
const executiveSummaryGuidance =
  'you must complete the executive summary before you have the pre-application meeting';
const continueGuidance = 'you can continue working on your application now';
const referenceGuidance = 'quote the DESNZ reference whenever you contact us';

const answers: { answer: CpoMeetingAnswer; label: string }[] = [
  { answer: 'No, I would like a pre-application meeting', label: 'No, I would like a pre-application meeting' },
  { answer: 'Yes, I’ve had this meeting', label: "Yes, I’ve had this meeting" },
  { answer: 'No, I don’t need this meeting', label: "No, I don’t need this meeting" },
];

let application: CpoMeetingApplication;

const renderJourney = (path = formPath) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/cpo/:applicationId/pre-submission-meeting" element={<CpoPreSubmissionMeetingPage />} />
      <Route path="/cpo/:applicationId/pre-submission-meeting/confirmation" element={<CpoPreSubmissionMeetingConfirmationPage />} />
      <Route path="/cpo/:applicationId/task-list" element={<h1>Application task list</h1>} />
      <Route path="/application-dashboard" element={<h1>Applications</h1>} />
    </Routes>
  </MemoryRouter>
);

const expectConfirmation = (answer: CpoMeetingAnswer) => {
  expect(screen.getByText('DESNZ reference: CPO00042')).toBeInTheDocument();
  const nextSteps = within(screen.getByRole('list')).getAllByRole('listitem');
  if (answer === 'Yes, I’ve had this meeting' || answer === 'No, I don’t need this meeting') {
    expect(nextSteps).toHaveLength(4);
    expect(nextSteps[0]).toHaveTextContent(referenceGuidance);
    expect(nextSteps[2]).toHaveTextContent(executiveSummaryGuidance);
    expect(nextSteps[3]).toHaveTextContent(continueGuidance);
    expect(screen.getByRole('link', { name: meetingEmail })).toHaveAttribute(
      'href', `mailto:${meetingEmail}`
    );
  } else {
    expect(nextSteps).toHaveLength(2);
    expect(nextSteps[0]).toHaveTextContent(continueGuidance);
    expect(nextSteps[1]).toHaveTextContent(referenceGuidance);
    expect(screen.queryByRole('link', { name: meetingEmail })).not.toBeInTheDocument();
    expect(screen.queryByText(executiveSummaryGuidance)).not.toBeInTheDocument();
  }
  expect(screen.getByRole('heading', { name: 'Public notices' })).toBeInTheDocument();
  expect(screen.getByText(
    'You should use the DESNZ reference number in all your public notices.'
  )).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute(
    'href', '/cpo/application-id/task-list'
  );
};

describe('CPO meeting confirmation journey', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    application = {
      application_id: 'application-id',
      type: 'CPO',
      status: 'DRAFT',
      desnz_ref: 'CPO00042',
      created_by: 'user-id',
      created_at: timestamp,
      submitted_at: '',
      pre_submission_meeting_answer: null,
      pre_submission_meeting_requested: null,
      pre_submission_meeting_reason: null,
      pre_submission_meeting_requested_at: null,
      pre_submission_meeting_completed_at: null,
    };
    vi.mocked(cpoPreSubmissionMeetingService.get).mockImplementation(async () => ({
      ...application,
    }));
    vi.mocked(cpoPreSubmissionMeetingService.save).mockImplementation(
      async (_id, requested, complete, meeting) => {
        application = {
          ...application,
          pre_submission_meeting_answer: meeting?.answer,
          pre_submission_meeting_reason: meeting?.reason,
          pre_submission_meeting_requested: requested,
          pre_submission_meeting_requested_at: complete && requested ? timestamp : null,
          pre_submission_meeting_completed_at: complete ? timestamp : null,
        };
        return { ...application };
      }
    );
  });

  it.each(answers)(
    'saves $answer, displays its confirmation, preserves it on reload, and continues to the task list',
    async ({ answer, label }) => {
      const page = renderJourney();
      const save = screen.getByRole('button', { name: 'Save and continue' });
      await waitFor(() => expect(save).toBeEnabled());
      fireEvent.click(screen.getByLabelText(label));
      if (answer === 'No, I don’t need this meeting') {
        fireEvent.change(screen.getByRole('textbox'), {
          target: { value: 'Already discussed with DESNZ' },
        });
      }
      expect(screen.queryByRole('heading', { name: 'Application started' })).not.toBeInTheDocument();
      fireEvent.click(save);

      await screen.findByRole('heading', { name: 'Application started' });
      expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledWith(
        'application-id', answer === 'No, I would like a pre-application meeting', true,
        { answer, reason: answer === 'No, I don’t need this meeting' ? 'Already discussed with DESNZ' : '' }
      );
      expectConfirmation(answer);

      page.unmount();
      renderJourney(confirmationPath);
      await screen.findByRole('heading', { name: 'Application started' });
      expectConfirmation(answer);
      expect(cpoPreSubmissionMeetingService.save).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('link', { name: 'Continue' }));
      expect(await screen.findByRole('heading', { name: 'Application task list' })).toBeInTheDocument();
    }
  );

  it('does not confirm a request saved for later, including a direct visit to confirmation', async () => {
    const page = renderJourney();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save for later' })).toBeEnabled());
    fireEvent.click(screen.getByLabelText('No, I would like a pre-application meeting'));
    fireEvent.click(screen.getByRole('button', { name: 'Save for later' }));
    await screen.findByRole('heading', { name: 'Applications' });
    expect(application.pre_submission_meeting_requested_at).toBeNull();

    page.unmount();
    renderJourney(confirmationPath);
    expect(await screen.findByRole('heading', {
      name: 'Have you had a pre-application meeting?',
    })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Application started' })).not.toBeInTheDocument();
  });
});
