import type { OrderDetails, RelatedType } from '../types/orderDetails';

export const ORDER_STEPS = ['name', 'purpose', 'special-land', 'exchange-land', 'related-applications', 'add-related-application', 'related-applications-list', 'check'] as const;
export const EMPTY_ORDER_DETAILS: OrderDetails = {
  orderName: '', purpose: '', includesSpecialLand: null, exchangeLand: null,
  hasRelatedApplications: null, relatedApplications: [],
};
export const RELATED_TYPE_LABELS: Record<RelatedType, string> = {
  DCO: 'Development consent order (DCO)', S37: 'Overhead line consent (Section 37)',
  CPO: 'Another compulsory purchase order for this project', OTHER: 'Other', '': 'Not answered',
};