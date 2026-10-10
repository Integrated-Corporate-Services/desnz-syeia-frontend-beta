import { CPO_BASE_URL } from '../../../../constants/cpo';

export const getExecutiveSummaryExitUrl = (applicationId: string, fromApplicationReview: boolean) =>
  `${CPO_BASE_URL}/${applicationId}/${fromApplicationReview ? 'check-and-submit' : 'task-list'}`;
