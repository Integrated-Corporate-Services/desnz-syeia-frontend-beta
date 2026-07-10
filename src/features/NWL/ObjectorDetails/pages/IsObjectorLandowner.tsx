import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import SkipLink from '../../../../components/SkipLink';
import { ERROR_MESSAGES } from '../../../../constants/error';
import { NWL_BASE_URL } from "../../../../constants/nwl";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
  FORM_LABELS,
  FORM_HINTS,
} from "../constants/objectorDetailsConstants";
import { useObjectorDetailsData } from "../hooks/useObjectorDetailsData";
import { saveObjectorLandownerStatus } from "../services/objectorDetailsService";
import { useNWLProgress } from '../../hooks/useNWLProgress';

/**
 * Is Objector Landowner Page
 * Asks if objector is also the landowner
 */
const IsObjectorLandowner: React.FC = () => {
  const navigate = useNavigate();
  const { appId, objectorDetails } = useObjectorDetailsData();
  const { updateProgress } = useNWLProgress(appId);

  const [isLandowner, setIsLandowner] = useState<string>("");

  const [error, setError] = useState<string>("");  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>("");
  const [versionError, setVersionError] = useState<string>('');
  const versionRef = useRef<number | undefined>(undefined);
  // Only populate radio button if value is explicitly defined (not undefined)
  // This prevents defaulting to "no" on first visit
  useEffect(() => {
    if (objectorDetails && objectorDetails.is_objector_also_landowner !== undefined && objectorDetails.is_objector_also_landowner !== null) {
      setIsLandowner(objectorDetails.is_objector_also_landowner ? "yes" : "no");
    }
    if (objectorDetails) {
      versionRef.current = objectorDetails.version;
    }
  }, [objectorDetails]);

  const validateForm = (): boolean => {
    if (!isLandowner) {
      setError(FORM_ERRORS.MISSING_RADIO_SELECTION);
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVersionError('');

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      // Save to backend
      await saveObjectorLandownerStatus(appId, isLandowner === "yes", versionRef.current);

      if (isLandowner === "yes") {
        // If objector is also landowner, mark Landowner details as completed
        try {
          await updateProgress('Landowner details', 'Completed');
        } catch (e) {
          // ignore progress errors
        }
        navigate(`${NWL_BASE_URL}/${appId}/is-there-representative`);
      } else {
        // If objector is NOT the landowner, mark as Not Completed since they need to provide details
        try {
          await updateProgress('Landowner details', 'Not Completed');
        } catch (e) {
          // ignore progress errors
        }
        navigate(`${NWL_BASE_URL}/${appId}/landowner-details`);
      }
    } catch (error: any) {
      // Handle version conflict
      if (error.statusCode === 409 || error.isVersionConflict) {
        setVersionError(ERROR_MESSAGES.VERSION_CONFLICT);
      } else {
        setSaveError("Failed to save landowner status. Please try again.");
      }
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SkipLink />
      <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link
              className="govuk-breadcrumbs__link"
              to={`${NWL_BASE_URL}/${appId}/task-list`}
            >
              {BREADCRUMBS.TASK_LIST}
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">
            Landowner details
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {versionError && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <div dangerouslySetInnerHTML={{ __html: versionError }} />
                </div>
              </div>
            )}
            {saveError && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <p>{saveError}</p>
                </div>
              </div>
            )}
            {error && (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
                tabIndex={-1}
                role="alert"
              >
                <h2 className="govuk-error-summary__title">
                  There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li>
                      <a href="#isLandowner">{error}</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`govuk-form-group ${
                  error ? "govuk-form-group--error" : ""
                }`}
              >
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">
                      {LABELS.LANDOWNER_QUESTION_TITLE}
                    </h1>
                  </legend>
                  {/* <div id="isLandowner-hint" className="govuk-hint">
                    {FORM_HINTS.LANDOWNER_QUESTION}
                  </div> */}
                  {error && (
                    <p id="isLandowner-error" className="govuk-error-message">
                      <span className="govuk-visually-hidden">Error:</span>{" "}
                      {error}
                    </p>
                  )}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="isLandowner-yes"
                        name="isLandowner"
                        type="radio"
                        value="yes"
                        checked={isLandowner === "yes"}
                        onChange={(e) => setIsLandowner(e.target.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="isLandowner-yes"
                      >
                        {FORM_LABELS.IS_LANDOWNER_YES}
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="isLandowner-no"
                        name="isLandowner"
                        type="radio"
                        value="no"
                        checked={isLandowner === "no"}
                        onChange={(e) => setIsLandowner(e.target.value)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="isLandowner-no"
                      >
                        {FORM_LABELS.IS_LANDOWNER_NO}
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <button
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : LABELS.CONTINUE}
              </button>
            </form>
          </div>
        </div>
      </main>
      </div>
    </>
  );
};

export default IsObjectorLandowner;
