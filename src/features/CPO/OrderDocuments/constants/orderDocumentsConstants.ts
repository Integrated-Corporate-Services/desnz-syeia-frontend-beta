import type { UploadStep } from '../types/orderDocuments';

export const DOCUMENT_STEPS = ['order', 'reasons', 'additional', 'check'] as const;
export const DOCUMENT_CATEGORIES: Record<UploadStep, string> = {
  order: 'CPO_ORDER_DOCUMENTS', maps: 'CPO_ORDER_MAPS', reasons: 'CPO_STATEMENT_OF_REASONS', additional: 'CPO_ADDITIONAL_DOCUMENTS',
};
export const ORDER_DOCUMENTS_COPY: Record<UploadStep, { heading: string; description: string; uploadTitle: string; hint: string; guidanceTitle: string; points: string[] }> = {
  order: {
    heading: 'Upload the order documents', description: 'The order documents include:',
    uploadTitle: 'Upload an order document', hint: 'Upload them as separate files.', guidanceTitle: 'Order and map requirements',
    points: ['the digitally certified order', 'all digitally certified order maps'],
  },
  maps: {
    heading: 'Upload the order maps', description: 'The order maps show which land the order affects. They form part of the order, so they must be sealed and dated on the same day.',
    uploadTitle: 'Upload the sealed order maps and an unsealed copy', hint: 'Upload each sheet as a separate file. If there is more than one sheet, include a key plan showing how they fit together.', guidanceTitle: 'What the maps must show',
    points: ['Ordnance Survey mapping at 1:1250 or better, 1:2500 in rural areas, 1:500 in densely built-up areas', 'every plot numbered to match the schedule', 'land to be acquired, land for new rights and exchange land shown differently: by convention pink, blue and green', 'a heading matching paragraph 2 of the order'],
  },
  reasons: {
    heading: 'Upload the statement of reasons and related documents', description: 'Related documents include all documents referred to in the statement of reasons.',
    uploadTitle: 'Upload the statement of reasons and related documents', hint: '', guidanceTitle: 'What to cover',
    points: ['the order land: where it is and how it is used now', 'the power you are using: section 10 of and Schedule 3 to the Electricity Act 1989', 'why compulsory powers are justified in the public interest', 'your human rights and Public Sector Equality Duty assessment', 'the planning position, funding and any consent the scheme still needs', 'what you have done to buy the land or rights by agreement', 'any related application that needs a coordinated decision'],
  },
  additional: {
    heading: 'Upload any additional documents (optional)', description: 'You can upload any additional documents such as:', uploadTitle: 'Upload an additional document (optional)',
    hint: '', guidanceTitle: 'Examples of additional documents',
    points: ['a general certificate', 'a protected assets certificate and any related documents', 'additional information you believe is relevant to this application'],
  },
};

export const DOCUMENT_GROUP_CATEGORIES = {
  order: ['CPO_ORDER_DOCUMENTS', 'CPO_ORDER', 'CPO_ORDER_MAPS'],
  reasons: ['CPO_STATEMENT_OF_REASONS'],
  additional: ['CPO_ADDITIONAL_DOCUMENTS'],
};
export const ORDER_DOCUMENTS_SUMMARY_LABELS: Record<UploadStep, string> = {
  order: 'The order documents', maps: 'The order maps', reasons: 'Statement of reasons and related documents', additional: 'Additional documents (optional)',
};
