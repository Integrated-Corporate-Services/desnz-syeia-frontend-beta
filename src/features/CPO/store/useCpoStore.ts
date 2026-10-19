import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Application, ApplicationParty } from '../../../types/application';
import { EMPTY_ORDER_DETAILS } from '../OrderDetails/constants/orderDetailsConstants';
import type { OrderDetails, OrderDetailsResponse } from '../OrderDetails/types/orderDetails';
import { DOCUMENT_GROUP_CATEGORIES } from '../OrderDocuments/constants/orderDocumentsConstants';
import type { CpoDocument, DocumentStep, OrderDocumentsResponse } from '../OrderDocuments/types/orderDocuments';
import { NOTICE_CATEGORIES } from '../RecordNotices/constants/noticesConstants';
import type { NoticeAnswer, NoticesResponse, NoticeStep } from '../RecordNotices/types/notices';
import { inspectionAddresses, validNoticeDate } from '../RecordNotices/utils/noticeRecord';
import { CPO_SUBSECTIONS } from '../TaskList/constants/cpoTaskListConstants';
import type { CpoProgressItem } from '../TaskList/types/cpoTaskList';
import type { CpoMeetingAnswer } from '../PreApplicationMeeting/types/preSubmissionMeeting';
import { LOCAL_USER_ID, OBJECTIONS_EMAIL } from './constants';

type Progress = 'Completed' | 'In progress' | 'Not completed';

export interface CpoApplicationRecord {
  application_id: string;
  desnz_ref: string;
  operator_ref: string;
  created_by: string;
  created_at: string;
  application_party?: ApplicationParty;
  pre_submission_meeting_requested: boolean | null;
  pre_submission_meeting_answer: CpoMeetingAnswer | null;
  pre_submission_meeting_reason: string;
  pre_submission_meeting_requested_at: string | null;
  pre_submission_meeting_completed_at: string | null;
  orderDetails: OrderDetails;
  notices: Partial<Record<NoticeStep, NoticeAnswer>>;
  documents: CpoDocument[];
  progress: Record<string, Progress>;
}

export type CpoApplication = Application & Pick<CpoApplicationRecord,
  'pre_submission_meeting_requested' | 'pre_submission_meeting_answer' | 'pre_submission_meeting_reason'
  | 'pre_submission_meeting_requested_at' | 'pre_submission_meeting_completed_at'> & {
  cpo_publicity: { requirements?: NoticeAnswer; check?: NoticeAnswer };
};

export interface ApplicantProgressRow { subsection_name: string; status: string }

// Subsections whose progress lives in the backend; syncApplicant copies it in.
const BACKEND_SUBSECTIONS: string[] = [
  CPO_SUBSECTIONS.APPLICANT_DETAILS, CPO_SUBSECTIONS.CHECK_APPLICANT_CONTACT_DETAILS, CPO_SUBSECTIONS.EXECUTIVE_SUMMARY,
];

const ORDER_DOCUMENT_CATEGORIES = [...DOCUMENT_GROUP_CATEGORIES.order, ...DOCUMENT_GROUP_CATEGORIES.reasons, ...DOCUMENT_GROUP_CATEGORIES.additional];
const NOTICE_DOCUMENT_CATEGORIES = Object.values(NOTICE_CATEGORIES) as string[];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const hasText = (value?: string) => Boolean(value?.trim());

const createRecord = (applicationId: string, createdBy: string, sequence: number): CpoApplicationRecord => ({
  application_id: applicationId, desnz_ref: `CPO-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`,
  operator_ref: '', created_by: createdBy, created_at: new Date().toISOString(), application_party: undefined,
  pre_submission_meeting_requested: null, pre_submission_meeting_answer: null, pre_submission_meeting_reason: '',
  pre_submission_meeting_requested_at: null, pre_submission_meeting_completed_at: null,
  orderDetails: clone(EMPTY_ORDER_DETAILS), notices: {}, documents: [], progress: {},
});

const toApplication = (record: CpoApplicationRecord): CpoApplication => clone({
  application_id: record.application_id, type: 'CPO', desnz_ref: record.desnz_ref, operator_ref: record.operator_ref,
  operator_name: record.application_party?.organisation_name, status: 'DRAFT', created_by: record.created_by,
  created_at: record.created_at, submitted_at: '', application_party: record.application_party,
  permissions: { canView: true, canEdit: true, canDelete: true, canSubmit: true, canDownload: true, canWithdraw: false },
  pre_submission_meeting_requested: record.pre_submission_meeting_requested,
  pre_submission_meeting_answer: record.pre_submission_meeting_answer,
  pre_submission_meeting_reason: record.pre_submission_meeting_reason,
  pre_submission_meeting_requested_at: record.pre_submission_meeting_requested_at,
  pre_submission_meeting_completed_at: record.pre_submission_meeting_completed_at,
  cpo_publicity: { requirements: record.notices.requirements, check: record.notices.check },
});

const documentsIn = (record: CpoApplicationRecord, categories: readonly string[]) =>
  record.documents.filter((document) => categories.includes(document.category));

const finalObjectionDate = (record: CpoApplicationRecord): string | null => {
  const dates = [record.notices.newspapers?.secondDate, record.notices.site?.completionDate, record.notices.people?.completionDate]
    .filter((value): value is string => Boolean(value) && validNoticeDate(value as string));
  if (!record.notices.newspapers?.secondDate || !record.notices.site?.completionDate || !dates.length) return null;
  const latest = new Date(`${[...dates].sort().pop()}T00:00:00Z`);
  latest.setUTCDate(latest.getUTCDate() + 21);
  return latest.toISOString().slice(0, 10);
};

interface CpoStoreState {
  applications: Record<string, CpoApplicationRecord>;
  referenceCounter: number;
  getApplication: (applicationId: string) => CpoApplication;
  getProgress: (applicationId: string) => CpoProgressItem[];
  syncApplicant: (applicationId: string, application: Partial<Application>, progress: ApplicantProgressRow[]) => void;
  saveMeeting: (applicationId: string, requested: boolean | null, complete: boolean, meeting?: { answer: CpoMeetingAnswer | null; reason: string }) => CpoApplication;
  getOrderDetails: (applicationId: string) => OrderDetailsResponse;
  saveOrderDetails: (applicationId: string, step: string, changes: Partial<OrderDetails>, saveForLater: boolean) => OrderDetailsResponse;
  getOrderDocuments: (applicationId: string) => OrderDocumentsResponse;
  saveOrderDocuments: (applicationId: string, step: DocumentStep, saveForLater: boolean, confirmed: boolean | null) => OrderDocumentsResponse;
  getNotices: (applicationId: string) => NoticesResponse;
  saveNotices: (applicationId: string, step: NoticeStep, answers: NoticeAnswer, saveForLater: boolean) => NoticesResponse;
  reset: () => void;
}

export const useCpoStore = create<CpoStoreState>()(persist((set, get) => {
  // Unknown ids are created on demand so any /cpo/:applicationId/... URL can be opened directly.
  const read = (applicationId: string): CpoApplicationRecord => {
    const existing = get().applications[applicationId];
    if (existing) return existing;
    const sequence = get().referenceCounter + 1;
    const record = createRecord(applicationId, LOCAL_USER_ID, sequence);
    set((state) => ({ applications: { ...state.applications, [applicationId]: record }, referenceCounter: sequence }));
    return record;
  };
  // The recipe may throw to reject a save; nothing is written in that case.
  const update = (applicationId: string, recipe: (record: CpoApplicationRecord) => void): CpoApplicationRecord => {
    const next = clone(read(applicationId));
    recipe(next);
    set((state) => ({ applications: { ...state.applications, [applicationId]: next } }));
    return next;
  };
  const orderDetailsResponse = (record: CpoApplicationRecord): OrderDetailsResponse => clone({
    details: { ...EMPTY_ORDER_DETAILS, ...record.orderDetails },
    documents: [], canEdit: true,
  });
  const orderDocumentsResponse = (record: CpoApplicationRecord): OrderDocumentsResponse => clone({
    orderDetails: { includesSpecialLand: record.orderDetails.includesSpecialLand, exchangeLand: record.orderDetails.exchangeLand },
    documents: documentsIn(record, ORDER_DOCUMENT_CATEGORIES), canEdit: true,
  });
  const noticesResponse = (record: CpoApplicationRecord): NoticesResponse => clone({
    record: record.notices, documents: documentsIn(record, NOTICE_DOCUMENT_CATEGORIES), reference: record.desnz_ref,
    objectionsEmail: OBJECTIONS_EMAIL, finalObjectionDate: finalObjectionDate(record), canEdit: true,
  });
  const demote = (record: CpoApplicationRecord, subsection: string) => {
    if (record.progress[subsection] === 'Completed') record.progress[subsection] = 'In progress';
  };

  return {
    applications: {},
    referenceCounter: 0,

    getApplication: (applicationId) => toApplication(read(applicationId)),

    getProgress: (applicationId) => Object.entries(read(applicationId).progress)
      .map(([subsection_name, status]) => ({ subsection_name, status })),

    syncApplicant: (applicationId, application, progress) => {
      update(applicationId, (draft) => {
        draft.desnz_ref = application.desnz_ref || draft.desnz_ref;
        draft.operator_ref = application.operator_ref ?? draft.operator_ref;
        draft.created_by = application.created_by || draft.created_by;
        draft.created_at = application.created_at || draft.created_at;
        draft.application_party = application.application_party ?? draft.application_party;
        for (const subsection of BACKEND_SUBSECTIONS) {
          const saved = progress.find((item) => item.subsection_name === subsection);
          if (saved) draft.progress[subsection] = saved.status as Progress;
          else delete draft.progress[subsection];
        }
      });
    },

    saveMeeting: (applicationId, requested, complete, meeting) => {
      const record = update(applicationId, (draft) => {
        if (draft.pre_submission_meeting_requested_at) {
          throw new Error('This application can no longer be updated or its meeting request has already been submitted. Refresh the page.');
        }
        const now = new Date().toISOString();
        draft.pre_submission_meeting_requested = requested;
        draft.pre_submission_meeting_answer = meeting?.answer ?? null;
        draft.pre_submission_meeting_reason = meeting?.reason ?? '';
        if (complete) {
          draft.pre_submission_meeting_completed_at = now;
          if (requested === true) draft.pre_submission_meeting_requested_at = now;
          draft.progress[CPO_SUBSECTIONS.PRE_SUBMISSION_MEETING] = 'Completed';
        } else if (requested !== null && draft.progress[CPO_SUBSECTIONS.PRE_SUBMISSION_MEETING] !== 'Completed') {
          draft.progress[CPO_SUBSECTIONS.PRE_SUBMISSION_MEETING] = 'In progress';
        }
      });
      return toApplication(record);
    },

    getOrderDetails: (applicationId) => orderDetailsResponse(read(applicationId)),

    saveOrderDetails: (applicationId, step, changes, saveForLater) => {
      const record = update(applicationId, (draft) => {
        draft.orderDetails = { ...draft.orderDetails, ...changes };
        const { orderName, purpose } = draft.orderDetails;
        const valid = hasText(orderName) && hasText(purpose);
        if (step === 'check' && !saveForLater && valid) {
          draft.orderDetails.completedAt = new Date().toISOString();
          draft.progress[CPO_SUBSECTIONS.ORDER_DETAILS] = 'Completed';
        } else if (draft.progress[CPO_SUBSECTIONS.ORDER_DETAILS] !== 'Completed' || !valid) {
          draft.progress[CPO_SUBSECTIONS.ORDER_DETAILS] = hasText(orderName) || hasText(purpose) ? 'In progress' : 'Not completed';
        }
        if (step === 'special-land' || step === 'exchange-land') demote(draft, CPO_SUBSECTIONS.ORDER_DOCUMENTS);
      });
      return orderDetailsResponse(record);
    },

    getOrderDocuments: (applicationId) => orderDocumentsResponse(read(applicationId)),

    saveOrderDocuments: (applicationId, step, saveForLater, confirmed) => {
      const record = update(applicationId, (draft) => {
        // Required uploads are not enforced for now; only the confirmation at the check step completes the task.
        if (step === 'check' && !saveForLater && confirmed === true) {
          draft.progress[CPO_SUBSECTIONS.ORDER_DOCUMENTS] = 'Completed';
        } else if (draft.progress[CPO_SUBSECTIONS.ORDER_DOCUMENTS] !== 'Completed') {
          draft.progress[CPO_SUBSECTIONS.ORDER_DOCUMENTS] = 'In progress';
        }
      });
      return orderDocumentsResponse(record);
    },

    getNotices: (applicationId) => noticesResponse(read(applicationId)),

    saveNotices: (applicationId, step, answers, saveForLater) => {
      const record = update(applicationId, (draft) => {
        const subsection = CPO_SUBSECTIONS.RECORD_NOTICES;
        if (step === 'check') {
          if (!saveForLater) {
            const problem = draft.notices.requirements?.acknowledged !== true ? 'Read and acknowledge the notice requirements first'
              : !inspectionAddresses(draft.notices.inspection).some((address) => validNoticeDate(address.from)) ? 'Add an inspection address and the date it was made available'
                : !hasText(draft.notices.online?.url) ? 'Enter the website address where the order and maps can be viewed' : '';
            if (problem) throw new Error(problem);
          }
          draft.notices.check = { ...answers, confirmed: !saveForLater };
          draft.progress[subsection] = saveForLater ? 'In progress' : 'Completed';
          return;
        }
        draft.notices[step] = answers;
        // Any change to a publicity answer needs the final check to be confirmed again.
        draft.notices.check = { format: 'reference', confirmed: false };
        draft.progress[subsection] = 'In progress';
      });
      return noticesResponse(record);
    },

    reset: () => set({ applications: {}, referenceCounter: 0 }),
  };
}, {
  name: 'cpo-local-store',
  version: 1,
  storage: createJSONStorage(() => sessionStorage),
}));
