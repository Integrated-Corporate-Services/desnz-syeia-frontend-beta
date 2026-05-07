import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';
import FileUploadBox from '../../../../components/FileUploadBox';
import { FileUploadResponse } from '../../../../types/FileUploadResponse';
import { useApplicationId } from '../hooks';
import { BREADCRUMBS, LABELS, HINTS, FORM_ERRORS } from '../constants';

const ProvideApplicationPlan: React.FC = () => {
  const navigate = useNavigate();
  const applicationId = useApplicationId();
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [error, setError] = useState<string>('');
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const handleSubmit = (saveType: 'continue' | 'later') => {
    // Validate that at least one file is uploaded
    if (uploadedFiles.length === 0 && saveType === 'continue') {
      setError(FORM_ERRORS.MISSING_FILE);
      setShowErrorSummary(true);
      return;
    }

    // Clear errors
    setError('');
    setShowErrorSummary(false);

    // Navigate based on save type
    if (saveType === 'continue') {
      navigate(`${NWL_BASE_URL}/${applicationId}/assets-match-plan`);
    } else {
      navigate(`${NWL_BASE_URL}/${applicationId}/task-list`);
    }
  };

  const handleUploadComplete = (files: FileUploadResponse[]) => {
    setUploadedFiles(files);
    setError('');
    setShowErrorSummary(false);
  };

  return (
    <main className="govuk-main-wrapper" id="main-content">
      {/* Breadcrumbs */}
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${applicationId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            {BREADCRUMBS.ASSETS}
          </li>
        </ol>
      </nav>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {/* Beta banner */}
          <div className="govuk-notification-banner govuk-notification-banner--info" role="region">
            <div className="govuk-notification-banner__header">
              <span className="govuk-tag govuk-tag--blue">Beta</span>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                This is a new service -{' '}
                <a className="govuk-notification-banner__link" href="#">
                  your feedback
                </a>{' '}
                will help us to improve it.
              </p>
            </div>
          </div>

          <h1 className="govuk-heading-xl">{LABELS.APPLICATION_PLAN_TITLE}</h1>

          {/* Error Summary */}
          {showErrorSummary && error && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              tabIndex={-1}
              role="alert"
            >
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  <li>
                    <a href="#file-upload">{error}</a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="govuk-body">{HINTS.APPLICATION_PLAN_INTRO}</p>
          <ul className="govuk-list govuk-list--bullet">
            {HINTS.APPLICATION_PLAN_BULLETS.map((bullet, index) => (
              <li key={index}>{bullet}</li>
            ))}
          </ul>

          {/* File Upload Section */}
          <h2 className="govuk-heading-m">{LABELS.UPLOAD_SECTION_TITLE}</h2>
          <p className="govuk-body">{HINTS.FILE_UPLOAD_INFO}</p>

          <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
            {error && (
              <p id="file-upload-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span> {error}
              </p>
            )}
            <FileUploadBox
              title=""
              prefix="application-plan"
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Form Actions */}
          <div className="govuk-button-group">
            <button
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              onClick={() => handleSubmit('continue')}
            >
              {LABELS.CONTINUE}
            </button>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => handleSubmit('later')}
            >
              {LABELS.SAVE_FOR_LATER}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProvideApplicationPlan;
