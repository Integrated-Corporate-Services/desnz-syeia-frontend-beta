import React from 'react';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import { NOT_ANSWERED } from '../utils/answerDisplay';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from './SummaryList';

interface Props {
  order: CpoAnswers['order'];
  changeUrl?: string;
}

export const OrderDetailsSummaryCard: React.FC<Props> = ({ order, changeUrl }) => (
  <SummaryCard title="Order details" changeUrl={changeUrl}>
    <SummaryRow label="Enter the order title">{order.details.orderName || NOT_ANSWERED}</SummaryRow>
    <SummaryRow label="Explain what the order is for">{order.details.purpose || NOT_ANSWERED}</SummaryRow>
  </SummaryCard>
);

export default OrderDetailsSummaryCard;
