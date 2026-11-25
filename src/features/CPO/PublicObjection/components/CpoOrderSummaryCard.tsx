import React from 'react';
import ObjectionSummaryCard from './ObjectionSummaryCard';

/** SYEIA-2933 / SYEIA-2946: the CPO being objected to. */
const CpoOrderSummaryCard: React.FC<{ title: string }> = ({ title }) => (
  <ObjectionSummaryCard title="Compulsory purchase order" rows={[{ label: 'Order title', value: title }]} />
);

export default CpoOrderSummaryCard;
