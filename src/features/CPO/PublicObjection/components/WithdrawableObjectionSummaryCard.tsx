import React from 'react';
import ObjectionSummaryCard from './ObjectionSummaryCard';
import { NameList, NOT_PROVIDED } from './ObjectionAnswerValues';
import type { WithdrawableObjection } from '../types/objectionJourney';

/** SYEIA-2946: one objection that is about to be withdrawn. */
const WithdrawableObjectionSummaryCard: React.FC<{ objection: WithdrawableObjection }> = ({ objection }) => (
  <ObjectionSummaryCard
    title={objection.objectionReference}
    rows={[
      { label: 'Objector', value: objection.objectorName },
      { label: 'Objection', value: objection.objectionDetails || NOT_PROVIDED },
      { label: 'Documents', value: <NameList names={objection.documentNames} /> },
    ]}
  />
);

export default WithdrawableObjectionSummaryCard;
