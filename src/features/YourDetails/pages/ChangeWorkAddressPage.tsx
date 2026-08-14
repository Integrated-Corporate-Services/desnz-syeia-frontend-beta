import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SUCCESS_BANNER_KEY } from '../constants/yourDetails';
import {
  getCurrentUserDetails,
  UpdateWorkAddressPayload,
  updateCurrentUserWorkAddress,
} from '../services/yourDetailsService';

type FormErrors = {
  line1?: string;
  townCity?: string;
  postcode?: string;
  submit?: string;
};

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

const ChangeWorkAddressPage: React.FC = () => {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [townCity, setTownCity] = useState('');
  const [county, setCounty] = useState('');
  const [postcode, setPostcode] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const details = await getCurrentUserDetails();
        setLine1(details.workAddress.line1 || '');
        setLine2(details.workAddress.line2 || '');
        setTownCity(details.workAddress.townCity || '');
        setCounty(details.workAddress.county || '');
        setPostcode(details.workAddress.postcode || '');
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

    if (errors.line1) {
      list.push({
        fieldId: 'line1',
        message: 'Enter address line 1, typically the building and street',
      });
    }
    if (errors.townCity) {
      list.push({ fieldId: 'townCity', message: 'Enter a town or city' });
    }
    if (errors.postcode) {
      list.push({ fieldId: 'postcode', message: 'Enter a full UK postcode' });
    }
    if (errors.submit) {
      list.push({ fieldId: 'submit-error', message: errors.submit });
    }

    return list;
  }, [errors]);

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const trimmedLine1 = line1.trim();
    const trimmedTownCity = townCity.trim();
    const trimmedPostcode = postcode.trim().toUpperCase();

    if (!trimmedLine1) {
      nextErrors.line1 = 'Enter address line 1, typically the building and street';
    }

    if (!trimmedTownCity) {
      nextErrors.townCity = 'Enter a town or city';
    }

    if (!trimmedPostcode || !UK_POSTCODE_REGEX.test(trimmedPostcode)) {
      nextErrors.postcode = 'Enter a full UK postcode';
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

    const payload: UpdateWorkAddressPayload = {
      line1: line1.trim(),
      line2: line2.trim(),
      townCity: townCity.trim(),
      county: county.trim(),
      postcode: postcode.trim().toUpperCase(),
    };

    try {
      await updateCurrentUserWorkAddress(payload);
      sessionStorage.setItem(SUCCESS_BANNER_KEY, 'work address');
      navigate('/your-details');
    } catch (err) {
      const error = err as Error & {
        validationErrors?: Record<string, string>;
      };

      if (error.validationErrors) {
        setErrors({
          line1: error.validationErrors.line1,
          townCity: error.validationErrors.townCity,
          postcode: error.validationErrors.postcode,
        });
      } else {
        setErrors({ submit: error.message || 'Unable to save your details right now.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveForLater = () => {
    navigate('/your-details');
  };

  return (
    <>
            <div className="govuk-width-container">
      <Link className="govuk-back-link" to="/your-details">
        Back
      </Link>

      <main className="govuk-main-wrapper" id="main-content">
        <h1 className="govuk-heading-l govuk-!-margin-bottom-6">Change your work address</h1>

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
              <div className={`govuk-form-group${errors.line1 ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label govuk-label--m" htmlFor="line1">
                  Address line 1
                </label>
                {errors.line1 && (
                  <p id="line1-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.line1}
                  </p>
                )}
                <input
                  className={`govuk-input${errors.line1 ? ' govuk-input--error' : ''}`}
                  id="line1"
                  name="line1"
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  aria-describedby={errors.line1 ? 'line1-error' : undefined}
                  autoComplete="address-line1"
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="line2">
                  Address line 2 (optional)
                </label>
                <input
                  className="govuk-input"
                  id="line2"
                  name="line2"
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  autoComplete="address-line2"
                />
              </div>

              <div className={`govuk-form-group${errors.townCity ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label govuk-label--m" htmlFor="townCity">
                  Town or city
                </label>
                {errors.townCity && (
                  <p id="townCity-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.townCity}
                  </p>
                )}
                <input
                  className={`govuk-input${errors.townCity ? ' govuk-input--error' : ''}`}
                  id="townCity"
                  name="townCity"
                  type="text"
                  value={townCity}
                  onChange={(e) => setTownCity(e.target.value)}
                  aria-describedby={errors.townCity ? 'townCity-error' : undefined}
                  autoComplete="address-level2"
                />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="county">
                  County (optional)
                </label>
                <input
                  className="govuk-input"
                  id="county"
                  name="county"
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  autoComplete="address-level1"
                />
              </div>

              <div className={`govuk-form-group${errors.postcode ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label govuk-label--m" htmlFor="postcode">
                  Postcode
                </label>
                {errors.postcode && (
                  <p id="postcode-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.postcode}
                  </p>
                )}
                <input
                  className={`govuk-input govuk-input--width-10${errors.postcode ? ' govuk-input--error' : ''}`}
                  id="postcode"
                  name="postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  aria-describedby={errors.postcode ? 'postcode-error' : undefined}
                  autoComplete="postal-code"
                />
              </div>

              <div className="govuk-button-group">
                <button type="submit" className="govuk-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save and continue'}
                </button>
                <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
    </>
  );
};

export default ChangeWorkAddressPage;
