import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectStore } from '../../../store/useProjectStore';
import { useApplicationStore } from '../../../store/useApplicationStore';
import { CONTENT } from "../../../constants/content";
import { Link } from "react-router-dom";


import TextInput from "../component/TextInput";
import TextArea from "../component/TextArea";
import NumberInput from "../component/NumberInput";
import RadioGroup from "../component/RadioGroup";
import PlanInformationUpload from "../component/PlanInformationUpload";


import { ProjectOverviewModel } from '../../../types/projectOverview';
import { useAuthUser } from '../../../hooks/useAuthUser';
import SearchableDropdown from "../../../components/SearchableDropdown";

const emptyProjectOverview: ProjectOverviewModel = {
	applicationFormId: "",
	projectName: "",
	projectDescription: "",
	tallestPoleHeight: "",
	planReference: "",
	areWorkStartDatesKnown: "",
	earliestWorkStartDateMonth: "",
	earliestWorkStartDateYear: "",
	latestWorkStartDateMonth: "",
	latestWorkStartDateYear: "",
	hasRelatedApplications: "",
	relatedApplications: [],
	hasRelatedCpo: "",
	relatedCpoDetails: "",
	eipDetails: "",
	uploadedFiles: [],
	documents: [],
	projectId: "",
	applicationId: "",
	createdBy: "",
};

const ProjectOverview = () => {
	const params = useParams();
	const navigate = useNavigate();
	const [formState, setFormState] = useState<ProjectOverviewModel>(emptyProjectOverview);
	const [dropdownValue, setDropdownValue] = useState<string>('');
	const [errors, setErrors] = useState<string[]>([]);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const application = useApplicationStore(state => state.application);
	const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
	const { user } = useAuthUser();
	// Helper to get applicationId from store, params, or query string
	const getApplicationId = () => {
		if (application?.application_id) return application.application_id;
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

useEffect(() => {
	// Only fetch if application is null and applicationId is available
	if (application === null && applicationId) {
		fetchAndSetApplication(applicationId);
	}
}, [applicationId]);
	const { projectOverview, months, MAX_DESCRIPTION_LENGTH } = CONTENT;
	const { projectOverview: projectData, fetchProjectOverview, saveProjectOverview, fetchProjectList, projectList } = useProjectStore();
	const remainingChars = MAX_DESCRIPTION_LENGTH - formState.projectDescription.length;
	const getRelatedCpoDetailsString = (val: typeof formState.relatedCpoDetails) =>
		typeof val === 'string' ? val : (val && typeof val.field === 'string' ? val.field : '');
	const relatedCpoDetailsStr = getRelatedCpoDetailsString(formState.relatedCpoDetails);
	const remainingCpoChars = MAX_DESCRIPTION_LENGTH - relatedCpoDetailsStr.length;

	// Fetch project overview and project list on mount
	useEffect(() => {
		if (applicationId) {
			fetchProjectOverview(applicationId);
		}
		fetchProjectList();
	}, [applicationId, fetchProjectOverview, fetchProjectList]);


	// Bind fetched data to form fields (flat model)
			// Helper to convert '01' to 'January', etc.
			const monthNumToName = (num: string) => {
				if (!num) return "";
				const idx = parseInt(num, 10) - 1;
				return idx >= 0 && idx < months.length ? months[idx] : num;
			};
			// Helper to convert 'January' to '01', etc.
			const monthNameToNum = (name: string) => {
				const idx = months.findIndex(m => m.toUpperCase() === name.toUpperCase());
				return idx >= 0 ? ("0" + (idx + 1)).slice(-2) : name;
			};

				   useEffect(() => {
					   if (projectData) {
						   const forms = projectData.forms || {};
						   // Handle CPO details: support both string and object (with 'field')
						   let cpoField = '';
						   if (typeof projectData.relatedCpoDetails === 'object' && projectData.relatedCpoDetails !== null) {
							   cpoField = projectData.relatedCpoDetails.field ?? '';
						   } else if (typeof projectData.relatedCpoDetails === 'string') {
							   cpoField = projectData.relatedCpoDetails;
						   } else if (forms['project_CPO']?.data?.field) {
							   cpoField = forms['project_CPO'].data.field;
						   }
						   const hasStartDates = !!(
							   (projectData.earliestWorkStartDateMonth && projectData.earliestWorkStartDateMonth !== "") ||
							   (projectData.earliestWorkStartDateYear && projectData.earliestWorkStartDateYear !== "") ||
							   (projectData.latestWorkStartDateMonth && projectData.latestWorkStartDateMonth !== "") ||
							   (projectData.latestWorkStartDateYear && projectData.latestWorkStartDateYear !== "")
						   );
						 setFormState({
							 applicationFormId: projectData.applicationFormId ?? "",
							 projectId: projectData.projectId ?? "",
							 applicationId: projectData.applicationId ?? "",
							 createdBy: projectData.createdBy ?? "",

							 projectName: projectData.projectName ?? "",
							 projectDescription: projectData.projectDescription ?? "",
							 tallestPoleHeight: projectData.tallestPoleHeight ?? "",
							 planReference: projectData.planReference ?? "",
							 // Convert boolean to string for radio fields
							 areWorkStartDatesKnown: hasStartDates
								 ? "true"
								 : (typeof projectData.areWorkStartDatesKnown === 'boolean'
									 ? String(projectData.areWorkStartDatesKnown)
									 : (projectData.areWorkStartDatesKnown ?? "")),
							 earliestWorkStartDateMonth: monthNumToName(projectData.earliestWorkStartDateMonth ?? ""),
							 earliestWorkStartDateYear: projectData.earliestWorkStartDateYear ?? "",
							 latestWorkStartDateMonth: monthNumToName(projectData.latestWorkStartDateMonth ?? ""),
							 latestWorkStartDateYear: projectData.latestWorkStartDateYear ?? "",
							 hasRelatedApplications: typeof projectData.hasRelatedApplications === 'boolean'
								 ? String(projectData.hasRelatedApplications)
								 : (projectData.hasRelatedApplications ?? ""),
							 relatedApplications: Array.isArray(projectData.relatedApplications) ? projectData.relatedApplications : [],
							 // If cpoField has a value, set hasRelatedCpo to 'true', else fallback to projectData.hasRelatedCpo
							 hasRelatedCpo: cpoField && cpoField.trim() !== ''
								 ? 'true'
								 : (typeof projectData.hasRelatedCpo === 'boolean'
									 ? String(projectData.hasRelatedCpo)
									 : (projectData.hasRelatedCpo ?? '')),
							 relatedCpoDetails: cpoField,
							 eipDetails: projectData.eipDetails ?? "",
							 uploadedFiles: Array.isArray(projectData.uploadedFiles)
								 ? projectData.uploadedFiles.map(f => ({
									 id: f.id || '',
									 storage_provider: f.storage_provider || '',
									 s3_key: f.s3_key || '',
									 bucket_name: f.bucket_name || '',
									 virtual_folder: f.virtual_folder || '',
									 filename: f.filename || '',
									 file_content_type: f.file_content_type || '',
									 file_size_bytes: f.file_size_bytes || 0,
									 uploaded_at_timestamp: f.uploaded_at_timestamp || '',
									 description: f.description || ''
								 }))
								 : [],
							 documents: Array.isArray(projectData.documents)
								 ? projectData.documents.map(d => ({
									 documentId: d.documentId || '',
									 applicationId: d.applicationId || '',
									 fileId: d.fileId || '',
									 category: d.category || '',
									 title: d.title || '',
									 virtual_folder: d.virtual_folder || '',
									 addedBy: d.addedBy || '',
									 addedAt: d.addedAt || ''
								 }))
								 : []
						 });
					   }
				   }, [projectData]);

	return (
			<div className="govuk-width-container">
				<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
					<ol className="govuk-breadcrumbs__list">
						<li className="govuk-breadcrumbs__list-item">
							<Link
								className="govuk-breadcrumbs__link"
								to={`/task-list?id=${applicationId}`}
							>
								{projectOverview.breadcrumb.taskList}
							</Link>
						</li>
						<li className="govuk-breadcrumbs__list-item" aria-current="page">{projectOverview.breadcrumb.current}</li>
					</ol>
				</nav>
				   <main className="govuk-main-wrapper" id="main-content" role="main">
					   <h1 className="govuk-heading-xl">{projectOverview.heading}</h1>
					   {errors.length > 0 && (
						   <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1} style={{ marginBottom: '2rem', maxWidth: 600 }}>
							   <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
							   <div className="govuk-error-summary__body">
								   <ul className="govuk-list govuk-error-summary__list">
									   {errors.map((err, idx) => (
										   <li key={idx} dangerouslySetInnerHTML={{ __html: err }} />
									   ))}
								   </ul>
							   </div>
						   </div>
					   )}
					   <form method="post" onSubmit={e => {
						e.preventDefault();
						const newErrors: string[] = [];
						const newFieldErrors: Record<string, string> = {};
						if (!formState.projectName?.trim()) {
							newErrors.push('<a href="#projectName-inputValue">Enter the project name</a>');
							newFieldErrors.projectName = "Enter the project name";
						}
						if (!formState.projectDescription?.trim()) {
							newErrors.push('<a href="#projectDescription-inputValue">Enter the project description</a>');
							newFieldErrors.projectDescription = "Enter the project description";
						}
						if (!formState.tallestPoleHeight?.trim()) {
							newErrors.push('<a href="#tallestPoleHeight-inputValue">Enter the height of the tallest pole</a>');
							newFieldErrors.tallestPoleHeight = "Enter the height of the tallest pole";
						} else {
							// Check for more than two decimal places
							const val = formState.tallestPoleHeight.trim();
							if (/^\d+\.\d{3,}$/.test(val)) {
								newErrors.push('<a href="#tallestPoleHeight-inputValue">Enter at most 2 decimal places for the pole height</a>');
								newFieldErrors.tallestPoleHeight = "Enter at most 2 decimal places for the pole height";
							}
						}
						if (!formState.planReference?.trim()) {
							newErrors.push('<a href="#planReference-inputValue">Enter the plan reference</a>');
							newFieldErrors.planReference = "Enter the plan reference";
						}
						if (!formState.areWorkStartDatesKnown) {
							newErrors.push('<a href="#areWorkStartDatesKnown">Select yes if you know when work is intended to start on this development</a>');
							newFieldErrors.areWorkStartDatesKnown = "Select yes if you know when work is intended to start on this development";
						}
						// Earliest/Latest work start date validation
						if (formState.areWorkStartDatesKnown === "true") {
							// Earliest expected start date error
							let earliestYearInvalid = false;
							if (!formState.earliestWorkStartDateMonth || !formState.earliestWorkStartDateYear?.trim()) {
								newErrors.push('<a href="#earliestWorkStartDate-month">Enter the earliest expected start date</a>');
								newFieldErrors.earliestWorkStartDate = "Enter the earliest expected start date";
								if (!formState.earliestWorkStartDateYear?.trim()) {
									earliestYearInvalid = true;
								}
							} else {
								// Check if year is a valid 4-digit year
								const year = formState.earliestWorkStartDateYear.trim();
								if (!/^\d{4}$/.test(year)) {
									earliestYearInvalid = true;
								}
							}
							if (earliestYearInvalid) {
								newErrors.push('<a href="#earliestWorkStartDate-year">Earliest expected start date must be a real year</a>');
							}
							// Latest expected start date error
							let latestYearInvalid = false;
							if (!formState.latestWorkStartDateMonth || !formState.latestWorkStartDateYear?.trim()) {
								newErrors.push('<a href="#latestWorkStartDate-month">Enter the latest expected start date</a>');
								newFieldErrors.latestWorkStartDate = "Enter the latest expected start date";
								if (!formState.latestWorkStartDateYear?.trim()) {
									latestYearInvalid = true;
								}
							} else {
								// Check if year is a valid 4-digit year
								const year = formState.latestWorkStartDateYear.trim();
								if (!/^\d{4}$/.test(year)) {
									latestYearInvalid = true;
								}
							}
							if (latestYearInvalid) {
								newErrors.push('<a href="#latestWorkStartDate-year">Latest expected start date must be a real year</a>');
							}
						}
						// For file upload, you may need to check file input value or uploaded files
						// newErrors.push('<a href="#planInformationDocuments">Upload plan information documents</a>');
						if (!formState.hasRelatedApplications) {
							newErrors.push('<a href="#hasRelatedApplications">Select yes if there are related applications</a>');
							newFieldErrors.hasRelatedApplications = "Select yes if there are related applications";
						}
						if (!formState.hasRelatedCpo) {
							newErrors.push('<a href="#hasRelatedCpo">Select yes if there is a related CPO</a>');
							newFieldErrors.hasRelatedCpo = "Select yes if there is a related CPO";
						}
						// Related CPO details validation
						   if (formState.hasRelatedCpo === "true" && !getRelatedCpoDetailsString(formState.relatedCpoDetails).trim()) {
							   newErrors.push('<a href="#relatedCpoDetails-inputValue">Enter the details of the related CPO</a>');
							   newFieldErrors.relatedCpoDetails = "Enter the details of the related CPO";
						   }
												// EIP details validation: only required if both related applications and related CPO are not 'No'
												if (
													!formState.eipDetails?.trim() &&
													formState.hasRelatedApplications !== "false" &&
													formState.hasRelatedCpo !== "false"
												) {
													newErrors.push('<a href="#eipDetails-inputValue">Enter the EIP details related to this project</a>');
													newFieldErrors.eipDetails = "Enter the EIP details related to this project";
												}
						setErrors(newErrors);
						setFieldErrors(newFieldErrors);
						if (newErrors.length > 0) {
							window.scrollTo({ top: 0, behavior: "smooth" });
							return;
						}
							 // Save logic: convert month names to numbers for backend, always send relatedCpoDetails as string
							 // If applicationFormId is empty string, set to null for backend
							 // Always ensure applicationId is set (from store or URL param)
							 const applicationIdForSave = applicationId;
							 // If areWorkStartDatesKnown is 'false', clear the month/year fields
							 const shouldClearDates = formState.areWorkStartDatesKnown === "false";
							 const payload = {
								 ...formState,
								 applicationId: applicationIdForSave,
								 createdBy: user?.user_id || '',
								 applicationFormId: formState.applicationFormId === '' ? undefined : formState.applicationFormId,
								 earliestWorkStartDateMonth: shouldClearDates ? '' : (formState.earliestWorkStartDateMonth ? monthNameToNum(formState.earliestWorkStartDateMonth) : ''),
								 earliestWorkStartDateYear: shouldClearDates ? '' : (formState.earliestWorkStartDateYear || ''),
								 latestWorkStartDateMonth: shouldClearDates ? '' : (formState.latestWorkStartDateMonth ? monthNameToNum(formState.latestWorkStartDateMonth) : ''),
								 latestWorkStartDateYear: shouldClearDates ? '' : (formState.latestWorkStartDateYear || ''),
								 uploadedFiles: (formState.uploadedFiles || []).map(f => ({
									 id: f.id,
									 storage_provider: f.storage_provider,
									 s3_key: f.s3_key,
									 bucket_name: f.bucket_name,
									 virtual_folder: f.virtual_folder,
									 filename: f.filename,
									 file_content_type: f.file_content_type,
									 file_size_bytes: f.file_size_bytes,
									 uploaded_at_timestamp: f.uploaded_at_timestamp,
									 description: f.description
								 })),
								 // Always send relatedCpoDetails as string (not object)
								 relatedCpoDetails: typeof formState.relatedCpoDetails === 'object' && formState.relatedCpoDetails !== null
									 ? formState.relatedCpoDetails.field || ''
									 : (formState.relatedCpoDetails || '')
							 };
							 saveProjectOverview(payload)
								 .then((response: any) => {
									 // Try to get application id from backend response, fallback to payload/params/query string
									 const redirectId =
										 response?.project?.application_id ||
										 response?.application_overview?.application_id ||
										 applicationIdForSave ||
										 '';
									 navigate(`/task-list?id=${redirectId}`);
								 })
								 .catch((err: any) => {
									 setErrors([err.message || 'Failed to save project overview']);
								 });
						return;
					}}>

						   <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds" style={{ maxWidth: 600 }}>
							   <TextInput
								   label={projectOverview.projectName}
								   id="projectName-inputValue"
								   name="projectName.inputValue"
								   value={formState.projectName}
								   error={fieldErrors?.projectName}
								   maxLength={4000}
								   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, projectName: e.target.value }))}
							   />
						   </div>

						   {/* Project Description */}
						   <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds" style={{ maxWidth: 600 }}>
							   <TextArea
								   label={projectOverview.projectDescription}
								   id="projectDescription-inputValue"
								   name="projectDescription.inputValue"
								   value={formState.projectDescription}
								   error={fieldErrors?.projectDescription}
								   maxLength={MAX_DESCRIPTION_LENGTH}
								   infoId="projectDescription-inputValue-info"
								   remainingChars={remainingChars}
								   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormState(prev => ({ ...prev, projectDescription: e.target.value }))}
							   />
						   </div>

								{/* Details: What type of information should be provided */}
								<details className="govuk-details">
									<summary className="govuk-details__summary">
										<span className="govuk-details__summary-text">{projectOverview.infoDetailsSummary}</span>
									</summary>
									<div className="govuk-details__text">
										<p className="govuk-body">
											{projectOverview.infoDetailsText}
										</p>
									</div>
								</details>

								{/* Tallest Pole Height */}

						   <div className="govuk-!-margin-bottom-6 govuk-!-width-two-thirds" style={{ maxWidth: 320 }}>
							   <NumberInput
								   label={projectOverview.tallestPoleHeight}
								   suffix={projectOverview.tallestPoleHeightSuffix}
								   id="tallestPoleHeight-inputValue"
								   name="tallestPoleHeight.inputValue"
								   value={formState.tallestPoleHeight}
								   error={fieldErrors?.tallestPoleHeight}
								   maxLength={4000}
								   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, tallestPoleHeight: e.target.value }))}
							   />
						   </div>

								{/* Plan Reference */}
					   <div className={`govuk-form-group govuk-!-margin-bottom-6 govuk-!-width-two-thirds${fieldErrors?.planReference ? " govuk-form-group--error" : ""}`} style={{ maxWidth: 600 }}>
						   <label className="govuk-label" htmlFor="planReference-inputValue">
							   {projectOverview.planReference}
						   </label>
						   {fieldErrors?.planReference && (
							   <p id="planReference-inputValue-error" className="govuk-error-message">
								   <span className="govuk-visually-hidden">Error:</span> {fieldErrors.planReference}
							   </p>
						   )}
						   <input 
							   className={`govuk-input${fieldErrors?.planReference ? " govuk-input--error" : ""}`}
							   id="planReference-inputValue"
							   name="planReference.inputValue"
							   type="text"
							   maxLength={4000}
							   value={formState.planReference}
							   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, planReference: e.target.value }))}
							   aria-describedby={fieldErrors?.planReference ? "planReference-inputValue-error" : undefined}
						   />
					   </div>

								{/* Work Start Dates Known */}
								   <div className={`govuk-form-group govuk-!-margin-bottom-6 govuk-!-width-two-thirds${fieldErrors?.areWorkStartDatesKnown ? " govuk-form-group--error" : ""}`} style={{ maxWidth: 600 }}>
									   <fieldset className="govuk-fieldset" aria-describedby={fieldErrors?.areWorkStartDatesKnown ? "areWorkStartDatesKnown-error" : undefined}>
										   <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
											   <h2 className="govuk-fieldset__heading">
												   {projectOverview.workStartDatesKnown}
											   </h2>
										   </legend>
										   {fieldErrors?.areWorkStartDatesKnown && (
											   <p id="areWorkStartDatesKnown-error" className="govuk-error-message">
												   <span className="govuk-visually-hidden">Error:</span> {fieldErrors.areWorkStartDatesKnown}
											   </p>
										   )}
										   <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
											<div className="govuk-radios__item">
												<input className="govuk-radios__input" id="areWorkStartDatesKnown" name="areWorkStartDatesKnown" type="radio" value="true" checked={formState.areWorkStartDatesKnown === "true"} onChange={() => setFormState(prev => ({ ...prev, areWorkStartDatesKnown: "true" }))} aria-controls="areWorkStartDatesKnown-hidden" aria-expanded={formState.areWorkStartDatesKnown === "true" ? "true" : "false"} />
												<label className="govuk-label govuk-radios__label" htmlFor="areWorkStartDatesKnown">Yes</label>
											</div>
											{formState.areWorkStartDatesKnown === "true" && (
												<div className="govuk-radios__conditional" id="areWorkStartDatesKnown-hidden">
													{/* Earliest Start Date */}
													<div className={`govuk-form-group${fieldErrors?.earliestWorkStartDate ? " govuk-form-group--error" : ""}`}> 
														<fieldset className="govuk-fieldset">
															<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
																<h2 className="govuk-fieldset__heading">{projectOverview.earliestWorkStartDate}</h2>
															</legend>
															{fieldErrors?.earliestWorkStartDate && (
																<p id="earliestWorkStartDate-error" className="govuk-error-message">
																	<span className="govuk-visually-hidden">Error:</span> {fieldErrors.earliestWorkStartDate}
																</p>
															)}
															<div className="govuk-date-input">
																<div className="govuk-date-input__item">
																	<div className={`govuk-form-group${fieldErrors?.earliestWorkStartDate ? " govuk-form-group--error" : ""}`}> 
																		<label className="govuk-label" htmlFor="earliestWorkStartDate-month">Month</label>
																							<select 
																								className={`govuk-select${fieldErrors?.earliestWorkStartDate ? " govuk-select--error" : ""}`}
																								id="earliestWorkStartDate-month"
																								name="earliestWorkStartDate.month"
																								aria-describedby={fieldErrors?.earliestWorkStartDate ? "earliestWorkStartDate-error" : undefined}
																								value={formState.earliestWorkStartDateMonth || ""}
																								onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormState(prev => ({ ...prev, earliestWorkStartDateMonth: e.target.value }))}
																							>
																								<option value="" disabled>Select one...</option>
																								{months.map((m) => (
																									<option key={m} value={m}>{m}</option>
																								))}
																							</select>
																	</div>
																</div>
																<div className="govuk-date-input__item">
																	<div className={`govuk-form-group${fieldErrors?.earliestWorkStartDate ? " govuk-form-group--error" : ""}`}> 
																		<label className="govuk-label govuk-date-input__label" htmlFor="earliestWorkStartDate-year">Year</label>
																		<input 
																			className={`govuk-input govuk-date-input__input govuk-input--width-4${fieldErrors?.earliestWorkStartDate ? " govuk-input--error" : ""}`} 
																			id="earliestWorkStartDate-year" 
																			name="earliestWorkStartDate.year" 
																			type="text" 
																			aria-describedby={fieldErrors?.earliestWorkStartDate ? "earliestWorkStartDate-error" : undefined}
																			value={formState.earliestWorkStartDateYear || ""}
																			onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, earliestWorkStartDateYear: e.target.value }))}
																		/>
																	</div>
																</div>
															</div>
														</fieldset>
													</div>
													{/* Latest Start Date */}
													<div className={`govuk-form-group${fieldErrors?.latestWorkStartDate ? " govuk-form-group--error" : ""}`}> 
														<fieldset className="govuk-fieldset">
															<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
																<h2 className="govuk-fieldset__heading">{projectOverview.latestWorkStartDate}</h2>
															</legend>
															{fieldErrors?.latestWorkStartDate && (
																<p id="latestWorkStartDate-error" className="govuk-error-message">
																	<span className="govuk-visually-hidden">Error:</span> {fieldErrors.latestWorkStartDate}
																</p>
															)}
															<div className="govuk-date-input">
																<div className="govuk-date-input__item">
																	<div className={`govuk-form-group${fieldErrors?.latestWorkStartDate ? " govuk-form-group--error" : ""}`}> 
																		<label className="govuk-label" htmlFor="latestWorkStartDate-month">Month</label>
																							<select 
																								className={`govuk-select${fieldErrors?.latestWorkStartDate ? " govuk-select--error" : ""}`}
																								id="latestWorkStartDate-month"
																								name="latestWorkStartDate.month"
																								aria-describedby={fieldErrors?.latestWorkStartDate ? "latestWorkStartDate-error" : undefined}
																								value={formState.latestWorkStartDateMonth || ""}
																								onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormState(prev => ({ ...prev, latestWorkStartDateMonth: e.target.value }))}
																							>
																								<option value="" disabled>Select one...</option>
																								{months.map((m) => (
																									<option key={m} value={m}>{m}</option>
																								))}
																							</select>
																	</div>
																</div>
																<div className="govuk-date-input__item">
																	<div className={`govuk-form-group${fieldErrors?.latestWorkStartDate ? " govuk-form-group--error" : ""}`}> 
																		<label className="govuk-label govuk-date-input__label" htmlFor="latestWorkStartDate-year">Year</label>
																		<input 
																			className={`govuk-input govuk-date-input__input govuk-input--width-4${fieldErrors?.latestWorkStartDate ? " govuk-input--error" : ""}`} 
																			id="latestWorkStartDate-year" 
																			name="latestWorkStartDate.year" 
																			type="text" 
																			aria-describedby={fieldErrors?.latestWorkStartDate ? "latestWorkStartDate-error" : undefined}
																			value={formState.latestWorkStartDateYear || ""}
																			onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, latestWorkStartDateYear: e.target.value }))}
																		/>
																	</div>
																</div>
															</div>
														</fieldset>
													</div>
												</div>
											)}
											<div className="govuk-radios__item">
												<input className="govuk-radios__input" id="areWorkStartDatesKnown-no" name="areWorkStartDatesKnown" type="radio" value="false" checked={formState.areWorkStartDatesKnown === "false"} onChange={() => setFormState(prev => ({ ...prev, areWorkStartDatesKnown: "false" }))} />
												<label className="govuk-label govuk-radios__label" htmlFor="areWorkStartDatesKnown-no">No</label>
											</div>
										</div>
									</fieldset>
								</div>

								{/* Plan Information Documents */}
								<div className="govuk-form-group">
									<fieldset className="govuk-fieldset">
										{application && (
											<PlanInformationUpload
												application={application}
												title={projectOverview.planInformationDocuments}
											/>
										)}
									</fieldset>
								</div>

								{/* Details: What information should be included in the plan */}
								<details className="govuk-details">
									<summary className="govuk-details__summary">
										<span className="govuk-details__summary-text">{projectOverview.planDetailsSummary}</span>
									</summary>
									<div className="govuk-details__text">
										<p className="govuk-body">
											{projectOverview.planDetailsText}
										</p>
									</div>
								</details>

								{/* Related Applications */}
								<div className={`govuk-form-group${fieldErrors?.hasRelatedApplications ? " govuk-form-group--error" : ""}`}> 
									<fieldset className="govuk-fieldset" aria-describedby={`fieldset-5-hint${fieldErrors?.hasRelatedApplications ? ' hasRelatedApplications-error' : ''}`.trim()}>
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
											<h2 className="govuk-fieldset__heading">{projectOverview.relatedApplications}</h2>
										</legend>
										<div className="govuk-hint" id="fieldset-5-hint">
											{projectOverview.relatedApplicationsHint}
										</div>
										{fieldErrors?.hasRelatedApplications && (
											<p id="hasRelatedApplications-error" className="govuk-error-message">
												<span className="govuk-visually-hidden">Error:</span> {fieldErrors.hasRelatedApplications}
											</p>
										)}
										<div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
											<div className="govuk-radios__item">
												<input className="govuk-radios__input" id="hasRelatedApplications" name="hasRelatedApplications" type="radio" value="true" checked={formState.hasRelatedApplications === "true"} onChange={() => setFormState(prev => ({ ...prev, hasRelatedApplications: "true" }))} aria-controls="hasRelatedApplications-hidden" aria-expanded={formState.hasRelatedApplications === "true" ? "true" : "false"} />
												<label className="govuk-label govuk-radios__label" htmlFor="hasRelatedApplications">Yes</label>
											</div>
											{formState.hasRelatedApplications === "true" && (
												<div className="govuk-radios__conditional" id="hasRelatedApplications-hidden">
																<table className="govuk-table" id="fds-add-to-list-table">
																	<thead className="govuk-table__head">
																		<tr>
																			<th className="govuk-table__header">Related applications</th>
																			<th className="govuk-table__header">Actions</th>
																		</tr>
																	</thead>
																	<tbody className="govuk-table__body">
																		{formState.relatedApplications.length === 0 ? (
																			<tr>
																				<td colSpan={2}>
																					<div className="govuk-inset-text">{projectOverview.relatedApplicationsNone}</div>
																				</td>
																			</tr>
																		) : (
																			formState.relatedApplications.map((app, idx) => (
																				<tr key={app.value}>
																					<td>{app.label}</td>
																					<td>
																						<button
																							type="button"
																							className="govuk-link"
																							onClick={() => setFormState(prev => ({
																								...prev,
																								relatedApplications: prev.relatedApplications.filter((_, i) => i !== idx)
																							}))}
																						>Remove</button>
																					</td>
																				</tr>
																			))
																		)}
																	</tbody>
																</table>
													<div className="govuk-form-group govuk-form-group--error">
																		{/* Label is now rendered by SearchableDropdown, so remove duplicate here */}
														<p id="relatedApplicationSelect-error" className="govuk-error-message" style={{display: 'none'}}>
															<span className="govuk-visually-hidden">Error:</span> Add one or more related applications
														</p>
														
														<SearchableDropdown
															label={projectOverview.relatedApplicationsSearch}
															value={dropdownValue}
															onChange={(value, option) => {
																if (option && !formState.relatedApplications.some(app => app.value === option.value)) {
																	setFormState(prev => ({
																		...prev,
																		relatedApplications: [...prev.relatedApplications, option]
																	}));
																}
																setDropdownValue('');
															}}
															fetchOptions={async (input) => {
																const response = await fetch(`/eip/api/section-37/related-applications/search?query=${input}`);
																const data = await response.json();
																return data.map((item: { id: string; name: string }) => ({ label: item.name, value: item.id }));
															}}
														/>
													</div>
												</div>
											)}
											<div className="govuk-radios__item">
												<input className="govuk-radios__input" id="hasRelatedApplications-no" name="hasRelatedApplications" type="radio" value="false" checked={formState.hasRelatedApplications === "false"} onChange={() => setFormState(prev => ({ ...prev, hasRelatedApplications: "false" }))} />
												<label className="govuk-label govuk-radios__label" htmlFor="hasRelatedApplications-no">No</label>
											</div>
										</div>
									</fieldset>
								</div>

								{/* Related CPO */}
								<RadioGroup
									id="hasRelatedCpo"
									name="hasRelatedCpo"
									legend={projectOverview.relatedCpo}
									options={[{
										value: "true",
										label: "Yes",
										conditionalRender: (
											<div className="govuk-form-group govuk-character-count" data-module="govuk-character-count" data-maxlength={MAX_DESCRIPTION_LENGTH}>
												<label className="govuk-label" htmlFor="relatedCpoDetails-inputValue">
													{projectOverview.relatedCpoDetails}
												</label>
												{fieldErrors?.relatedCpoDetails && (
													<p id="relatedCpoDetails-inputValue-error" className="govuk-error-message">
														<span className="govuk-visually-hidden">Error:</span> {fieldErrors.relatedCpoDetails}
													</p>
												)}
												<textarea
													className={`govuk-textarea govuk-js-character-count${fieldErrors?.relatedCpoDetails ? " govuk-textarea--error" : ""}`}
													id="relatedCpoDetails-inputValue"
													name="relatedCpoDetails.inputValue"
													rows={5}
													maxLength={MAX_DESCRIPTION_LENGTH}
													   value={relatedCpoDetailsStr}
													   onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormState(prev => ({ ...prev, relatedCpoDetails: e.target.value }))}
													aria-describedby={fieldErrors?.relatedCpoDetails ? "relatedCpoDetails-inputValue-error relatedCpoDetails-inputValue-info" : "relatedCpoDetails-inputValue-info"}
												></textarea>
												<div id="relatedCpoDetails-inputValue-info" className="govuk-hint govuk-character-count__message govuk-visually-hidden">You can enter up to {MAX_DESCRIPTION_LENGTH} characters</div>
												<div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">You have {remainingCpoChars} characters remaining</div>
												<div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">You have {remainingCpoChars} characters remaining</div>
											</div>
										),
									}, {
										value: "false",
										label: "No",
									}]}
									value={formState.hasRelatedCpo}
									error={fieldErrors?.hasRelatedCpo}
									onChange={(val: string) => setFormState(prev => ({ ...prev, hasRelatedCpo: val }))}
									ariaControls={["hasRelatedCpo-hidden", "hasRelatedCpo-no-hidden"]}
								/>

								<button type="submit" className="govuk-button" value="Save and continue" name="Save and continue">
									{projectOverview.saveAndContinue}
								</button>
					</form>
				</main>
			</div>
		);
}

export default ProjectOverview;