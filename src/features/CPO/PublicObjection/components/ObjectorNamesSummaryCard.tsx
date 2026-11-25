import React from 'react';
import ObjectionSummaryCard from './ObjectionSummaryCard';
import { NameList } from './ObjectionAnswerValues';
import { changeLink, OBJECTION_ROUTES } from '../constants/objectionRoutes';

/** SYEIA-2939: everyone the organisation or representative is objecting for. */
const ObjectorNamesSummaryCard: React.FC<{ objectorNames: string[] }> = ({ objectorNames }) => (
  <ObjectionSummaryCard
    title="Objectors"
    changeTo={changeLink(OBJECTION_ROUTES.OBJECTOR_NAMES)}
    rows={[{ id: 'objector-name-0', label: 'Names of objectors', value: <NameList names={objectorNames} /> }]}
  />
);

export default ObjectorNamesSummaryCard;
