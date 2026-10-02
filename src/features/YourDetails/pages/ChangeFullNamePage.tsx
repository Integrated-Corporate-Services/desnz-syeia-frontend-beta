import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SUCCESS_BANNER_KEY, TITLE_OPTIONS } from '../constants/yourDetails';
import {
  getCurrentUserDetails,
  updateCurrentUserFullName,
  UpdateFullNamePayload,
} from '../services/yourDetailsService';
import PageTitle from '../../../components/PageTitle';

type FormErrors = {
  title?: string;
  firstName?: string;
  lastName?: string;
  submit?: string;
};

const NAME_PATTERN = /^[A-Za-z'\-\s]+$/;

const ChangeFullNamePage: React.FC = () => {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const details = await getCurrentUserDetails();
        setTitle(details.title || '');
        setFirstName(details.firstName || '');
        setLastName(details.lastName || '');
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
    if (errors.firstName) {
      list.push({ fieldId: 'firstName', message: 'Enter your first name' });
    }
    if (errors.lastName) {
      list.push({ fieldId: 'lastName', message: 'Enter your last name' });
    }
    if (errors.title) {
      list.push({ fieldId: 'title', message: errors.title });
    }
    if (errors.submit) {
      list.push({ fieldId: 'submit-error', message: errors.submit });
    }
    return list;
  }, [errors]);

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      nextErrors.firstName = 'First name is not valid';
    } else if (!NAME_PATTERN.test(trimmedFirstName)) {
      nextErrors.firstName = 'First name is not valid';
    }

    if (!trimmedLastName) {
      nextErrors.lastName = 'Last name is not valid';
    } else if (!NAME_PATTERN.test(trimmedLastName)) {
      nextErrors.lastName = 'Last name is not valid';
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

    const payload: UpdateFullNamePayload = {
      title: title.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    try {
      await updateCurrentUserFullName(payload);
      sessionStorage.setItem(SUCCESS_BANNER_KEY, 'full name');
      navigate('/your-details');
    } catch (err) {
      const error = err as Error & {
        validationErrors?: Record<string, string>;
      };

      if (error.validationErrors) {
        setErrors({
          firstName: error.validationErrors.firstName,
          lastName: error.validationErrors.lastName,
          title: error.validationErrors.title,
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
            <PageTitle title="Change your full name" />
            <div className="govuk-width-container">
      <Link className="govuk-back-link" to="/your-details">
        Back
      </Link>

              <h1 className="govuk-heading-l govuk-!-margin-bottom-6">Change your full name</h1>

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
              <div className={`govuk-form-group${errors.title ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label" htmlFor="title">
                  Title (optional)
                </label>
                {errors.title && (
                  <p id="title-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.title}
                  </p>
                )}
                <select
                  className={`govuk-select${errors.title ? ' govuk-input--error' : ''}`}
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                >
                  {TITLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.text}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`govuk-form-group${errors.firstName ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label govuk-label--m" htmlFor="firstName">
                  First name
                </label>
                {errors.firstName && (
                  <p id="firstName-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.firstName}
                  </p>
                )}
                <input
                  className={`govuk-input${errors.firstName ? ' govuk-input--error' : ''}`}
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
              </div>

              <div className={`govuk-form-group${errors.lastName ? ' govuk-form-group--error' : ''}`}>
                <label className="govuk-label govuk-label--m" htmlFor="lastName">
                  Last name
                </label>
                {errors.lastName && (
                  <p id="lastName-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.lastName}
                  </p>
                )}
                <input
                  className={`govuk-input${errors.lastName ? ' govuk-input--error' : ''}`}
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
              </div>

              <div className="govuk-button-group">
                <button type="submit" className="govuk-button" disabled={saving}>
                  {saving ? 'Saving...' : 'Save and continue'}
                </button>
                {/* <button
                  type="button"
                  className="govuk-button govuk-button--secondary"
                  onClick={handleSaveForLater}
                >
                  Save for later
                </button> */}
              </div>
            </form>
          </>
        )}
          </div>
    </>
  );
};

export default ChangeFullNamePage;
