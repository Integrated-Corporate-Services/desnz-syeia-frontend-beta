import React from 'react';
import ObjectionSummaryCard from './ObjectionSummaryCard';
import { AddressLines, NOT_PROVIDED } from './ObjectionAnswerValues';
import { changeLink, OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { OBJECTOR_TYPE_LABELS } from '../constants/objectionContent';
import type { ObjectionJourney } from '../types/objectionJourney';

/** SYEIA-2933: who is objecting. The email was verified with a security code, so it has no Change link. */
const ObjectorDetailsSummaryCard: React.FC<{ journey: ObjectionJourney }> = ({ journey }) => (
  <ObjectionSummaryCard
    title="Your details"
    rows={[
      { id: 'full-name', label: 'Full name', value: journey.fullName || NOT_PROVIDED, changeTo: changeLink(OBJECTION_ROUTES.FULL_NAME) },
      { label: 'Email address', value: journey.email },
      {
        id: 'address',
        label: 'Postal address',
        value: journey.address ? <AddressLines address={journey.address} /> : NOT_PROVIDED,
        changeTo: changeLink(OBJECTION_ROUTES.ADDRESS),
      },
      {
        id: 'objector-type',
        label: 'Submitting the objection for',
        value: journey.objectorType ? OBJECTOR_TYPE_LABELS[journey.objectorType] : NOT_PROVIDED,
        changeTo: changeLink(OBJECTION_ROUTES.WHO_IS_OBJECTING),
      },
    ]}
  />
);

export default ObjectorDetailsSummaryCard;
