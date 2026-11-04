import type { ProjectOverview } from '../types/projectOverview';

export const EMPTY_PROJECT_OVERVIEW: ProjectOverview = { projectName: '', projectSummary: '' };

export const PROJECT_NAME_MAX_LENGTH = 400;
export const PROJECT_SUMMARY_MAX_LENGTH = 4000;

export const PROJECT_OVERVIEW_COPY = {
  heading: 'Project overview',
  projectNameLabel: 'Enter the name of the project that requires this CPO',
  projectSummaryLabel: 'Summarise the project',
  projectSummaryHint: 'Provide a brief summary of the project that this CPO application supports.',
} as const;

export const PROJECT_OVERVIEW_ERRORS = {
  projectNameRequired: 'Enter the name of the project that requires this CPO',
  projectNameMax: 'Project name must be 400 characters or fewer',
  projectSummaryRequired: 'Summarise the project',
  projectSummaryMax: 'Project summary must be 4,000 characters or fewer',
} as const;
