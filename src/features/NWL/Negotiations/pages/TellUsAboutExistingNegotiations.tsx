import React, { useState, useEffect, useRef } from 'react';
import {
  LABELS,
  HINTS,
  FORM_LABELS,
  CONTENT,
  CHARACTER_LIMITS,
  MESSAGES,
} from '../constants/negotiationsConstants';
import {
  useNegotiationsData,
  useFormValidation,
  useNegotiationsNavigation,
} from '../hooks';
import {
  NegotiationsBreadcrumbs,
  ErrorSummary,
  DateInput,
  FormActions,
  TextAreaWithCounter,
} from '../components';
import { updateNegotiationsData } from '../services';
import FileUpload, { FileUploadHandle } from '../../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../../types/fileUpload';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { FILE_CATEGORIES } from '../../../../constants/fileCategoryConstants';

/**
 * Tell Us About Existing Negotiations Page
 * Asks if there have been any negotiations and optionally collects start date,
 * evidence comments, and supporting documents
 */
const TellUsAboutExistingNegotiations: React.FC = () => {
  const { appId, negotiationsData } = useNegotiationsData();
  const { errors, validateRadioSelection, validateComments, setErrors } = useFormValidation();
  const {
    navigateToWhyNoNegotiations,
    navigateToTaskList,
  } = useNegotiationsNavigation(appId);
  const { user } = useAuthUserContext();
  const userId = user?.user_id;
  const fileUploadRef = useRef<FileUploadHandle>(null);

  const [hasNegotiations, setHasNegotiations] = useState<string>('');
  const [startDate, setStartDate] = useState({
    day: '',
    month: '',
    year: '',
  });
  const [comments, setComments] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [applicationDocuments, setApplicationDocuments] = useState<ApplicationDocument[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (negotiationsData) {
      setHasNegotiations(
        negotiationsData.has_negotiations === true
          ? 'yes'
          : negotiationsData.has_negotiations === false
          ? 'no'
          : ''
      );
      setStartDate({
        day: negotiationsData.negotiations_start_date_day || '',
        month: negotiationsData.negotiations_start_date_month || '',
        year: negotiationsData.negotiations_start_date_year || '',
      });
      setComments(negotiationsData.negotiations_comments || '');
      setUploadedFiles(negotiationsData.uploaded_files || []);
      setApplicationDocuments(negotiationsData.application_documents || []);
    }
  }, [negotiationsData]);

  const handleDateChange = (field: 'day' | 'month' | 'year', value: string) => {
    setStartDate((prev) => ({ ...prev, [field]: value }));
    // Clear date-related errors when user starts typing
    if (errors.date || errors.day || errors.month || errors.year) {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Upload pending files first if user selected 'yes'
    if (hasNegotiations === 'yes' && fileUploadRef.current && pendingFiles.length > 0) {
      await fileUploadRef.current.triggerUpload();
    }

    if (!validateRadioSelection(hasNegotiations)) {
      window.scrollTo(0, 0);
      return;
    }

    // Validate comments if user selected 'yes' to negotiations
    if (hasNegotiations === 'yes' && !validateComments(comments, true)) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) {
      return;
    }

    setIsSaving(true);

    try {
      await updateNegotiationsData(appId, {
        has_negotiations: hasNegotiations === 'yes',
        negotiations_start_date_day: hasNegotiations === 'yes' ? startDate.day : undefined,
        negotiations_start_date_month: hasNegotiations === 'yes' ? startDate.month : undefined,
        negotiations_start_date_year: hasNegotiations === 'yes' ? startDate.year : undefined,
        negotiations_comments: hasNegotiations === 'yes' ? comments : undefined,
      });

      if (hasNegotiations === 'yes') {
        navigateToTaskList();
      } else {
        navigateToWhyNoNegotiations();
      }
    } catch (error) {
      console.error('Error saving negotiations data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveForLater = async () => {
    if (!appId) return;

    try {
      await updateNegotiationsData(appId, {
        has_negotiations: hasNegotiations === 'yes' ? true : hasNegotiations === 'no' ? false : undefined,
        negotiations_start_date_day: startDate.day || undefined,
        negotiations_start_date_month: startDate.month || undefined,
        negotiations_start_date_year: startDate.year || undefined,
        negotiations_comments: comments || undefined,
      });
    } catch (error) {
      console.error('Error saving for later:', error);
    }

    navigateToTaskList();
  };

  return (
    <div className="govuk-width-container">
      <NegotiationsBreadcrumbs appId={appId} />

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <ErrorSummary errors={errors} />

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${
                  errors.radio ? 'govuk-form-group--error' : ''
                }`}
              >
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {LABELS.EXISTING_NEGOTIATIONS_TITLE}
                    </h1>
                  </legend>
                  <div className="govuk-hint">
                    {CONTENT.EXISTING_NEGOTIATIONS_INTRO}
                  </div>
                  {errors.radio && (
                    <p id="radio-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{' '}
                      {errors.radio}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="hasNegotiations-yes"
                        name="hasNegotiations"
                        type="radio"
                        value="yes"
                        checked={hasNegotiations === 'yes'}
                        onChange={(e) => setHasNegotiations(e.target.value)}
                        data-aria-controls="conditional-date"
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasNegotiations-yes"
                      >
                        {FORM_LABELS.YES}
                      </label>
                    </div>
                    <div
                      className="govuk-radios__conditional"
                      id="conditional-date"
                      style={{
                        display: hasNegotiations === 'yes' ? 'block' : 'none',
                      }}
                    >
                      <DateInput
                        date={startDate}
                        errors={errors}
                        onDateChange={handleDateChange}
                        legend={HINTS.START_DATE}
                        hint={HINTS.DATE_FORMAT}
                      />

                      {/* Evidence of Negotiations Section */}
                      <div className="govuk-!-margin-top-6">
                        <h2 className="govuk-heading-m">Evidence of negotiations</h2>
                        
                        <TextAreaWithCounter
                          id="comments"
                          name="comments"
                          label={FORM_LABELS.ADDITIONAL_COMMENTS}
                          labelClassName="govuk-label govuk-label--s"
                          hint={CONTENT.EVIDENCE_INTRO}
                          value={comments}
                          error={errors.comments}
                          rows={8}
                          maxLength={CHARACTER_LIMITS.MAX_COMMENTS}
                          onChange={setComments}
                          characterRemainingMessage={MESSAGES.CHARACTER_REMAINING}
                        />

                        {/* File Upload Section */}
                        <div className="govuk-form-group">
                          <h3 className="govuk-heading-s govuk-!-margin-bottom-2">
                            {FORM_LABELS.UPLOAD_EVIDENCE}
                          </h3>
                          <FileUpload
                            ref={fileUploadRef}
                            title=""
                            prefix={`${appId}/${FILE_CATEGORIES.NEGOTIATIONS}`}
                            applicationId={appId}
                            category={FILE_CATEGORIES.NEGOTIATIONS}
                            addedBy={userId}
                            uploadedFiles={uploadedFiles}
                            applicationDocuments={applicationDocuments}
                            onUploaded={(newUploadedFiles, newDocuments) => {
                              setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
                              setApplicationDocuments((prev) => [...prev, ...newDocuments]);
                            }}
                            onPendingFilesChange={(files) => setPendingFiles(files)}
                            showDocumentsHeading={false}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="hasNegotiations-no"
                        name="hasNegotiations"
                        type="radio"
                        value="no"
                        checked={hasNegotiations === 'no'}
                        onChange={(e) => setHasNegotiations(e.target.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="hasNegotiations-no"
                      >
                        {FORM_LABELS.NO}
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <FormActions isSaving={isSaving} />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TellUsAboutExistingNegotiations;
