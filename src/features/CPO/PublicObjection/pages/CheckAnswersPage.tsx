import React from 'react';
import ObjectionPage from '../components/ObjectionPage';
import CpoOrderSummaryCard from '../components/CpoOrderSummaryCard';
import ObjectorDetailsSummaryCard from '../components/ObjectorDetailsSummaryCard';
import ObjectorNamesSummaryCard from '../components/ObjectorNamesSummaryCard';
import ObjectionDetailsSummaryCard from '../components/ObjectionDetailsSummaryCard';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Check your answers before you submit your objection';

/** SYEIA-2933 / SYEIA-2939: every answer with a Change link, then submit. Missing answers link to the row that fixes them. */
const CheckAnswersPage: React.FC = () => {
  const { journey, saving, errors, act, navigate } = useObjectionForm();
  const namesNeeded = journey?.objectorType === 'organisation' || journey?.objectorType === 'representative';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await act(() => publicObjectionService.submit())) navigate(OBJECTION_ROUTES.SUBMITTED);
  };

  return (
    <ObjectionPage title={HEADING} backTo={namesNeeded ? OBJECTION_ROUTES.OBJECTOR_NAMES : OBJECTION_ROUTES.OBJECTION} errors={errors}>
      {journey && (
        <>
          <span className="govuk-caption-l">Order {journey.reference}</span>
          <h1 className="govuk-heading-l">{HEADING}</h1>
          <CpoOrderSummaryCard reference={journey.reference} title={journey.title} />
          <ObjectorDetailsSummaryCard journey={journey} />
          {namesNeeded && <ObjectorNamesSummaryCard objectorNames={journey.objectorNames} />}
          <ObjectionDetailsSummaryCard journey={journey} />
          <form onSubmit={submit} noValidate>
            <button className="govuk-button" type="submit" disabled={saving}>Submit objection</button>
          </form>
        </>
      )}
    </ObjectionPage>
  );
};

export default CheckAnswersPage;
