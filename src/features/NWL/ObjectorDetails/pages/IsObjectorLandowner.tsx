import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import {
  BREADCRUMBS,
  LABELS,
  FORM_ERRORS,
  FORM_LABELS,
  FORM_HINTS,
} from "../constants/objectorDetailsConstants";
import { getObjectorDetails, saveObjectorLandownerStatus } from "../services";

/**
 * Is Objector Landowner Page
 * Asks if objector is also the landowner
 */
const IsObjectorLandowner: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();

  const [isLandowner, setIsLandowner] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!appId) return;
      
      try {
        setIsLoading(true);
        const details = await getObjectorDetails(appId);
        if (details && details.is_landowner !== undefined) {
          setIsLandowner(details.is_landowner ? "yes" : "no");
        }
      } catch (error) {
        console.error('Error fetching objector details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [appId]);

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

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    if (!appId) return;

    try {
      setIsSaving(true);
      await saveObjectorLandownerStatus(appId, isLandowner === "yes");
      
      if (isLandowner === "yes") {
        navigate(`${NWL_BASE_URL}/${appId}/is-there-representative`);
      } else {
        navigate(`${NWL_BASE_URL}/${appId}/landowner-details`);
      }
    } catch (error) {
      console.error('Error saving landowner status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            {BREADCRUMBS.OBJECTOR_DETAILS}
          </li>
        </ol>
      </nav>

      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
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
                  <div id="isLandowner-hint" className="govuk-hint">
                    {FORM_HINTS.LANDOWNER_QUESTION}
                  </div>
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
              >
                {LABELS.CONTINUE}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IsObjectorLandowner;
