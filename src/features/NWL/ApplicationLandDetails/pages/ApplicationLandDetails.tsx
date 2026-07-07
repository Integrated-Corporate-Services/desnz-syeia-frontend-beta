import React, { useState } from "react";
import FileUpload from '../../../../components/FileUpload';
// Use the advanced FileUpload component from ProjectOverview
import { NWL_FILE_CATEGORIES } from "../../../../constants/fileCategoryConstants";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { Link, useParams } from "react-router-dom";
import SkipLink from '../../../../components/SkipLink';
// You may need to adjust the import paths above to match your project structure

const ApplicationLandDetails: React.FC = () => {
	// Example values for required props

  const params = useParams();
  const getApplicationId = () => {
    if (params.applicationId) return params.applicationId;
    if (params.id) return params.id;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const idFromQuery = searchParams.get('id') || searchParams.get('applicationId');
      if (idFromQuery) return idFromQuery;
    }
    return '';
  };
  const applicationId = getApplicationId();
	const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
	const [, setApplicationDocuments] = useState<any[]>([]);
	// Form state
	const [applicationType, setApplicationType] = useState("");
	const [networkOperatorReference, setNetworkOperatorReference] = useState("");
	const [fileUpload1] = useState<File | null>(null);
	const [landLocation, setLandLocation] = useState("");
	const [landRef, setLandRef] = useState("");
	const [landRegistry, setLandRegistry] = useState("");
	const [landRegistryRef, setLandRegistryRef] = useState("");
	const [osGridLetter, setOsGridLetter] = useState("");
	const [osGridEasting, setOsGridEasting] = useState("");
	const [osGridNorthing, setOsGridNorthing] = useState("");
	const [what3Words, setWhat3Words] = useState("");
	const [identifyLand, setIdentifyLand] = useState("");
	const [publicRoad, setPublicRoad] = useState("");
	const [fileSiteUpload, setFileSiteUpload] = useState<File | null>(null);
	const [errors, setErrors] = useState<{[key:string]:string}>({});

	// File upload handlers
	const handleFileSiteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFileSiteUpload(e.target.files?.[0] || null);
	};

	// Validation
	const validate = () => {
		const newErrors: {[key:string]:string} = {};
		if (!networkOperatorReference) newErrors.networkOperatorReference = "Enter your internal reference number or code";
		if (!applicationType || applicationType === "select") newErrors.applicationType = "Select an application type";
		if (!fileUpload1) newErrors.fileUpload1 = "Upload a document to support your application";
		if (!landLocation || landLocation === "updated") newErrors.landLocation = "Select a land location";
		if (!landRegistry) newErrors.landRegistry = "Select if the land registered with the Land Registry";
		if (landRegistry === "yes" && !landRegistryRef) newErrors.landRegistryRef = "Enter the reference number";
		if (!identifyLand) newErrors.identifyLand = "Enter details to help identify the land";
		if (!publicRoad) newErrors.publicRoad = "Select if the equipment can be seen from a public road";
		if (!fileSiteUpload) newErrors.fileSiteUpload = "Upload site photographs to support your application";
		// File type validation (jpg/jpeg only)
		if (fileUpload1 && !["jpg","jpeg"].includes(fileUpload1.name.split('.').pop()?.toLowerCase() || "")) {
			newErrors.fileUpload1 = "Upload a JPG or JPEG site photograph";
		}
		if (fileSiteUpload && !["jpg","jpeg"].includes(fileSiteUpload.name.split('.').pop()?.toLowerCase() || "")) {
			newErrors.fileSiteUpload = "Upload a JPG or JPEG site photograph";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			// Submit logic here
			// ...
		}
	};

	return (
		<>
			<SkipLink />
			<main className="govuk-main-wrapper" id="main-content">
				<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
						<ol className="govuk-breadcrumbs__list">
							<li className="govuk-breadcrumbs__list-item">
								<Link
									className="govuk-breadcrumbs__link"
									to={`${NWL_BASE_URL}/${applicationId}/task-list`}
								>
									Task list
								</Link>
							</li>
							<li className="govuk-breadcrumbs__list-item" aria-current="page">Application and Land details</li>
						</ol>
					</nav>
			<div className="govuk-grid-row">
				<div className="govuk-grid-column-two-thirds">
					<h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Application and Land details</h1>
					<div className="govuk-hint govuk-!-margin-bottom-7">Provide details about the land and the nature of the works in this section.</div>
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
					<h2 className="govuk-heading-m">Application information</h2>
					<form onSubmit={handleSubmit} noValidate>
						<div className={`govuk-form-group${errors.networkOperatorReference ? ' govuk-form-group--error' : ''}`}>  
							<label className="govuk-label govuk-label--s" htmlFor="NetworkOperatorReference">Applicant’s reference</label>
							{errors.networkOperatorReference && (
								<p className="govuk-error-message" id="NetworkOperatorReference-error">{errors.networkOperatorReference}</p>
							)}
							<input className={`govuk-input${errors.networkOperatorReference ? ' govuk-input--error' : ''}`} id="NetworkOperatorReference" name="NetworkOperatorReference" type="text" value={networkOperatorReference} onChange={e => setNetworkOperatorReference(e.target.value)} aria-describedby={errors.networkOperatorReference ? "NetworkOperatorReference-error" : undefined} />
						</div>
						<div className={`govuk-form-group${errors.applicationType ? ' govuk-form-group--error' : ''}`}>  
							<label className="govuk-label govuk-label--s" htmlFor="application-type">Application type</label>
							{errors.applicationType && (
								<p className="govuk-error-message" id="application-type-error">{errors.applicationType}</p>
							)}
							<select className="govuk-select" id="application-type" name="ApplicationType" value={applicationType} onChange={e => setApplicationType(e.target.value)} aria-describedby={errors.applicationType ? "application-type-error" : undefined}>
								<option value="select">Select an option</option>
								<option value="newLine">New line</option>
								<option value="existingLine">Existing line</option>
							</select>
						</div>
						<div className={`govuk-form-group${errors.fileUpload1 ? ' govuk-form-group--error' : ''}`}>  
							<fieldset className="govuk-fieldset">
								<label className="govuk-label govuk-label--s" htmlFor="fileUpload1">
									Upload any documents to support your application
								</label>
								<FileUpload
									title=""
																	  prefix={`${applicationId}/${NWL_FILE_CATEGORIES.NWL_APPLICATION_LAND_DETAILS}`}
									uploadedFiles={uploadedFiles}									uploadImmediately={true}									onUploaded={(newUploadedFiles: unknown[], newDocuments: unknown[]) => {
										setUploadedFiles(prev => ([...(prev || []), ...newUploadedFiles]));
										setApplicationDocuments(prev => ([...(prev || []), ...newDocuments]));
									}}
								/>
								<div className="govuk-hint govuk-!-margin-top-1">
									For example:
									<ul>
										<li>application plan</li>
										<li>boundary of property</li>
										<li>land registry documents</li>
										<li>notice to remove</li>
										<li>wayleave documents (if relevant)</li>
									</ul>
									<p className="govuk-hint">You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password-protected.</p>
								</div>
								{errors.fileUpload1 && (
									<p className="govuk-error-message" id="fileUpload1-error">{errors.fileUpload1}</p>
								)}
							</fieldset>
						</div>
						<hr className="govuk-!-margin-bottom-5" />
						<h2 className="govuk-heading-m">Land details</h2>
						<div className={`govuk-form-group${errors.landLocation ? ' govuk-form-group--error' : ''}`}>  
							<label className="govuk-label govuk-label--s" htmlFor="landLocation">Land location</label>
							<div id="landLocation-hint" className="govuk-hint">Select if the land is in England or Wales</div>
							{errors.landLocation && (
								<p className="govuk-error-message" id="landLocation-error">{errors.landLocation}</p>
							)}
							<select className="govuk-select" id="landLocation" name="landLocation" value={landLocation} onChange={e => setLandLocation(e.target.value)} aria-describedby={errors.landLocation ? "landLocation-error" : "landLocation-hint"}>
								<option value="updated">Select an option</option>
								<option value="views">England</option>
								<option value="comments">Wales</option>
							</select>
						</div>
						<div className="govuk-form-group">
							<label className="govuk-label govuk-label--s" htmlFor="landRef">Land reference <span className="govuk-hint">(optional)</span></label>
							<div id="landRef-hint" className="govuk-hint">This reference may be supplied by the landowner</div>
							<input className="govuk-input" id="landRef" name="landRef" type="text" value={landRef} onChange={e => setLandRef(e.target.value)} aria-describedby="landRef-hint" />
						</div>
						<div className={`govuk-form-group${errors.landRegistry ? ' govuk-form-group--error' : ''}`}>  
							<fieldset className="govuk-fieldset" aria-describedby="contact-hint">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
									<h1 className="govuk-fieldset__heading">Is the land registered with the Land Registry?</h1>
								</legend>
								<div id="contact-hint" className="govuk-hint"></div>
								{errors.landRegistry && (
									<p className="govuk-error-message" id="landRegistry-error">{errors.landRegistry}</p>
								)}
								<div className="govuk-radios" data-module="govuk-radios">
									<div className="govuk-radios__item">
										<input className="govuk-radios__input" id="landRegistry-yes" name="landRegistry" type="radio" value="yes" checked={landRegistry === "yes"} onChange={e => setLandRegistry(e.target.value)} />
										<label className="govuk-label govuk-radios__label" htmlFor="landRegistry-yes">Yes</label>
									</div>
									<div className="govuk-radios__item">
										<input className="govuk-radios__input" id="landRegistry-no" name="landRegistry" type="radio" value="no" checked={landRegistry === "no"} onChange={e => setLandRegistry(e.target.value)} />
										<label className="govuk-label govuk-radios__label" htmlFor="landRegistry-no">No</label>
									</div>
								</div>
								{landRegistry === "yes" && (
									<div className={`govuk-form-group${errors.landRegistryRef ? ' govuk-form-group--error' : ''}`}>  
										<label className="govuk-label" htmlFor="landRegistryRef">Reference number</label>
										<div className="govuk-hint">Usually found on the land title or deeds</div>
										{errors.landRegistryRef && (
											<p className="govuk-error-message" id="landRegistryRef-error">{errors.landRegistryRef}</p>
										)}
										<input className={`govuk-input${errors.landRegistryRef ? ' govuk-input--error' : ''}`} id="landRegistryRef" name="landRegistryRef" type="text" value={landRegistryRef} onChange={e => setLandRegistryRef(e.target.value)} aria-describedby={errors.landRegistryRef ? "landRegistryRef-error" : undefined} />
									</div>
								)}
							</fieldset>
						</div>
						<hr className="govuk-!-margin-bottom-5" />
						<h3 className="govuk-heading-m">OS Grid Reference <span className="govuk-hint">(optional)</span></h3>
						<div id="OSGrid" className="govuk-hint">Enter the Ordinance Survey Grid reference number for this location.</div>
						<div className="govuk-grid-row">
							<div className="govuk-grid-column-one-third">
								<div className="govuk-form-group">
									<label className="govuk-label govuk-label--s" htmlFor="gridLetter">Grid letter</label>
									<input className="govuk-input" id="gridLetter" name="gridLetter" type="text" value={osGridLetter} onChange={e => setOsGridLetter(e.target.value)} />
								</div>
							</div>
							<div className="govuk-grid-column-one-third">
								<div className="govuk-form-group">
									<label className="govuk-label govuk-label--s" htmlFor="gridEasting">Easting</label>
									<input className="govuk-input" id="gridEasting" name="gridEasting" type="text" value={osGridEasting} onChange={e => setOsGridEasting(e.target.value)} />
								</div>
							</div>
							<div className="govuk-grid-column-one-third">
								<div className="govuk-form-group">
									<label className="govuk-label govuk-label--s" htmlFor="gridNorthing">Northing</label>
									<input className="govuk-input" id="gridNorthing" name="gridNorthing" type="text" value={osGridNorthing} onChange={e => setOsGridNorthing(e.target.value)} />
								</div>
							</div>
						</div>
						<hr className="govuk-!-margin-bottom-5" />
						<h2 className="govuk-heading-m" id="location">Other identifying information</h2>
						<div className="govuk-form-group" id="What3Words-group">
							<label className="govuk-label govuk-label--s" htmlFor="What3Words">What3Words location for the site <span className="govuk-hint">(optional)</span></label>
							<div id="W3words-hint" className="govuk-hint">Enter the What3Words combination for this location</div>
							<input className="govuk-input" id="What3Words" name="What3Words" type="text" value={what3Words} onChange={e => setWhat3Words(e.target.value)} aria-describedby="W3words-hint" />
						</div>
						<div className={`govuk-form-group${errors.identifyLand ? ' govuk-form-group--error' : ''}`} id="identifyLand-group">
							<label className="govuk-label govuk-label--s" htmlFor="identifyLand">Is there anything else that helps identify the land?</label>
							{errors.identifyLand && (
								<p className="govuk-error-message" id="identifyLand-error">{errors.identifyLand}</p>
							)}
							<input className={`govuk-input${errors.identifyLand ? ' govuk-input--error' : ''}`} id="identifyLand" name="identifyLand" type="text" value={identifyLand} onChange={e => setIdentifyLand(e.target.value)} aria-describedby={errors.identifyLand ? "identifyLand-error" : undefined} />
						</div>
						<div className={`govuk-form-group${errors.publicRoad ? ' govuk-form-group--error' : ''}`} id="whereDoYouLive-group">
							<fieldset className="govuk-fieldset">
								<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Can the equipment be seen from a public road?</legend>
								{errors.publicRoad && (
									<p className="govuk-error-message" id="whereDoYouLive-error">{errors.publicRoad}</p>
								)}
								<div className="govuk-radios" data-module="govuk-radios">
									<div className="govuk-radios__item">
										<input className="govuk-radios__input" id="whereDoYouLive-yes" name="whereDoYouLive" type="radio" value="yes" checked={publicRoad === "yes"} onChange={e => setPublicRoad(e.target.value)} />
										<label className="govuk-label govuk-radios__label" htmlFor="whereDoYouLive-yes">Yes</label>
									</div>
									<div className="govuk-radios__item">
										<input className="govuk-radios__input" id="whereDoYouLive-no" name="whereDoYouLive" type="radio" value="no" checked={publicRoad === "no"} onChange={e => setPublicRoad(e.target.value)} />
										<label className="govuk-label govuk-radios__label" htmlFor="whereDoYouLive-no">No</label>
									</div>
								</div>
							</fieldset>
						</div>
						<div className={`govuk-form-group${errors.fileSiteUpload ? ' govuk-form-group--error' : ''}`}>  
							<label className="govuk-label govuk-label--s" htmlFor="fileSiteUpload">Upload site photographs</label>
							<div id="fileSiteUpload-hint" className="govuk-hint">Show equipment from a number of angles including, if possible, a view of the equipment comparable to that as viewed from the occupied residence.
								<p className="govuk-hint">You can upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files of up to 25MB each. Files cannot be password-protected.</p>
							</div>
							{errors.fileSiteUpload && (
								<p className="govuk-error-message" id="fileSiteUpload-error">{errors.fileSiteUpload}</p>
							)}
							<input className="govuk-file-upload" id="fileSiteUpload" name="fileSiteUpload" type="file" aria-describedby={errors.fileSiteUpload ? "fileSiteUpload-error" : "fileSiteUpload-hint"} onChange={handleFileSiteUpload} />
						</div>
						<div className="govuk-!-static-margin-top-6">
							<a href="application-overview.html" className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2">Save for later</a>
							<button type="submit" className="govuk-button" data-module="govuk-button">Save and continue</button>
						</div>
					</form>
				</div>
			</div>
		</main>
		</>
	);
};

export default ApplicationLandDetails;
