import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageTitle from '../../../../components/PageTitle';
import Details from '../../../../components/Details';
import AccessibleSelect from '../../../../components/commonFormFields/AccessibleSelect';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { useNetworkOperators } from '../hooks/useNetworkOperators';
import { useWhoIsApplyingForm } from '../hooks/useWhoIsApplyingForm';

const CPOWhoIsApplying: React.FC = () => {
  const { user } = useAuthUserContext();
  const [searchParams] = useSearchParams();
  const { submitted, error, saving, loading, loadFailed, organisationId, handleSubmit, clearError } = useWhoIsApplyingForm();
  const { options, selectedOrganisation, selectedOrgName, handleOrgChange } = useNetworkOperators(organisationId);
  const errorSummary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) errorSummary.current?.focus(); }, [error]);

  return (
    <>
      <PageTitle title="Who is applying?" />
      <div className="govuk-width-container">
        <Link className="govuk-back-link govuk-!-margin-bottom-6" to="/choose-application" state={{ applicationType: 'cpo', applicationId: searchParams.get('applicationId') }}>Back</Link>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Who is applying?</h1>
            {submitted && error && (
              <div className="govuk-error-summary govuk-!-margin-bottom-4" role="alert" tabIndex={-1} ref={errorSummary}>
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li><a href="#location">{error}</a></li>
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={event => handleSubmit(event, selectedOrganisation, user)} noValidate>
              <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`} style={{ maxWidth: 500 }}>
                {error && <p id="location-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
                <AccessibleSelect
                  className="govuk-!-width-full govuk-!-font-size-19"
                  id="location"
                  aria-label="Organisation"
                  aria-describedby={error ? 'location-error' : undefined}
                  value={selectedOrgName}
                  onChange={value => { handleOrgChange(value); clearError(); }}
                  disabled={options.length === 0 || saving || loading || loadFailed}
                  required
                  options={[
                    { value: '', text: options.length === 0 ? 'No organisations found' : 'Select option...' },
                    ...options.map(option => ({ value: option.organisation_name, text: option.organisation_name })),
                  ]}
                />
              </div>
              <Details id="organisation-not-listed" summary="The organisation is not listed" style={{ maxWidth: 600, marginTop: '2rem' }}>
                <p>You must contact the team coordinator in your organisation that you want to create an application for to provide you with access to their organisation.</p>
                <p>If you do not know who the team coordinator is then contact the service desk for advice at <a href="mailto:SYEIA.enquiries@energysecurity.gov.uk" className="govuk-link">SYEIA.enquiries@energysecurity.gov.uk</a>.</p>
              </Details>
              <div className="govuk-!-static-margin-top-6">
                <button type="submit" className="govuk-button" data-module="govuk-button" disabled={options.length === 0 || saving || loading || loadFailed}>Continue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CPOWhoIsApplying;
