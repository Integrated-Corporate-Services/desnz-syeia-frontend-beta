import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import { useBreadcrumb } from '../../../../context/BreadcrumbContext';
import { CPO_BASE_URL } from '../../../../constants/cpo';
import { applicationApiService, SubmitApplicationError } from '../../../../services/applicationApiService';
import { CPO_SUBSECTIONS, CPO_TASK_SECTIONS } from '../../TaskList/constants/cpoTaskListConstants';
import CpoApplicationAnswers from '../../shared/components/CpoApplicationAnswers';
import { useCpoApplicationAnswers, type CpoAnswers } from '../../shared/hooks/useCpoApplicationAnswers';
import { useCpoApplicationId } from '../hooks/useCpoApplicationId';

interface ProblemLink {
  text: string;
  href: string;
}

const HEADING = 'Check your answers before sending your application';
const TASKS = CPO_TASK_SECTIONS.flatMap((section) => section.tasks).filter((task) => task.subsection !== CPO_SUBSECTIONS.CHECK_AND_SUBMIT);

// A task is incomplete until its progress is Completed; notices also need the requirements read and the check confirmed.
const incompleteTasks = (data: CpoAnswers) => TASKS.filter((task) =>
  !data.progress.some((item) => item.subsection_name === task.subsection && item.status.toLowerCase() === 'completed')
  || (task.subsection === CPO_SUBSECTIONS.RECORD_NOTICES
    && (data.notices.record.requirements?.acknowledged !== true || data.notices.record.check?.confirmed !== true)));

const CpoCheckYourAnswersPage: React.FC = () => {
  const applicationId = useCpoApplicationId();
  const navigate = useNavigate();
  const { data, loading, error, setError, retry } = useCpoApplicationAnswers(applicationId);
  const [problems, setProblems] = useState<ProblemLink[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const base = `${CPO_BASE_URL}/${applicationId}`;

  useBreadcrumb(<div className="govuk-breadcrumbs"><ol className="govuk-breadcrumbs__list">
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${base}/task-list`}>Task list</Link></li>
    <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" to={`${base}/check-and-submit`}>Check and submit</Link></li>
  </ol></div>);

  const allProblems: ProblemLink[] = error ? [{ text: error, href: '#review-heading' }, ...problems] : problems;
  useEffect(() => { if (allProblems.length) summaryRef.current?.focus(); }, [allProblems.length, error, problems]);
  useEffect(() => { if (!loading && !error) headingRef.current?.focus(); }, [loading, error]);

  const isDraft = data?.application.status.toLowerCase() === 'draft';
  const editable = isDraft && data?.application.permissions?.canEdit === true
    && data.order.canEdit !== false && data.documents.canEdit !== false;
  const canSubmit = isDraft && data?.application.permissions?.canSubmit === true;

  const sectionProblems = (sections: { subsection: string; label: string; slug: string }[]): ProblemLink[] =>
    sections.map((task) => ({ text: `Complete the ${task.label.toLowerCase()} section`, href: `${base}/${task.slug}` }));

  const submit = async () => {
    if (!data || submitting) return;
    setError('');
    const incomplete = incompleteTasks(data);
    if (incomplete.length) { setProblems(sectionProblems(incomplete)); return; }
    setProblems([]);
    setSubmitting(true);
    try {
      await applicationApiService.submitApplication(applicationId);
      navigate(`${base}/application-submitted`);
    } catch (failure) {
      const fromServer = failure instanceof SubmitApplicationError ? failure.incompleteSections : [];
      const tasks = TASKS.filter((task) => fromServer.some((section) => section.label === task.subsection));
      setProblems(tasks.length ? sectionProblems(tasks) : [{ text: 'Your application could not be submitted. Try again.', href: '#submit-application' }]);
      setSubmitting(false);
    }
  };

  return <>
    <PageTitle title={`${allProblems.length ? 'Error: ' : ''}${HEADING}`} />
    <div className="govuk-width-container"><div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
      {allProblems.length > 0 && <div className="govuk-error-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="review-error-title">
        <h2 className="govuk-error-summary__title" id="review-error-title">There is a problem</h2>
        <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">
          {allProblems.map((problem) => <li key={problem.text}>{problem.href.startsWith('#')
            ? <a href={problem.href}>{problem.text}</a>
            : <Link to={problem.href}>{problem.text}</Link>}</li>)}
        </ul></div>
      </div>}
      <span className="govuk-caption-l">Check and submit</span>
      <h1 className="govuk-heading-l" id="review-heading" ref={headingRef} tabIndex={-1}>{HEADING}</h1>
      {loading && <p className="govuk-body" role="status">Loading your answers...</p>}
      {!loading && !data && <button className="govuk-button govuk-button--secondary" type="button" onClick={retry}>Try again</button>}
      {data && <>
        <CpoApplicationAnswers answers={data} applicationId={applicationId} editable={editable}
          onDownloadError={() => setError('Unable to download the document. Try again.')} />
        {canSubmit && <button className="govuk-button govuk-!-margin-top-4" id="submit-application" type="button"
          data-module="govuk-button" disabled={submitting} onClick={() => void submit()}>
          Submit application
        </button>}
      </>}
    </div></div></div>
  </>;
};

export default CpoCheckYourAnswersPage;
