import type { OrderDocument } from '../../OrderDetails/types/orderDetails';

export type ExecutiveSummaryDocument = OrderDocument;

export type ExecutiveSummaryData = {
  documents: ExecutiveSummaryDocument[];
  canEdit: boolean;
};

export type ExecutiveSummaryFormError = { id: string; message: string };
