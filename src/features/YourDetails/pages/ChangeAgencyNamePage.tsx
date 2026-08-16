import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SUCCESS_BANNER_KEY } from '../constants/yourDetails';
import {
  getCurrentUserDetails,
  updateCurrentUserAgencyName,
} from '../services/yourDetailsService';
import PageTitle from '../../../components/PageTitle';

type FormErrors = {
  agencyName?: string;
  submit?: string;
};

const ChangeAgencyNamePage: React.FC = () => {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const details = await getCurrentUserDetails();
        setAgencyName(details.agencyName || '');
      } catch {
        setErrors({ submit: 'Unable to load your details right now.' });
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [errors]);

  const errorList = useMemo(() => {
    const list: Array<{ fieldId: string; message: string }> = [];

    if (errors.agencyName) {
      list.push({ fieldId: 'agencyName', message: errors.agencyName });
    }
    if (errors.submit) {
      list.push({ fieldId: 'submit-error', message: errors.submit });
    }

    return list;
  }, [errors]);

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const trimmedAgencyName = agencyName.trim();

    if (!trimmedAgencyName) {
      nextErrors.agencyName = 'Enter your agency name';
    }

    if (trimmedAgencyName.length > 4000) {
      nextErrors.agencyName = 'You cannot enter more than 4,000 characters';
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      await updateCurrentUserAgencyName({ agencyName: agencyName.trim() });
      sessionStorage.setItem(SUCCESS_BANNER_KEY, 'agency name');
      navigate('/your-details');
    } catch (err) {
      const error = err as Error & {
        validationErrors?: Record<string, string>;
      };

      if (error.validationErrors) {
        setErrors({
          agencyName: error.validationErrors.agencyName,
        });
      } else {
        setErrors({ submit: error.message || 'Unable to save your details right now.' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
            <PageTitle title="Change your agency name" />
            <div className="govuk-width-container">
      <Link className="govuk-back-link" to="/your-details">
        Back
      </Link>

              <h1 className="govuk-heading-l govuk-!-margin-bottom-4">Change your agency name</h1>

        <p className="govuk-body govuk-!-margin-bottom-6">e.g. Fisher German</p>

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
              <div className={`govuk-form-group${errors.agencyName ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label govuk-label--m" htmlFor="agencyName">
                  Agency name
                </label>
                {errors.agencyName && (
                  <p id="agencyName-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.agencyName}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-20${errors.agencyName ? ' govuk-input--error' : ''}`}
                  id="agencyName"
                  name="agencyName"
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  aria-describedby={errors.agencyName ? 'agencyName-error' : undefined}
                />
              </div>

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

export default ChangeAgencyNamePage;
