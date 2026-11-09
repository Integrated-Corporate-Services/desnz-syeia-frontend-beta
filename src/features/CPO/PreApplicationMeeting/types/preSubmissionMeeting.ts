export const CPO_MEETING_ANSWER = {
  HAD_MEETING: 'Yes, I’ve had this meeting',
  REQUEST_MEETING: 'No, I would like a pre-application meeting',
  NOT_NEEDED: 'No, I don’t need this meeting',
} as const;

// Labels are shown to the applicant; codes are what the API exchanges.
export type CpoMeetingAnswer = (typeof CPO_MEETING_ANSWER)[keyof typeof CPO_MEETING_ANSWER];

export type CpoMeetingCode = 'had-meeting' | 'request-meeting' | 'not-needed';

export const CPO_MEETING_CODE_BY_ANSWER: Record<CpoMeetingAnswer, CpoMeetingCode> = {
  [CPO_MEETING_ANSWER.HAD_MEETING]: 'had-meeting',
  [CPO_MEETING_ANSWER.REQUEST_MEETING]: 'request-meeting',
  [CPO_MEETING_ANSWER.NOT_NEEDED]: 'not-needed',
};

export const CPO_MEETING_ANSWER_BY_CODE: Record<CpoMeetingCode, CpoMeetingAnswer> = {
  'had-meeting': CPO_MEETING_ANSWER.HAD_MEETING,
  'request-meeting': CPO_MEETING_ANSWER.REQUEST_MEETING,
  'not-needed': CPO_MEETING_ANSWER.NOT_NEEDED,
};

export type CpoMeetingDetails = {
  answer: CpoMeetingAnswer | null;
  reason: string;
};

// The versions the next PATCH must echo back as expected_content_version / expected_row_version.
export type CpoMeetingVersions = {
  content_version: number;
  row_version: number;
};

export type CpoMeeting = CpoMeetingDetails & CpoMeetingVersions & {
  application_id: string;
  desnz_ref: string | null;
  requested_at: string | null;
  completed_at: string | null;
  can_edit: boolean;
};

export type CpoMeetingResponse = Omit<CpoMeeting, 'answer'> & { answer: CpoMeetingCode | null };
