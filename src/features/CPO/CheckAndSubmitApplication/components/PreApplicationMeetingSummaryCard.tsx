import React from 'react';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import { meetingAnswer, NOT_ANSWERED } from '../utils/answerDisplay';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from './SummaryList';

interface Props {
  application: CpoAnswers['application'];
  /** Fallback DESNZ reference from the notices record when the application row has none yet. */
  noticesReference?: string | null;
}

/** Pre-application meeting answer and DESNZ reference — never shows a Change link. */
export const PreApplicationMeetingSummaryCard: React.FC<Props> = ({ application, noticesReference }) => (
  <SummaryCard title="Pre-application meeting">
    <SummaryRow label="Pre-application meeting">{meetingAnswer(application)}</SummaryRow>
    {application.pre_submission_meeting_answer === 'No, I don’t need this meeting' && (
      <SummaryRow label="Tell us why you don’t need this meeting">
        {application.pre_submission_meeting_reason || NOT_ANSWERED}
      </SummaryRow>
    )}
    <SummaryRow label="DESNZ reference">
      {application.desnz_ref || noticesReference || 'Not yet assigned'}
    </SummaryRow>
  </SummaryCard>
);

export default PreApplicationMeetingSummaryCard;
