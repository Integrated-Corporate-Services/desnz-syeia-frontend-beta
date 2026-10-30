import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';
import { cpoOrderDetailsService } from '../../OrderDetails/services/cpoOrderDetailsService';
import type { OrderDetailsResponse } from '../../OrderDetails/types/orderDetails';
import { cpoOrderDocumentsService } from '../../OrderDocuments/services/cpoOrderDocumentsService';
import type { OrderDocumentsResponse } from '../../OrderDocuments/types/orderDocuments';
import { cpoNoticesService } from '../../RecordNotices/services/cpoNoticesService';
import type { NoticesResponse } from '../../RecordNotices/types/notices';

export type PreSubmissionMeetingAnswer =
  | 'Yes, I’ve had this meeting'
  | 'No, I would like a pre-application meeting'
  | 'No, I don’t need this meeting';

export interface CpoApplication {
  type: string;
  status: string;
  desnz_ref?: string | null;
  operator_ref?: string | null;
  pre_submission_meeting_requested?: boolean | null;
  pre_submission_meeting_answer?: PreSubmissionMeetingAnswer | null;
  pre_submission_meeting_reason?: string;
  additional_contact?: string | string[];
  permissions?: { canEdit?: boolean; canDownload?: boolean; canSubmit?: boolean; canWithdraw?: boolean };
  application_party?: {
    organisation_name?: string;
    contact_person_name?: string;
    contact_person_line1?: string;
    contact_person_line2?: string;
    contact_person_city?: string;
    contact_person_county?: string;
    contact_person_postcode?: string;
    contact_person_email?: string;
    contact_person_phone?: string;
    additional_contact?: string | string[] | null;
  };
}

export interface CpoAnswers {
  application: CpoApplication;
  order: OrderDetailsResponse;
  documents: OrderDocumentsResponse;
  notices: NoticesResponse;
  progress: { subsection_name: string; status: string }[];
}

/** Loads the latest saved answers for every CPO section. Any failed read leaves no partial data. */
export const useCpoApplicationAnswers = (applicationId: string) => {
  const [data, setData] = useState<CpoAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setData(null);
    Promise.all([
      applicationApiService.getApplicationById(applicationId),
      cpoOrderDetailsService.get(applicationId),
      cpoOrderDocumentsService.get(applicationId),
      cpoNoticesService.get(applicationId),
      progressApiService.fetchApplicationProgress(applicationId),
    ]).then(([application, order, documents, notices, progress]) => {
      if (application.type !== 'CPO') throw new Error('Compulsory purchase order application not found');
      if (active) setData({ application, order, documents, notices, progress });
    }).catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : 'Unable to load your answers. Try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [applicationId, attempt]);

  return { data, loading, error, setError, retry: () => setAttempt((current) => current + 1) };
};
