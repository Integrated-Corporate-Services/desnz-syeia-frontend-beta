import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import ObjectionReferencesTable from '../components/ObjectionReferencesTable';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { OBJECTION_MESSAGES } from '../constants/objectionContent';
import { ObjectionJourneyMissing, publicObjectionService } from '../services/publicObjectionService';
import type { ObjectionSubmission } from '../types/objectionJourney';

// Approved copy: SYEIA-2942 (one objection) and SYEIA-2934 (one objection per objector).
const COPY = {
  single: {
    title: 'Objection submitted',
    email: 'You will receive an email to confirm this objection has been submitted.',
    shared: 'The objection will be shared with the electricity or gas license holder who made the order. They may contact you to try to resolve it.',
    inquiry: 'If the objection is not resolved, there may be a public inquiry, hearing or written representations procedure to consider it before the Secretary of State makes a decision. We will contact you if this happens.',
    withdraw: 'You can withdraw this objection at any time before a decision on the CPO is made.',
  },
  multiple: {
    title: 'Objections submitted',
    email: 'You will receive an email to confirm these objections have been submitted.',
    shared: 'The objections will be shared with the electricity or gas license holder who made the order. They may contact you to try to resolve them.',
    inquiry: 'If the objections are not resolved, there may be a public inquiry, hearing or written representations procedure to consider them before the Secretary of State makes a decision. We will contact you if this happens.',
    withdraw: 'You can withdraw one or more objections at any time before a decision on the CPO is made.',
  },
};

/** SYEIA-2942 / SYEIA-2934: confirmation with the objection reference(s) and what happens next. */
const ObjectionSubmittedPage: React.FC = () => {
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<ObjectionSubmission | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    publicObjectionService.getSubmission()
      .then((loaded) => { if (active) setSubmission(loaded); })
      .catch((failure) => {
        if (!active) return;
        if (failure instanceof ObjectionJourneyMissing) navigate(OBJECTION_ROUTES.REFERENCE, { replace: true });
        else setError((failure as Error).message || OBJECTION_MESSAGES.SERVICE_ERROR);
      });
    return () => { active = false; };
  }, [navigate]);

  if (error) return <p className="govuk-body">{error}</p>;
  if (!submission) return null;

  const multiple = submission.objections.length > 1;
  const copy = multiple ? COPY.multiple : COPY.single;

  return (
    <>
      <PageTitle title={copy.title} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-top-6">
            <h1 className="govuk-panel__title">{copy.title}</h1>
            <div className="govuk-panel__body">
              {multiple ? 'Each objector has their own objection reference' : (
                <>Your objection reference number is<br />{submission.objections[0]?.objectionReference}</>
              )}
            </div>
          </div>
          {multiple && <ObjectionReferencesTable objections={submission.objections} />}
          <h2 className="govuk-heading-m">What happens next</h2>
          <p className="govuk-body">{copy.email}</p>
          <p className="govuk-body">{copy.shared}</p>
          <p className="govuk-body">{copy.inquiry}</p>
          <h2 className="govuk-heading-m">If you want to withdraw an objection</h2>
          <p className="govuk-body">{copy.withdraw}</p>
          <p className="govuk-body">
            <Link className="govuk-link" to={OBJECTION_ROUTES.START}>Submit or withdraw another objection to a CPO</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ObjectionSubmittedPage;
