import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { useOrganisation } from '../../../hooks';
import organisationService from '../../../services/organisationService';

type AddressErrors = Partial<Record<'line1' | 'townCity' | 'postcode' | 'submit', string>>;
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

const ChangeOrganisationAddressPage: React.FC = () => {
  const { organisationId = '' } = useParams<{ organisationId: string }>();
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const { organisation, loading, error: loadError } = useOrganisation(organisationId);
  const [form, setForm] = useState({ line1: '', line2: '', townCity: '', county: '', postcode: '' });
  const [errors, setErrors] = useState<AddressErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (organisation) {
      setForm({
        line1: organisation.address_line1 || '',
        line2: organisation.address_line2 || '',
        townCity: organisation.town_city || '',
        county: organisation.county || '',
        postcode: organisation.postcode || '',
      });
    }
  }, [organisation]);

  useEffect(() => {
    if ((Object.keys(errors).length || loadError) && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [errors, loadError]);

  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: AddressErrors = {};
    if (!form.line1.trim()) nextErrors.line1 = 'Enter address line 1, typically the building and street';
    if (!form.townCity.trim()) nextErrors.townCity = 'Enter a town or city';
    if (!UK_POSTCODE_REGEX.test(form.postcode.trim())) nextErrors.postcode = 'Enter a full UK postcode';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setErrors({});
    const result = await organisationService.updateOrganisationAddress(organisationId, {
      line1: form.line1.trim(),
      line2: form.line2.trim(),
      townCity: form.townCity.trim(),
      county: form.county.trim(),
      postcode: form.postcode.trim().toUpperCase(),
    });
    setSaving(false);

    if (!result.success) {
      setErrors(result.validationErrors || { submit: result.message || 'Unable to save organisation address' });
      return;
    }
    navigate(`/admin/organisation/${organisationId}/settings`, {
      state: { updatedSection: 'address' },
      replace: true,
    });
  };

  const errorEntries = Object.entries(errors);
  return (
    <>
      <PageTitle title="Change organisation address" />
      <div className="govuk-width-container">
        <Link className="govuk-back-link" to={`/admin/organisation/${organisationId}/settings`}>Back</Link>
        <main className="govuk-main-wrapper govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Change organisation address</h1>
            {(errorEntries.length > 0 || loadError) && (
              <div className="govuk-error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body"><ul className="govuk-list govuk-error-summary__list">
                  {loadError && <li><a href="#submit-error">{loadError}</a></li>}
                  {errorEntries.map(([field, message]) => <li key={field}><a href={`#${field}`}>{message}</a></li>)}
                </ul></div>
              </div>
            )}
            {loading ? <p className="govuk-body">Loading...</p> : (
              <form noValidate onSubmit={handleSubmit}>
                {([
                  ['line1', 'Address line 1', 'address-line1'],
                  ['line2', 'Address line 2 (optional)', 'address-line2'],
                  ['townCity', 'Town or city', 'address-level2'],
                  ['county', 'County (optional)', 'address-level1'],
                  ['postcode', 'Postcode', 'postal-code'],
                ] as const).map(([field, label, autoComplete]) => (
                  <div key={field} className={`govuk-form-group${errors[field as keyof AddressErrors] ? ' govuk-form-group--error' : ''}`}>
                    <label className="govuk-label govuk-label--m" htmlFor={field}>{label}</label>
                    {errors[field as keyof AddressErrors] && <p id={`${field}-error`} className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors[field as keyof AddressErrors]}</p>}
                    <input className={`govuk-input${field === 'postcode' ? ' govuk-input--width-10' : ''}${errors[field as keyof AddressErrors] ? ' govuk-input--error' : ''}`} id={field} autoComplete={autoComplete} value={form[field]} onChange={(event) => updateField(field, event.target.value)} />
                  </div>
                ))}
                <button className="govuk-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save and continue'}</button>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default ChangeOrganisationAddressPage;