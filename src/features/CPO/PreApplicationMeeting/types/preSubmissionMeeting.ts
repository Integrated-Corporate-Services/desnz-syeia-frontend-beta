import type { Application } from '../../../../types/application';

export const CPO_MEETING_ANSWER = {
  HAD_MEETING: 'Yes, I’ve had this meeting',
  REQUEST_MEETING: 'No, I would like a pre-application meeting',
  NOT_NEEDED: 'No, I don’t need this meeting',
} as const;

export type CpoMeetingAnswer = (typeof CPO_MEETING_ANSWER)[keyof typeof CPO_MEETING_ANSWER];

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
