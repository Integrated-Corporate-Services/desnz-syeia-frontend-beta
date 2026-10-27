export { default as CpoOrderDetailsPage } from './pages/CpoOrderDetailsPage';
export { default as CpoOrderDetailsNamePage } from './pages/CpoOrderDetailsNamePage';
export { default as CpoOrderDetailsPurposePage } from './pages/CpoOrderDetailsPurposePage';
export { default as CpoOrderDetailsCheckPage } from './pages/CpoOrderDetailsCheckPage';

export { EMPTY_ORDER_DETAILS, ORDER_STEPS, RELATED_TYPE_LABELS } from './constants/orderDetailsConstants';

export { cpoOrderDetailsService, nextOrderStep } from './services/cpoOrderDetailsService';

export type { OrderDetails, OrderDetailsResponse, OrderDocument, OrderStep, RelatedApplication, RelatedType } from './types/orderDetails';
