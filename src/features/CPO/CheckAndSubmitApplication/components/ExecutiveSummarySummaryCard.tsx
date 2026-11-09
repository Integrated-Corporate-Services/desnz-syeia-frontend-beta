import React from 'react';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import { fileList, summaryFiles, type FileListOptions } from '../utils/answerDisplay';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from './SummaryList';

interface Props {
  order: CpoAnswers['order'];
  changeUrl?: string;
  fileOptions: FileListOptions;
}

export const ExecutiveSummarySummaryCard: React.FC<Props> = ({ order, changeUrl, fileOptions }) => (
  <SummaryCard title="Executive summary" changeUrl={changeUrl}>
    <SummaryRow label="Executive summary">{fileList(summaryFiles(order.documents), fileOptions)}</SummaryRow>
  </SummaryCard>
);

export default ExecutiveSummarySummaryCard;
