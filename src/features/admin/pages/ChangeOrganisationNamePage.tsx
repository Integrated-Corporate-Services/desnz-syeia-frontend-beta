import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { useOrganisation } from '../../../hooks';
import organisationService from '../../../services/organisationService';

const ChangeOrganisationNamePage: React.FC = () => {
  const { organisationId = '' } = useParams<{ organisationId: string }>();
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const { organisation, loading, error: loadError } = useOrganisation(organisationId);
  const [organisationName, setOrganisationName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organisation) setOrganisationName(organisation.organisation_name);
  }, [organisation]);

  useEffect(() => {
    if ((fieldError || submitError || loadError) && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [fieldError, submitError, loadError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = organisationName.trim();
    if (!value || value.length > 255) {
      setFieldError(!value ? 'Enter an organisation name' : 'Organisation name must be 255 characters or fewer');
      return;
    }

    setSaving(true);
    setFieldError('');
    setSubmitError('');
    const result = await organisationService.updateOrganisationName(organisationId, value);
    setSaving(false);

    if (!result.success) {
      setFieldError(result.validationErrors?.organisationName || '');
      setSubmitError(result.validationErrors?.organisationName ? '' : result.message || 'Unable to save organisation name');
      return;
    }

    navigate(`/admin/organisation/${organisationId}/settings`, {
      state: { updatedSection: 'name' },
      replace: true,
    });
  };

  const backPath = `/admin/organisation/${organisationId}/settings`;
  const errorMessage = fieldError || submitError || loadError;

  return (
    <>
      <PageTitle title="Change organisation name" />
      <div className="govuk-width-container">
        <Link className="govuk-back-link" to={backPath}>Back</Link>
        <main className="govuk-main-wrapper govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Change organisation name</h1>
            {errorMessage && (
              <div className="govuk-error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <a href={fieldError ? '#organisationName' : '#submit-error'}>{errorMessage}</a>
                </div>
              </div>
            )}
            {loading ? <p className="govuk-body">Loading...</p> : (
              <form noValidate onSubmit={handleSubmit}>
                <div className={`govuk-form-group${fieldError ? ' govuk-form-group--error' : ''}`}>
                  <label className="govuk-label govuk-label--m" htmlFor="organisationName">Organisation name</label>
                  {fieldError && <p id="organisationName-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {fieldError}</p>}
                  <input className={`govuk-input${fieldError ? ' govuk-input--error' : ''}`} id="organisationName" value={organisationName} onChange={(event) => setOrganisationName(event.target.value)} />
                </div>
                <button className="govuk-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save and continue'}</button>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ChangeOrganisationNamePage;