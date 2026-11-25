import React, { useEffect, useState } from 'react';
import ObjectionPage from '../components/ObjectionPage';
import QuestionInput from '../components/QuestionInput';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';

const HEADING = 'Enter your email address';

/** SYEIA-2928: the email address the security code is sent to (also used by the withdraw journey). */
const ObjectorEmailPage: React.FC = () => {
  const { journey, saving, errors, errorFor, save, navigate } = useObjectionForm();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (journey?.email) setEmail(journey.email);
  }, [journey?.email]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await save(() => publicObjectionService.saveEmail(email))) navigate(OBJECTION_ROUTES.CHECK_EMAIL);
  };

  // Withdrawing skips the name page, so Back goes to the choice of action.
  const backTo = journey?.action === 'withdraw' ? OBJECTION_ROUTES.ACTION : OBJECTION_ROUTES.FULL_NAME;

  return (
    <ObjectionPage title={HEADING} backTo={backTo} errors={errors}>
      {journey && (
        <form onSubmit={submit} noValidate>
          <QuestionInput
            id="email"
            type="email"
            caption={`Order ${journey.reference}`}
            label={HEADING}
            hint="We will send you a security code, which you must enter on the next page"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            error={errorFor('email')}
          />
          <div className="govuk-inset-text">
            If you do not want to share your email address, you can submit objections in writing to the postal
            address included on the public notice.
          </div>
          <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
        </form>
      )}
    </ObjectionPage>
  );
};

export default ObjectorEmailPage;
