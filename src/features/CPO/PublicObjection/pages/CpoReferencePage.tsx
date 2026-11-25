import React, { useState } from 'react';
import Details from '../../../../components/Details';
import ObjectionPage from '../components/ObjectionPage';
import QuestionInput from '../components/QuestionInput';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Enter the CPO reference number';

/** SYEIA-2924: find the CPO the user wants to object to. */
const CpoReferencePage: React.FC = () => {
  const { saving, errors, errorFor, save, navigate } = useObjectionForm({ loadJourney: false });
  const [reference, setReference] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await save(() => publicObjectionService.start(reference))) navigate(OBJECTION_ROUTES.ACTION);
  };

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.START} errors={errors}>
      <form onSubmit={submit} noValidate>
        <QuestionInput
          id="reference"
          label={HEADING}
          hint="For example CPO000001"
          widthClass="govuk-input--width-10"
          value={reference}
          onChange={setReference}
          error={errorFor('reference')}
        />
        <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
      </form>
      <Details id="where-to-find-reference" summary="Where to find the CPO reference number">
        <p className="govuk-body">
          You can find the CPO reference number on public notices published by the electricity or gas license holder.
          They are published online, in local newspapers and posted on or near the land.
        </p>
      </Details>
    </ObjectionPage>
  );
};

export default CpoReferencePage;
