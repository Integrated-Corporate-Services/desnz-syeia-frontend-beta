import React from 'react';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import type { CpoAnswers } from '../hooks/useCpoApplicationAnswers';
import { changeUrlFor } from '../utils/answerDisplay';
import { ApplicantDetailsSummaryCard } from './ApplicantDetailsSummaryCard';
import { ExecutiveSummarySummaryCard } from './ExecutiveSummarySummaryCard';
import { OrderDetailsSummaryCard } from './OrderDetailsSummaryCard';
import { OrderDocumentsSummaryCard } from './OrderDocumentsSummaryCard';
import { PreApplicationMeetingSummaryCard } from './PreApplicationMeetingSummaryCard';
import { ProjectOverviewSummaryCard } from './ProjectOverviewSummaryCard';
import { RecordNoticesSummaryCard } from './RecordNoticesSummaryCard';

interface CpoApplicationAnswersProps {
  answers: CpoAnswers;
  applicationId: string;
  /** Shows a Change link on each editable card. Applicant details and the pre-application meeting never have one. */
  editable: boolean;
  onDownloadError: () => void;
}

/** Orchestrates the CPO check-your-answers / application-summary subsection cards. */
const CpoApplicationAnswers: React.FC<CpoApplicationAnswersProps> = ({
  answers,
  applicationId,
  editable,
  onDownloadError,
}) => {
  const { application, projectOverview, order, documents, notices } = answers;
  const base = `${CPO_BASE_URL}/${applicationId}`;
  const changeUrl = (path: string) => changeUrlFor(base, path, editable);
  const fileOptions = {
    canDownload: application.permissions?.canDownload === true,
    applicationId,
    onDownloadError,
  };

  return (
    <>
      <h2 className="govuk-heading-m">Applicant details</h2>
      <ApplicantDetailsSummaryCard application={application} />
      <PreApplicationMeetingSummaryCard application={application} noticesReference={notices.reference} />

      <h2 className="govuk-heading-m govuk-!-margin-top-8">Project information</h2>
      <ProjectOverviewSummaryCard projectOverview={projectOverview} changeUrl={changeUrl('project-overview')} />
      <ExecutiveSummarySummaryCard order={order} changeUrl={changeUrl('executive-summary')} fileOptions={fileOptions} />
      <OrderDetailsSummaryCard order={order} changeUrl={changeUrl('order-details/check')} />
      <OrderDocumentsSummaryCard documents={documents} changeUrl={changeUrl('order-documents/check')} fileOptions={fileOptions} />

      <h2 className="govuk-heading-m govuk-!-margin-top-8">Public notices</h2>
      <RecordNoticesSummaryCard notices={notices} changeUrl={changeUrl('record-notices/check')} fileOptions={fileOptions} />
    </>
  );
};

export default CpoApplicationAnswers;
