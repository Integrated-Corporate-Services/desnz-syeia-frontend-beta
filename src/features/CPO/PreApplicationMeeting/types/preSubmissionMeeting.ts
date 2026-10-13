import type { Application } from '../../../../types/application';

export type CpoMeetingAnswer = 'request-meeting' | 'had-meeting' | 'not-needed';

export type CpoMeetingDetails = {
  answer: CpoMeetingAnswer | null;
  reason: string;
};

// Meeting columns returned on the CPO application row by the backend.
export type CpoMeetingFields = {
  pre_submission_meeting_requested: boolean | null;
  pre_submission_meeting_answer: CpoMeetingAnswer | null;
  pre_submission_meeting_reason: string | null;
  pre_submission_meeting_requested_at: string | null;
  pre_submission_meeting_completed_at: string | null;
};

export type CpoMeetingApplication = Application & Partial<CpoMeetingFields>;
