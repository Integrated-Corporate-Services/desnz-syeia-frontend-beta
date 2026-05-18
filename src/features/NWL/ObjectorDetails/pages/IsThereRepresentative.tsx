import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { BREADCRUMBS, LABELS, FORM_ERRORS, FORM_LABELS } from "../constants/objectorDetailsConstants";
import { getObjectorDetails, saveRepresentativeStatus } from "../services";

const IsThereRepresentative: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();

  const [hasRepresentative, setHasRepresentative] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!appId) return;
      
      try {
        setIsLoading(true);
        const details = await getObjectorDetails(appId);
        if (details && details.has_representative !== undefined) {
          setHasRepresentative(details.has_representative ? "yes" : "no");
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
    if (!hasRepresentative) {
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
      await saveRepresentativeStatus(appId, hasRepresentative === "yes");
      
      if (hasRepresentative === "yes") {
        navigate(`${NWL_BASE_URL}/${appId}/representative-details`);
      } else {
        navigate(`${NWL_BASE_URL}/${appId}/task-list`);
      }
    } catch (error) {
      console.error('Error saving representative status:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="govuk-width-container">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item" aria-current="false">
            <Link className="govuk-breadcrumbs__link" to={`${NWL_BASE_URL}/${appId}/task-list`}>{BREADCRUMBS.TASK_LIST}</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="true">{BREADCRUMBS.OBJECTOR_DETAILS}</li>
        </ol>
      </nav>
      <main className="govuk-main-wrapper" id="main-content">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {error && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    <li><a href="#hasRepresentative">{error}</a></li>
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className={`govuk-form-group ${error ? "govuk-form-group--error" : ""}`}>
                <fieldset className="govuk-fieldset">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">{LABELS.REPRESENTATIVE_QUESTION_TITLE}</h1>
                  </legend>
                  {error && <p id="hasRepresentative-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="hasRepresentative-yes" name="hasRepresentative" type="radio" value="yes" checked={hasRepresentative === "yes"} onChange={(e) => setHasRepresentative(e.target.value)} />
                      <label className="govuk-label govuk-radios__label" htmlFor="hasRepresentative-yes">{FORM_LABELS.HAS_REPRESENTATIVE_YES}</label>
                    </div>
                    <div className="govuk-radios__item">
                      <input className="govuk-radios__input" id="hasRepresentative-no" name="hasRepresentative" type="radio" value="no" checked={hasRepresentative === "no"} onChange={(e) => setHasRepresentative(e.target.value)} />
                      <label className="govuk-label govuk-radios__label" htmlFor="hasRepresentative-no">{FORM_LABELS.HAS_REPRESENTATIVE_NO}</label>
                    </div>
                  </div>
                </fieldset>
              </div>
              <button type="submit" className="govuk-button" data-module="govuk-button">{LABELS.CONTINUE}</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IsThereRepresentative;
