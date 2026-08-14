import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getCurrentUserOrganisationSelection,
  OrganisationOption,
  submitCurrentUserOrganisationRequest,
} from '../services/yourDetailsService';

type FormErrors = {
  organisationIds?: string;
  submit?: string;
};

const ChangeOrganisationsPage: React.FC = () => {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approvedOrganisations, setApprovedOrganisations] = useState<OrganisationOption[]>([]);
  const [pendingOrganisations, setPendingOrganisations] = useState<OrganisationOption[]>([]);
  const [availableOrganisations, setAvailableOrganisations] = useState<OrganisationOption[]>([]);
  const [selectedOrganisationIds, setSelectedOrganisationIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadOrganisations = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUserOrganisationSelection();
        setApprovedOrganisations(response.approvedOrganisations || []);
        setPendingOrganisations(response.pendingOrganisations || []);
        setAvailableOrganisations(response.availableOrganisations || []);
      } catch {
        setErrors({ submit: 'Unable to load organisations right now.' });
      } finally {
        setLoading(false);
      }
    };

    loadOrganisations();
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [errors]);

  const errorList = useMemo(() => {
    const list: Array<{ fieldId: string; message: string }> = [];

    if (errors.organisationIds) {
      list.push({ fieldId: 'organisationIds', message: errors.organisationIds });
    }
    if (errors.submit) {
      list.push({ fieldId: 'submit-error', message: errors.submit });
    }

    return list;
  }, [errors]);

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};

    // Only require selection if there are organisations available to select
    if (availableOrganisations.length > 0 && selectedOrganisationIds.length === 0) {
      nextErrors.organisationIds = 'Select at least one organisation';
    }

    return nextErrors;
  };

  const handleCheckboxChange = (organisationId: string) => {
    setSelectedOrganisationIds((current) =>
      current.includes(organisationId)
        ? current.filter((id) => id !== organisationId)
        : [...current, organisationId]
    );

    if (errors.organisationIds) {
      setErrors((current) => ({ ...current, organisationIds: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // If no organisations available to select, proceed directly to confirmation
    if (availableOrganisations.length === 0) {
      navigate('/your-details/change-organisations/confirmation');
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      await submitCurrentUserOrganisationRequest({
        organisationIds: selectedOrganisationIds,
      });
      navigate('/your-details/change-organisations/confirmation');
    } catch (err) {
      const error = err as Error & {
        validationErrors?: Record<string, string>;
      };

      if (error.validationErrors) {
        setErrors({
          organisationIds: error.validationErrors.organisationIds,
        });
      } else {
        setErrors({ submit: error.message || 'Unable to submit your changes right now.' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
            <div className="govuk-width-container">
              <Link className="govuk-back-link" to="/your-details">
          Back
        </Link>

        {loading && <p className="govuk-body">Loading...</p>}

        {!loading && (
          <>
            {errorList.length > 0 && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
                ref={errorSummaryRef}
              >
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {errorList.map((item) => (
                      <li key={item.fieldId}>
                        <a href={`#${item.fieldId}`}>{item.message}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit}>
              <div
                className={`govuk-form-group${errors.organisationIds ? ' govuk-form-group--error' : ''}`}
              >
                <fieldset className="govuk-fieldset" aria-describedby="organisations-hint">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      Select all the new organisations you will submit applications for
                    </h1>
                  </legend>

                  <p id="organisations-hint" className="govuk-body">
                    You must select all the new organisations you will submit applications for.
                  </p>

                  {errors.organisationIds && (
                    <p id="organisationIds-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span> {errors.organisationIds}
                    </p>
                  )}

                  <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                    {availableOrganisations.map((org) => (
                      <div key={org.organisationId} className="govuk-checkboxes__item">
                        <input
                          className="govuk-checkboxes__input"
                          id={`org-${org.organisationId}`}
                          name="organisationIds"
                          type="checkbox"
                          value={org.organisationId}
                          checked={selectedOrganisationIds.includes(org.organisationId)}
                          onChange={() => handleCheckboxChange(org.organisationId)}
                          aria-describedby={errors.organisationIds ? 'organisationIds-error' : undefined}
                        />
                        <label
                          className="govuk-label govuk-checkboxes__label"
                          htmlFor={`org-${org.organisationId}`}
                        >
                          {org.organisationName}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-font-weight-bold">
                  Selecting new organisations: their team coordinator must approve your access before
                  you can view or submit their applications.
                </p>
              </div>

              <details className="govuk-details" data-module="govuk-details">
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">
                    Organisations you have previously selected
                  </span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">Approved organisations:</p>
                  {approvedOrganisations.length > 0 ? (
                    <ul className="govuk-list govuk-list--bullet">
                      {approvedOrganisations.map((org) => (
                        <li key={`approved-${org.organisationId}`}>{org.organisationName}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="govuk-body">None</p>
                  )}

                  <p className="govuk-body">Organisations waiting for approval:</p>
                  {pendingOrganisations.length > 0 ? (
                    <ul className="govuk-list govuk-list--bullet">
                      {pendingOrganisations.map((org) => (
                        <li key={`pending-${org.organisationId}`}>{org.organisationName}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="govuk-body">None</p>
                  )}

                  <p className="govuk-body">
                    To remove an organisation you must contact their team coordinator directly.
                  </p>
                </div>
              </details>

              <button type="submit" className="govuk-button" disabled={saving}>
                {saving ? 'Saving...' : 'Save and continue'}
              </button>
            </form>
          </>
        )}
          </div>
    </>
  );
};

export default ChangeOrganisationsPage;
