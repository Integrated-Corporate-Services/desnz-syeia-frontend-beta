import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Details from '../../../../components/Details';
import ObjectionPage from '../components/ObjectionPage';
import QuestionInput from '../components/QuestionInput';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { publicObjectionService } from '../services/publicObjectionService';
import '../../styles/cpo.css';

const HEADING = 'Enter the security code';

/** SYEIA-2929: verify the email address with the 6-digit security code. */
const CheckYourEmailPage: React.FC = () => {
  const { journey, saving, errors, errorFor, clearError, save, navigate } = useObjectionForm();
  const [securityCode, setSecurityCode] = useState('');
  const [codeResent, setCodeResent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCodeResent(false);
    const verified = await save(() => publicObjectionService.verifySecurityCode(securityCode));
    if (verified) navigate(verified.action === 'withdraw' ? OBJECTION_ROUTES.WITHDRAW : OBJECTION_ROUTES.ADDRESS);
  };

  const resend = async () => {
    setCodeResent(false);
    if (await save(() => publicObjectionService.resendSecurityCode())) {
      setSecurityCode('');
      setCodeResent(true);
    }
  };

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.EMAIL} errors={errors}>
      {codeResent && journey && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="alert" aria-labelledby="code-sent-title">
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title" id="code-sent-title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-notification-banner__heading">We have sent a new security code to {journey.email}</p>
          </div>
        </div>
      )}
      {journey && (
        <>
          <span className="govuk-caption-l">Order {journey.reference}</span>
          <h1 className="govuk-heading-l">{HEADING}</h1>
          <p className="govuk-body">
            We have sent a security code to {journey.email}. This code expires in {journey.securityCodeExpiryMinutes} minutes.
          </p>
          <form onSubmit={submit} noValidate>
            <QuestionInput
              id="security-code"
              label="Enter the 6-digit security code"
              isPageHeading={false}
              widthClass="govuk-input--width-10"
              autoComplete="one-time-code"
              inputMode="numeric"
              value={securityCode}
              onChange={(value) => { setSecurityCode(value); clearError('security-code'); }}
              error={errorFor('security-code')}
            />
            <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
          </form>
          <Details id="email-not-received" summary="Email not received?">
            <p className="govuk-body">
              It can take a few minutes for the email to arrive. Check your spam or junk folder if you cannot find it.
            </p>
            <p className="govuk-body">
              <button className="govuk-link cpo-notice-text-action" type="button" disabled={saving} onClick={() => void resend()}>
                Send a new code
              </button>
            </p>
            <p className="govuk-body">
              <Link className="govuk-link" to={OBJECTION_ROUTES.EMAIL}>Change your email address</Link> if it is not correct.
            </p>
          </Details>
        </>
      )}
    </ObjectionPage>
  );
};

export default CheckYourEmailPage;
