import React, { useCallback, useEffect, useState } from 'react';
import ObjectionPage from '../components/ObjectionPage';
import ObjectionDocuments from '../components/ObjectionDocuments';
import { OBJECTION_ROUTES } from '../constants/objectionRoutes';
import { characterCountMessage, OBJECTION_DETAILS_MAX_LENGTH, OBJECTION_GUIDANCE_URL } from '../constants/objectionContent';
import { useObjectionForm } from '../hooks/useObjectionForm';
import { useDocumentScanPolling } from '../hooks/useDocumentScanPolling';
import { publicObjectionService } from '../services/publicObjectionService';
import type { ObjectionDocument, ObjectionJourney } from '../types/objectionJourney';

const HEADING = 'Provide the objection';

/** SYEIA-2932: the objection text and supporting documents. */
const ObjectionDetailsPage: React.FC = () => {
  const { journey, setJourney, saving, errors, errorFor, save, navigate, changing, withChange } = useObjectionForm();
  const [objectionDetails, setObjectionDetails] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const detailsError = errorFor('objection-details');

  useEffect(() => {
    if (journey && !loaded) {
      setObjectionDetails(journey.objectionDetails);
      setLoaded(true);
    }
  }, [journey, loaded]);

  const updateJourney = useCallback((updated: ObjectionJourney) => setJourney(updated), [setJourney]);
  useDocumentScanPolling(journey, updateJourney);

  const upload = async (files: File[]) => {
    setUploading(true);
    for (const file of files) {
      // Stop at the first file that fails so its error stays on screen.
      if (!(await save(() => publicObjectionService.uploadDocument(file)))) break;
    }
    setUploading(false);
  };

  const remove = (document: ObjectionDocument) => {
    void save(() => publicObjectionService.removeDocument(document.fileId));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const saved = await save(() => publicObjectionService.saveObjectionDetails(objectionDetails));
    if (!saved) return;
    // Organisations and representatives name every objector next (SYEIA-2937).
    const namesNeeded = saved.objectorType === 'organisation' || saved.objectorType === 'representative';
    if (namesNeeded && (!changing || !saved.objectorNames.length)) navigate(withChange(OBJECTION_ROUTES.OBJECTOR_NAMES));
    else navigate(OBJECTION_ROUTES.CHECK_ANSWERS);
  };

  const countMessage = characterCountMessage(objectionDetails.length);
  const overLimit = objectionDetails.length > OBJECTION_DETAILS_MAX_LENGTH;

  return (
    <ObjectionPage title={HEADING} backTo={OBJECTION_ROUTES.WHO_IS_OBJECTING} errors={errors}>
      {journey && (
        <>
          <span className="govuk-caption-l">Order {journey.reference}</span>
          <h1 className="govuk-heading-l">{HEADING}</h1>
          <p className="govuk-body">
            Provide as much detail as possible. You can upload one or more documents if you don’t have enough space in the text box.
          </p>
          <p className="govuk-body">
            <a className="govuk-link" href={OBJECTION_GUIDANCE_URL} target="_blank" rel="noreferrer noopener">
              Read the guidance on objecting to a CPO (opens in a new tab)
            </a>{' '}
            to learn more about the process.
          </p>
          <form onSubmit={submit} noValidate>
            <div className={`govuk-form-group govuk-character-count${detailsError ? ' govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--s" htmlFor="objection-details">Enter the objection</label>
              <div className="govuk-hint" id="objection-details-hint">
                Enter a summary of the objection if you are uploading the full objection in a document
              </div>
              {detailsError && (
                <p className="govuk-error-message" id="objection-details-error">
                  <span className="govuk-visually-hidden">Error:</span> {detailsError}
                </p>
              )}
              <textarea
                className={`govuk-textarea${detailsError || overLimit ? ' govuk-textarea--error' : ''}`}
                id="objection-details"
                name="objection-details"
                rows={5}
                aria-describedby={`objection-details-hint objection-details-count${detailsError ? ' objection-details-error' : ''}`}
                value={objectionDetails}
                onChange={(event) => setObjectionDetails(event.target.value)}
              />
              <div
                id="objection-details-count"
                className={`govuk-character-count__message${overLimit ? ' govuk-error-message' : ' govuk-hint'}`}
                aria-live="polite"
              >
                {countMessage}
              </div>
            </div>
            <ObjectionDocuments
              documents={journey.documents}
              error={errorFor('objection-documents')}
              busy={saving}
              uploading={uploading}
              onUpload={(files) => void upload(files)}
              onRemove={remove}
            />
            <button className="govuk-button" type="submit" disabled={saving}>Continue</button>
          </form>
        </>
      )}
    </ObjectionPage>
  );
};

export default ObjectionDetailsPage;
