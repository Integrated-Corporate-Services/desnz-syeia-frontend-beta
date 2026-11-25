import React from 'react';
import ObjectionSummaryCard from './ObjectionSummaryCard';
import { NameList, NOT_PROVIDED } from './ObjectionAnswerValues';
import { changeLink, OBJECTION_ROUTES } from '../constants/objectionRoutes';
import type { ObjectionJourney } from '../types/objectionJourney';

/** SYEIA-2933: the objection text and the documents that support it. */
const ObjectionDetailsSummaryCard: React.FC<{ journey: ObjectionJourney }> = ({ journey }) => (
  <ObjectionSummaryCard
    title="Objection"
    changeTo={changeLink(OBJECTION_ROUTES.OBJECTION)}
    rows={[
      { id: 'objection-details', label: 'Objection', value: journey.objectionDetails || NOT_PROVIDED },
      { id: 'objection-documents', label: 'Documents', value: <NameList names={journey.documents.map((document) => document.fileName)} /> },
    ]}
  />
);

export default ObjectionDetailsSummaryCard;
