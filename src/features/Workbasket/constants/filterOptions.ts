export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Select option' },
  { value: 'draft', label: 'Draft' },
  { value: 'payment pending', label: 'Payment pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'on hold', label: 'On hold' },
  { value: 'granted', label: 'Granted' },
  { value: 'declined', label: 'Declined' },
];

export const DATE_FILTER_OPTIONS = [
  { value: '', label: 'Select date' },
  { value: 'last-7-days', label: 'Last 7 days' },
  { value: 'last-14-days', label: 'Last 14 days' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-12-months', label: 'Last 12 months' },
];

export const DATE_FILTER_DAYS = {
  'last-7-days': 7,
  'last-14-days': 14,
  'last-month': 30,
  'last-12-months': 365,
} as const;
