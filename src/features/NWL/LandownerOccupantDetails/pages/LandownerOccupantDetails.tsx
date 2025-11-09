import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandownerOccupantDetails: React.FC = () => {
  const [classification, setClassification] = useState("");
  const [name, setName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [grantorRep, setGrantorRep] = useState("");
  const [grantorRepDescription, setGrantorRepDescription] = useState("");
  const [grantorRepAddress, setGrantorRepAddress] = useState("");
  const [repContactEmail, setRepContactEmail] = useState("");
  const [repContactPhone, setRepContactPhone] = useState("");
  const [errors, setErrors] = useState<{[key:string]:string}>({});
  const [showRepFields, setShowRepFields] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  // Fetch landowner/occupant/rep details from backend
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const Id = searchParams.get('id') || searchParams.get('Id') || '';
    console.log('LandownerOccupantDetails: Id', Id);
    if (!Id) {
      console.warn('No Id found in query string.');
      return;
    }

    const url = `/backend/api/nwl/landowner-occupant-details/${Id}`;
    console.log('LandownerOccupantDetails: GET', url);
    fetch(url)
      .then(res => {
        console.log('LandownerOccupantDetails: response', res);
        if (!res.ok) {
          console.error('LandownerOccupantDetails: fetch error', res.status, res.statusText);
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('LandownerOccupantDetails: data', data);
        // Use the landOwner object from the backend response
        if (data?.landOwner && (
          data.landOwner.contactType ||
          data.landOwner.name ||
          data.landOwner.address ||
          data.landOwner.email ||
          data.landOwner.phone
        )) {
          setClassification(data.landOwner.contactType || '');
          setName(data.landOwner.name || '');
          setFullAddress(data.landOwner.address || '');
          setContactEmail(data.landOwner.email || '');
          setContactPhone(data.landOwner.phone || '');
          setIsEditMode(true);
        } else {
          setIsEditMode(false);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('LandownerOccupantDetails: fetch catch', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend validation for required fields
    const newErrors: {[key:string]:string} = {};
    if (!classification) newErrors.classification = 'Select the type of ownership';
    if (!name) newErrors.name = 'Enter a name';
    if (!fullAddress) newErrors.fullAddress = 'Enter the full address';
    if (!contactEmail) newErrors.contactEmail = 'Enter an email address';
    if (!contactPhone) newErrors.contactPhone = 'Enter a phone number';
    // Add frontend validation for representative fields if required
    if (grantorRep === 'Yes') {
      if (!grantorRepDescription) newErrors.grantorRepDescription = 'Enter the representative name';
      if (!grantorRepAddress) newErrors.grantorRepAddress = 'Enter the representative address';
      if (!repContactEmail) newErrors.repContactEmail = 'Enter the representative email address';
      if (!repContactPhone) newErrors.repContactPhone = 'Enter the representative phone number';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const searchParams = new URLSearchParams(window.location.search);
    const Id = searchParams.get('id') || searchParams.get('Id') || '';
    // Build payload for backend
    let payload;
    let url = '';
    let method = '';
    if (isEditMode) {
      // Update (PUT) - send flat structure
      payload = {
      classification,
      name,
      fullAddress,
      contactEmail,
      contactPhone,
        grantorRep,
        grantorRepDescription,
        grantorRepAddress,
        repContactEmail,
        repContactPhone,
        application_id: Id,
      };
      url = `/backend/api/nwl/landowner-occupant-details/${Id}`;
      method = 'PUT';
      console.log('LandownerOccupantDetails PUT payload:', payload);
    } else {
      // Create (POST) - send nested structure
      const landOwner = {
        contactType: classification,
        name,
        address: fullAddress,
        email: contactEmail,
        phone: contactPhone,
      };
      let landownerRepresentative = {};
      if (grantorRep === 'Yes') {
        landownerRepresentative = {
          contactType: classification, // or a separate field if needed
          name: grantorRepDescription,
          address: grantorRepAddress,
          email: repContactEmail,
          phone: repContactPhone,
        };
      }
      payload = {
        landOwner,
        landownerRepresentative,
      };
      url = `/backend/api/nwl/landowner-occupant-details`;
      method = 'POST';
      console.log('LandownerOccupantDetails POST payload:', payload);
    }
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.errors) {
            // Only show backend errors if not a required field
            const backendErrors: {[key:string]:string} = {};
            errorData.errors.forEach((msg: string) => {
              // Map backend field names to user-friendly messages if needed
              if (msg.includes('classification')) backendErrors.classification = 'Select the type of ownership';
              else if (msg.includes('name')) backendErrors.name = 'Enter a name';
              else if (msg.includes('fullAddress')) backendErrors.fullAddress = 'Enter the full address';
              else if (msg.includes('contactEmail')) backendErrors.contactEmail = 'Enter an email address';
              else if (msg.includes('contactPhone')) backendErrors.contactPhone = 'Enter a phone number';
              else backendErrors.submit = msg;
            });
            setErrors(backendErrors);
            return;
          } else if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch {}
        setErrors({ submit: errorMsg });
        return;
      }
      if (method === 'POST') {
        // On create, get new id from response if available
        const data = await response.json();
        const newId = data?.data?.application_id || data?.data?.id || '';
        navigate(`/nwl/${newId}/task-list`);
      } else {
        navigate(`/nwl/${Id}/task-list`);
      }
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
  };
  // Extra null checks for robustness
  return (
    <main className="govuk-main-wrapper" id="main-content">
      {loading && (
        <div className="govuk-body">Loading landowner/occupant details...</div>
      )}
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href="applications.html">Applications</a>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href="application-overview.html">Application overview</a>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <a className="govuk-breadcrumbs__link" href="form-grantor.html">Landowner or occupant details</a>
          </li>
        </ol>
      </nav>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Landowner or occupant details</h1>
          <div className="govuk-hint govuk-!-margin-bottom-7">Tell us who owns or occupies the land related to this application. This could be an individual, organisation or trust.</div>
          {Object.keys(errors).length > 0 && (
            <div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {Object.entries(errors).map(([field, msg], idx) => (
                    <li key={idx}><a href={`#${field}`}>{msg}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className={`govuk-form-group${errors.classification ? ' govuk-form-group--error' : ''}`}>  
              <label className="govuk-label govuk-label--s" htmlFor="classification">Land ownership type</label>
              <div className="govuk-hint">Select the type of owner or occupier</div>
              {errors.classification && (
                <p className="govuk-error-message" id="classification-error">{errors.classification}</p>
              )}
              <select className="govuk-select" id="classification" name="classification" value={classification} onChange={e => setClassification(e.target.value)} aria-describedby={errors.classification ? "classification-error" : undefined}>
                <option value="">Select one</option>
                <option value="Owner">Owner</option>
                <option value="Occupier">Occupier</option>
                <option value="Owner/Occupier">Owner/Occupier</option>
              </select>
            </div>
            <div className={`govuk-form-group${errors.name ? ' govuk-form-group--error' : ''}`}>  
              <label className="govuk-label govuk-label--s" htmlFor="description">Name</label>
              {errors.name && (
                <p className="govuk-error-message" id="description-error">{errors.name}</p>
              )}
              <input className={`govuk-input${errors.name ? ' govuk-input--error' : ''}`} id="description" name="description" type="text" value={name} onChange={e => setName(e.target.value)} aria-describedby={errors.name ? "description-error" : undefined} />
            </div>
            <div className={`govuk-form-group${errors.fullAddress ? ' govuk-form-group--error' : ''}`}>  
              <label className="govuk-label govuk-label--s" htmlFor="fullAddress">Address</label>
              <div className="govuk-hint">Include postcode. If you don’t have the full address, give as much as possible.</div>
              {errors.fullAddress && (
                <p className="govuk-error-message" id="fullAddress-error">{errors.fullAddress}</p>
              )}
              <textarea className="govuk-textarea govuk-!-static-margin-bottom-1" id="fullAddress" name="fullAddress" rows={5} value={fullAddress} onChange={e => setFullAddress(e.target.value)} aria-describedby={errors.fullAddress ? "fullAddress-error" : undefined} />
            </div>
            <div className={`govuk-form-group${errors.contactEmail ? ' govuk-form-group--error' : ''}`}>  
              <label className="govuk-label govuk-label--s" htmlFor="contactEmail">Email address</label>
              {errors.contactEmail && (
                <p className="govuk-error-message" id="contactEmail-error">{errors.contactEmail}</p>
              )}
              <input className={`govuk-input${errors.contactEmail ? ' govuk-input--error' : ''}`} id="contactEmail" name="contactEmail" type="text" value={contactEmail} onChange={e => setContactEmail(e.target.value)} aria-describedby={errors.contactEmail ? "contactEmail-error" : undefined} />
            </div>
            <div className={`govuk-form-group${errors.contactPhone ? ' govuk-form-group--error' : ''}`}>  
              <label className="govuk-label govuk-label--s" htmlFor="contactPhone">Phone number</label>
              {errors.contactPhone && (
                <p className="govuk-error-message" id="contactPhone-error">{errors.contactPhone}</p>
              )}
              <input className={`govuk-input${errors.contactPhone ? ' govuk-input--error' : ''}`} id="contactPhone" name="contactPhone" type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} aria-describedby={errors.contactPhone ? "contactPhone-error" : undefined} />
            </div>
            <fieldset className="govuk-fieldset" aria-describedby="grantorRep-hint">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Is there a Landowner Representative? <span className="govuk-hint">(optional)</span></legend>
              <div id="grantorRep-hint" className="govuk-hint"></div>
              <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="grantorRep" name="grantorRep" type="radio" value="Yes" checked={grantorRep === "Yes"} onChange={e => { setGrantorRep(e.target.value); setShowRepFields(e.target.value === "Yes"); }} />
                  <label className="govuk-label govuk-radios__label" htmlFor="grantorRep">Yes</label>
                </div>
                <div className="govuk-radios__item">
                  <input className="govuk-radios__input" id="grantorRep-2" name="grantorRep" type="radio" value="No" checked={grantorRep === "No"} onChange={e => { setGrantorRep(e.target.value); setShowRepFields(false); }} />
                  <label className="govuk-label govuk-radios__label" htmlFor="grantorRep-2">No</label>
                </div>
              </div>
            </fieldset>
            {showRepFields && (
              <div className="grantor-rep">
                <div className={`govuk-form-group${errors.grantorRepDescription ? ' govuk-form-group--error' : ''}`}>  
                  <label className="govuk-label govuk-label--s" htmlFor="grantorRepDescription">Representative name</label>
                  <div id="grantorRepDescription-hint" className="govuk-hint">E.g. Smith and Smith Solicitors Ltd</div>
                  {errors.grantorRepDescription && (
                    <p className="govuk-error-message" id="grantorRepDescription-error">{errors.grantorRepDescription}</p>
                  )}
                  <input className={`govuk-input${errors.grantorRepDescription ? ' govuk-input--error' : ''}`} id="grantorRepDescription" name="grantorRepDescription" type="text" value={grantorRepDescription} onChange={e => setGrantorRepDescription(e.target.value)} aria-describedby={errors.grantorRepDescription ? "grantorRepDescription-error" : "grantorRepDescription-hint"} />
                </div>
                <div className={`govuk-form-group${errors.grantorRepAddress ? ' govuk-form-group--error' : ''}`}>  
                  <label className="govuk-label govuk-label--s" htmlFor="grantorRepAddress">Representative address</label>
                  <div className="govuk-hint">Include postcode. If you don’t have the full address, give as much as possible.</div>
                  {errors.grantorRepAddress && (
                    <p className="govuk-error-message" id="grantorRepAddress-error">{errors.grantorRepAddress}</p>
                  )}
                  <textarea className="govuk-textarea govuk-!-static-margin-bottom-1" id="grantorRepAddress" name="grantorRepAddress" rows={5} value={grantorRepAddress} onChange={e => setGrantorRepAddress(e.target.value)} aria-describedby={errors.grantorRepAddress ? "grantorRepAddress-error" : undefined} />
                </div>
                <div className={`govuk-form-group${errors.repContactEmail ? ' govuk-form-group--error' : ''}`}>  
                  <label className="govuk-label govuk-label--s" htmlFor="repContactEmail">Representative email address</label>
                  {errors.repContactEmail && (
                    <p className="govuk-error-message" id="repContactEmail-error">{errors.repContactEmail}</p>
                  )}
                  <input className={`govuk-input${errors.repContactEmail ? ' govuk-input--error' : ''}`} id="repContactEmail" name="repContactEmail" type="text" value={repContactEmail} onChange={e => setRepContactEmail(e.target.value)} aria-describedby={errors.repContactEmail ? "repContactEmail-error" : undefined} />
                </div>
                <div className={`govuk-form-group${errors.repContactPhone ? ' govuk-form-group--error' : ''}`}>  
                  <label className="govuk-label govuk-label--s" htmlFor="repContactPhone">Representative phone number</label>
                  {errors.repContactPhone && (
                    <p className="govuk-error-message" id="repContactPhone-error">{errors.repContactPhone}</p>
                  )}
                  <input className={`govuk-input${errors.repContactPhone ? ' govuk-input--error' : ''}`} id="repContactPhone" name="repContactPhone" type="text" value={repContactPhone} onChange={e => setRepContactPhone(e.target.value)} aria-describedby={errors.repContactPhone ? "repContactPhone-error" : undefined} />
                </div>
              </div>
            )}
            <div className="govuk-!-static-margin-top-6">
              <a href="application-overview.html" className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2">Save for later</a>
              <button type="submit" className="govuk-button" data-module="govuk-button">Save and continue</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default LandownerOccupantDetails;
