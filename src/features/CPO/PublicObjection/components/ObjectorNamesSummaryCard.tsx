import React from 'react';
import ObjectionSummaryCard from './ObjectionSummaryCard';
import { NOT_PROVIDED } from './ObjectionAnswerValues';
import { changeLink, OBJECTION_ROUTES } from '../constants/objectionRoutes';

/** SYEIA-2939: everyone the organisation or representative is objecting for, one row each. */
const ObjectorNamesSummaryCard: React.FC<{ objectorNames: string[] }> = ({ objectorNames }) => {
  const names = objectorNames.length ? objectorNames : [NOT_PROVIDED];
  return (
    <ObjectionSummaryCard
      title="Objector names"
      changeTo={changeLink(OBJECTION_ROUTES.OBJECTOR_NAMES)}
      rows={names.map((name, index) => ({ id: `objector-name-${index}`, label: `Objector ${index + 1}`, value: name }))}
    />
  );
};

export default ObjectorNamesSummaryCard;
