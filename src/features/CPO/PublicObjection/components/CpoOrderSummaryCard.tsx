import React from 'react';
import ObjectionSummaryCard from './ObjectionSummaryCard';

/** SYEIA-2933 / SYEIA-2946: the CPO being objected to. */
const CpoOrderSummaryCard: React.FC<{ reference: string; title: string }> = ({ reference, title }) => (
  <ObjectionSummaryCard
    title="Compulsory purchase order"
    rows={[
      { label: 'Order reference', value: reference },
      { label: 'Order title', value: title },
    ]}
  />
);

export default CpoOrderSummaryCard;
