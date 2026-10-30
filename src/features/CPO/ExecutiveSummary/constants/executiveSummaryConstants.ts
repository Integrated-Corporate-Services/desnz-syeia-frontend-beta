export const EXECUTIVE_SUMMARY_CATEGORY = 'CPO_EXECUTIVE_SUMMARY';
export const EXECUTIVE_SUMMARY_SUBCATEGORY = 'EXECUTIVE_SUMMARY';

export const EXECUTIVE_SUMMARY_COPY = {
  heading: 'Provide the executive summary',
  caption: 'Executive summary',
  hint: 'Use our executive summary template to provide an overview of your proposed order, including the project it supports, the land or rights you want to acquire and why they are needed.',
  uploadTitle: 'Upload your executive summary',
} as const;

export const EXECUTIVE_SUMMARY_DEFAULT_ERROR = 'Unable to load or save the executive summary. Try again.';

export const EXECUTIVE_SUMMARY_ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Sign in again.',
  403: 'You do not have permission to update this application.',
  404: 'Compulsory purchase order application not found.',
  409: 'Only draft compulsory purchase order applications can be updated.',
};
