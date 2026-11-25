import React, { useEffect, useState } from 'react';
import ObjectionPage from '../components/ObjectionPage';
import QuestionInput from '../components/QuestionInput';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Enter your full name';

/** SYEIA-2926: the objector's full name. */
const ObjectorNamePage: React.FC = () => {
  const { journey, saving, errors, errorFor, save, navigate } = useObjectionForm();
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (journey?.fullName) setFullName(journey.fullName);
  }, [journey?.fullName]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await save(() => publicObjectionService.saveFullName(fullName))) navigate(OBJECTION_ROUTES.EMAIL);
  };

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.ACTION} errors={errors}>
      {journey && (
        <form onSubmit={submit} noValidate>
          <QuestionInput
            id="full-name"
            caption={`Order ${journey.reference}`}
            label={HEADING}
            autoComplete="name"
            value={fullName}
            onChange={setFullName}
            error={errorFor('full-name')}
          />
          <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
        </form>
      )}
    </ObjectionPage>
  );
};

export default ObjectorNamePage;
