import type { OrderDetails, OrderStep, RelatedApplication, RelatedType } from '../types/orderDetails';

export const ORDER_STEPS = ['name', 'purpose', 'special-land', 'exchange-land', 'related-applications', 'add-related-application', 'related-applications-list', 'check'] as const;

export const EMPTY_ORDER_DETAILS: OrderDetails = {
  orderName: '', purpose: '', includesSpecialLand: null, exchangeLand: null,
  hasRelatedApplications: null, relatedApplications: [],
};

export const RELATED_TYPE_LABELS: Record<RelatedType, string> = {
  DCO: 'Development consent order (DCO)', S37: 'Overhead line consent (Section 37)',
  CPO: 'Another compulsory purchase order for this project', OTHER: 'Other', '': 'Not answered',
};

export const RELATED_TYPES = ['DCO', 'S37', 'CPO', 'OTHER'] as const;

export const ORDER_COPY: Record<OrderStep, { heading: string; hint?: string }> = {
  name: { heading: 'Enter the order title', hint: 'Use exactly the same title used in the certified order.' },
  purpose: { heading: 'Explain what the order is for', hint: 'Describe the rights you seek and why, similar to the summary on your order.' },
  'special-land': { heading: 'Does the order include common land, open space, or a fuel or field garden allotment?', hint: 'This decides which prescribed form your order must use, and whether you need a certificate under section 19 of the Acquisition of Land Act 1981.' },
  'exchange-land': { heading: 'Are you providing land in exchange?', hint: 'Exchange land is land given in place of the common land, open space or allotment being acquired.' },
  'related-applications': { heading: 'Are there any other applications related to this one?', hint: 'For example, a development consent order, a Section 37 consent, or another compulsory purchase order for this project.' },
  'add-related-application': { heading: 'Add a related application' },
  'related-applications-list': { heading: 'Related applications' },
  check: { heading: 'Check the order details' },
};

// Aliases for backwards/alternative naming
export const COPY = ORDER_COPY;
export const ORDER_HEADINGS = ORDER_COPY;
export const ORDER_STEP_COPY = ORDER_COPY;

export const emptyRelated = (): RelatedApplication => ({
  id: crypto.randomUUID(), type: '', otherType: '', reference: '', siteAddress: '', relationship: '',
});

export const EMPTY_RELATED_APPLICATION = emptyRelated;
export const createEmptyRelatedApplication = emptyRelated;

// Character limits
export const ORDER_NAME_MAX_LENGTH = 500;
export const PURPOSE_MAX_LENGTH = 4000;
export const OTHER_TYPE_MAX_LENGTH = 200;
export const REFERENCE_MAX_LENGTH = 200;
export const SITE_ADDRESS_MAX_LENGTH = 1000;
export const RELATIONSHIP_MAX_LENGTH = 1000;