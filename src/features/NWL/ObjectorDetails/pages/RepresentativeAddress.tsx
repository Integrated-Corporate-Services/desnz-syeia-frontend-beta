import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { BREADCRUMBS, LABELS, FORM_ERRORS, FORM_LABELS } from "../constants/objectorDetailsConstants";
import { useObjectorDetailsData } from "../hooks/useObjectorDetailsData";
import { saveRepresentativeAddress } from "../services/objectorDetailsService";

const RepresentativeAddress: React.FC = () => {
  const navigate = useNavigate();
  const { appId, objectorDetails } = useObjectorDetailsData();

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [town, setTown] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (objectorDetails) {
      setAddressLine1(objectorDetails.representative_address_line1 || "");
      setAddressLine2(objectorDetails.representative_address_line2 || "");
      setTown(objectorDetails.representative_town || "");
      setCounty(objectorDetails.representative_county || "");
      setPostcode(objectorDetails.representative_postcode || "");
    }
  }, [objectorDetails]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!addressLine1.trim()) newErrors.addressLine1 = FORM_ERRORS.MISSING_ADDRESS_LINE1;
    if (!town.trim()) newErrors.town = FORM_ERRORS.MISSING_TOWN;
    if (!postcode.trim()) newErrors.postcode = FORM_ERRORS.MISSING_POSTCODE;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    // Save to backend
    await saveRepresentativeAddress(appId, {
      representative_address_line1: addressLine1,
      representative_address_line2: addressLine2,
      representative_town: town,
      representative_county: county,
      representative_postcode: postcode,
    });

    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
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
            <h1 className="govuk-heading-l">{LABELS.REPRESENTATIVE_ADDRESS_TITLE}</h1>
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
              <div className={`govuk-form-group ${errors.addressLine1 ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="addressLine1">{FORM_LABELS.ADDRESS_LINE1}</label>
                {errors.addressLine1 && <p id="addressLine1-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.addressLine1}</p>}
                <input className={`govuk-input ${errors.addressLine1 ? "govuk-input--error" : ""}`} id="addressLine1" name="addressLine1" type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} aria-describedby={errors.addressLine1 ? "addressLine1-error" : undefined} />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="addressLine2">{FORM_LABELS.ADDRESS_LINE2}</label>
                <input className="govuk-input" id="addressLine2" name="addressLine2" type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
              </div>
              <div className={`govuk-form-group ${errors.town ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="town">{FORM_LABELS.TOWN}</label>
                {errors.town && <p id="town-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.town}</p>}
                <input className={`govuk-input ${errors.town ? "govuk-input--error" : ""}`} id="town" name="town" type="text" value={town} onChange={(e) => setTown(e.target.value)} aria-describedby={errors.town ? "town-error" : undefined} />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="county">{FORM_LABELS.COUNTY}</label>
                <input className="govuk-input" id="county" name="county" type="text" value={county} onChange={(e) => setCounty(e.target.value)} />
              </div>
              <div className={`govuk-form-group ${errors.postcode ? "govuk-form-group--error" : ""}`}>
                <label className="govuk-label" htmlFor="postcode">{FORM_LABELS.POSTCODE}</label>
                {errors.postcode && <p id="postcode-error" className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {errors.postcode}</p>}
                <input className={`govuk-input ${errors.postcode ? "govuk-input--error" : ""}`} id="postcode" name="postcode" type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} aria-describedby={errors.postcode ? "postcode-error" : undefined} />
              </div>
              <button type="submit" className="govuk-button" data-module="govuk-button">{LABELS.CONTINUE}</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RepresentativeAddress;
