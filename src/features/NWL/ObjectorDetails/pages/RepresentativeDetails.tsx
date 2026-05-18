import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { BREADCRUMBS, LABELS, FORM_ERRORS, FORM_LABELS, TITLE_OPTIONS } from "../constants/objectorDetailsConstants";
import { getObjectorDetails, saveRepresentativeDetails } from "../services";

const RepresentativeDetails: React.FC = () => {
  const navigate = useNavigate();
  const appId = useGetApplicationId();

  const [title, setTitle] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!appId) return;
      
      try {
        setIsLoading(true);
        const details = await getObjectorDetails(appId);
        if (details) {
          setTitle(details.representative_title || "");
          setFullName(details.representative_full_name || "");
          setEmail(details.representative_email || "");
          setPhone(details.representative_phone || "");
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
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = FORM_ERRORS.MISSING_FULL_NAME;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = FORM_ERRORS.INVALID_EMAIL;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      await saveRepresentativeDetails(appId, {
        representative_title: title,
        representative_full_name: fullName,
        representative_email: email,
        representative_phone: phone,
      });
      navigate(`${NWL_BASE_URL}/${appId}/representative-address`);
    } catch (error) {
      console.error('Error saving representative details:', error);
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
            <h1 className="govuk-heading-l">{LABELS.REPRESENTATIVE_DETAILS_TITLE}</h1>
            {Object.keys(errors).length > 0 && (
              <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
                <h2 className="govuk-error-summary__title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <ul className="govuk-list govuk-error-summary__list">
                    {Object.entries(errors).map(([key, value]) => (<li key={key}><a href={`#${key}`}>{value}</a></li>))}
                  </ul>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="title">{FORM_LABELS.TITLE}</label>
                <select className="govuk-select" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)}>
                  {TITLE_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.text}</option>))}
                </select>
              </div>
              <div className={`govuk-form-group ${errors.fullName ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="fullName">{FORM_LABELS.FULL_NAME}</label>
                {errors.fullName && <p id="fullName-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.fullName}</p>}
                <input className={`govuk-input ${errors.fullName ? "govuk-input--error" : ""}`} id="fullName" name="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} aria-describedby={errors.fullName ? "fullName-error" : undefined} />
              </div>
              <div className={`govuk-form-group ${errors.email ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="email">{FORM_LABELS.EMAIL}</label>
                {errors.email && <p id="email-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.email}</p>}
                <input className={`govuk-input ${errors.email ? "govuk-input--error" : ""}`} id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={errors.email ? "email-error" : undefined} />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="phone">{FORM_LABELS.PHONE}</label>
                <input className="govuk-input govuk-input--width-20" id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <button 
                type="submit" 
                className="govuk-button" 
                data-module="govuk-button"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : LABELS.CONTINUE}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RepresentativeDetails;
