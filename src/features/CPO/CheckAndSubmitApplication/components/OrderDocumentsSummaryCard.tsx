import React from 'react';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import {
  fileList,
  ORDER_DOCUMENT_CATEGORIES,
  ORDER_DOCUMENT_GROUPS,
  orderFiles,
  type FileListOptions,
} from '../utils/answerDisplay';
import { SummaryCard } from './SummaryCard';
import { SummaryRow } from './SummaryList';

interface Props {
  documents: CpoAnswers['documents'];
  changeUrl?: string;
  fileOptions: FileListOptions;
}

export const OrderDocumentsSummaryCard: React.FC<Props> = ({ documents, changeUrl, fileOptions }) => (
  <SummaryCard title="Order documents" changeUrl={changeUrl}>
    <SummaryRow label="The order documents">
      {fileList(orderFiles(documents.documents, ORDER_DOCUMENT_GROUPS.order), fileOptions)}
    </SummaryRow>
    <SummaryRow label="Statement of reasons and related documents">
      {fileList(orderFiles(documents.documents, [ORDER_DOCUMENT_CATEGORIES.reasons]), fileOptions)}
    </SummaryRow>
    <SummaryRow label="Additional documents (optional)">
      {fileList(orderFiles(documents.documents, [ORDER_DOCUMENT_CATEGORIES.additional]), { ...fileOptions, empty: 'None uploaded' })}
    </SummaryRow>
  </SummaryCard>
);

export default OrderDocumentsSummaryCard;
