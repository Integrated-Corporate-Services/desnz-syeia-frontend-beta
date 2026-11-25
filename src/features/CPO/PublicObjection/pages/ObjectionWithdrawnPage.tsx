import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import ObjectionReferencesTable from '../components/ObjectionReferencesTable';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { OBJECTION_MESSAGES } from '../constants/objectionContent';
import { ObjectionJourneyMissing, publicObjectionService } from '../services/publicObjectionService';
import type { ObjectionSubmission } from '../types/objectionJourney';

/** SYEIA-2946: confirmation that the objection(s) were withdrawn, with what happens next. */
const ObjectionWithdrawnPage: React.FC = () => {
  const navigate = useNavigate();
  const [withdrawn, setWithdrawn] = useState<ObjectionSubmission | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    publicObjectionService.getWithdrawn()
      .then((loaded) => { if (active) setWithdrawn(loaded); })
      .catch((failure) => {
        if (!active) return;
        if (failure instanceof ObjectionJourneyMissing) navigate(OBJECTION_ROUTES.REFERENCE, { replace: true });
        else setError((failure as Error).message || OBJECTION_MESSAGES.SERVICE_ERROR);
      });
    return () => { active = false; };
  }, [navigate]);

  if (error) return <p className="govuk-body">{error}</p>;
  if (!withdrawn) return null;

  const multiple = withdrawn.objections.length > 1;
  const title = multiple ? 'Objections withdrawn' : 'Objection withdrawn';
  const organisation = withdrawn.organisation || 'the organisation that made the order';

  return (
    <>
      <PageTitle title={title} />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-panel govuk-panel--confirmation govuk-!-margin-top-6">
            <h1 className="govuk-panel__title">{title}</h1>
          </div>
          {multiple && <ObjectionReferencesTable objections={withdrawn.objections} />}
          <p className="govuk-body">
            {multiple ? 'You will receive an email to confirm these objections have been withdrawn.' : (
              <>
                You will receive an email to confirm the objection{' '}
                <strong>{withdrawn.objections[0]?.objectionReference}</strong> has been withdrawn.
              </>
            )}
          </p>
          <h2 className="govuk-heading-m">What happens next</h2>
          <p className="govuk-body">
            We will tell {organisation} that you have withdrawn your {multiple ? 'objections' : 'objection'}.
          </p>
          <p className="govuk-body">
            {multiple
              ? 'Your objections stay on record, but they will not be considered in the decision on the CPO.'
              : 'Your objection stays on record, but it will not be considered in the decision on the CPO.'}
          </p>
          <p className="govuk-body">
            <Link className="govuk-link" to={OBJECTION_ROUTES.START}>Submit or withdraw another objection to a CPO</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ObjectionWithdrawnPage;
