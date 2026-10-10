export type CpoMeetingAnswer = 'request-meeting' | 'had-meeting' | 'not-needed';

export type CpoMeetingDetails = {
  answer: CpoMeetingAnswer | null;
  reason: string;
};
