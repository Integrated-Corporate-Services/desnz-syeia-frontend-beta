export { default as CpoOrderDetailsPage } from './pages/CpoOrderDetailsPage';
export { default as CpoOrderDetailsNamePage } from './pages/CpoOrderDetailsNamePage';
export { default as CpoOrderDetailsPurposePage } from './pages/CpoOrderDetailsPurposePage';
export { default as CpoOrderDetailsCheckPage } from './pages/CpoOrderDetailsCheckPage';

export { EMPTY_ORDER_DETAILS, ORDER_STEPS, RELATED_TYPE_LABELS, COPY, ORDER_COPY, ORDER_HEADINGS, ORDER_STEP_COPY, emptyRelated, EMPTY_RELATED_APPLICATION, createEmptyRelatedApplication, RELATED_TYPES, ORDER_NAME_MAX_LENGTH, PURPOSE_MAX_LENGTH, OTHER_TYPE_MAX_LENGTH, REFERENCE_MAX_LENGTH, SITE_ADDRESS_MAX_LENGTH, RELATIONSHIP_MAX_LENGTH } from './constants/orderDetailsConstants';

export { cpoOrderDetailsService, nextOrderStep } from './services/cpoOrderDetailsService';

export type { OrderDetails, OrderDetailsResponse, OrderDocument, OrderStep, RelatedApplication, RelatedType } from './types/orderDetails';
