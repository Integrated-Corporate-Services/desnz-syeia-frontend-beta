import { applicationApiService } from '../../../../services/applicationApiService';
import { EMPTY_ORDER_DETAILS } from '../../OrderDetails/constants/orderDetailsConstants';
import type { OrderDetails, OrderDocument } from '../../OrderDetails/types/orderDetails';
import type { CpoDocument } from '../../OrderDocuments/types/orderDocuments';
import type { NoticesResponse } from '../../RecordNotices/types/notices';
import type { CpoAnswers, CpoApplication } from '../hooks/useCpoApplicationAnswers';

/** GET /api/applications/:applicationId/review for a CPO application, as built by the backend's cpoReviewPayloadBuilder. */
export interface CpoReview {
  applicationId: string;
  status: string;
  desnzRef: string | null;
  formType: string;
  permissions?: CpoApplication['permissions'];
  sections: {
    applicantDetails: { applicationParty: CpoApplication['application_party'] | null; operatorRef: string | null };
    preSubmissionMeeting: {
      answer: CpoApplication['pre_submission_meeting_answer'];
      requested: boolean | null;
      reason: string | null;
    };
    orderDetails: Partial<OrderDetails>;
    executiveSummary: { documents: OrderDocument[] };
    orderDocuments: { order: CpoDocument[]; reasons: CpoDocument[]; additional: CpoDocument[] };
    notices: NoticesResponse;
    progress: CpoAnswers['progress'];
    incompleteSections: { key: string; label: string }[];
    payment: null;
  };
}

/** Maps the review payload onto the answers each CPO section already shows. */
export const toCpoAnswers = (review: CpoReview): CpoAnswers => {
  const { applicantDetails, preSubmissionMeeting, orderDetails, executiveSummary, orderDocuments, notices, progress } = review.sections;
  return {
    application: {
      type: review.formType,
      status: review.status,
      desnz_ref: review.desnzRef,
      operator_ref: applicantDetails.operatorRef,
      pre_submission_meeting_requested: preSubmissionMeeting.requested,
      pre_submission_meeting_answer: preSubmissionMeeting.answer,
      pre_submission_meeting_reason: preSubmissionMeeting.reason ?? undefined,
      application_party: applicantDetails.applicationParty ?? undefined,
      permissions: review.permissions,
    },
    order: { details: { ...EMPTY_ORDER_DETAILS, ...orderDetails }, documents: executiveSummary.documents },
    documents: {
      orderDetails,
      documents: [...orderDocuments.order, ...orderDocuments.reasons, ...orderDocuments.additional],
    },
    notices,
    progress,
  };
};

export const cpoReviewService = {
  get: async (applicationId: string): Promise<CpoAnswers> => {
    const review: CpoReview = await applicationApiService.getApplicationReview(applicationId);
    if (review.formType !== 'CPO') throw new Error('Compulsory purchase order application not found');
    return toCpoAnswers(review);
  },
};