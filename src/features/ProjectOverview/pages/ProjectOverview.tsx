import React, { useState } from "react";
import { useApplicationStore } from '../../../store/useApplicationStore';
import { CONTENT } from "../../../constants/content";
import { Link } from "react-router-dom";


import NumberInput from '../component/NumberInput';
import TextArea from '../component/TextArea';
import TextInput from '../component/TextInput';
import RadioGroup from '../component/RadioGroup';


const ProjectOverview = () => {
	const [formState, setFormState] = useState({
		areWorkStartDatesKnown: "",
		hasRelatedApplications: "",
		hasRelatedCpo: "",
		projectDescription: "",
		relatedCpoDetails: "",
		eipDetails: "",
		projectName: "",
		tallestPoleHeight: "",
		planReference: "",
		earliestWorkStartDateMonth: "",
		earliestWorkStartDateYear: "",
		latestWorkStartDateMonth: "",
		latestWorkStartDateYear: ""
	});
	const [errors, setErrors] = useState<string[]>([]);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const application = useApplicationStore(state => state.application);

	const { projectOverview, months, MAX_DESCRIPTION_LENGTH } = CONTENT;
	const remainingChars = MAX_DESCRIPTION_LENGTH - formState.projectDescription.length;
	const remainingCpoChars = MAX_DESCRIPTION_LENGTH - formState.relatedCpoDetails.length;
	return (
			<div className="govuk-width-container">
				<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
					<ol className="govuk-breadcrumbs__list">
						<li className="govuk-breadcrumbs__list-item">
							<Link className="govuk-breadcrumbs__link" to={`/task-list?id=${application?.application_id || ''}`}>
								{projectOverview.breadcrumb.taskList}
							</Link>
						</li>
						<li className="govuk-breadcrumbs__list-item" aria-current="page">{projectOverview.breadcrumb.current}</li>
					</ol>
				</nav>
				<main className="govuk-main-wrapper" id="main-content" role="main">
					<h1 className="govuk-heading-xl">{projectOverview.heading}</h1>
					{errors.length > 0 && (
						<div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
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
							// Check for more than one decimal place
							const val = formState.tallestPoleHeight.trim();
							if (/^\d+\.\d{2,}$/.test(val)) {
								newErrors.push('<a href="#tallestPoleHeight-inputValue">Enter at most 1 decimal place for the pole height</a>');
								newFieldErrors.tallestPoleHeight = "Enter at most 1 decimal place for the pole height";
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
						if (formState.hasRelatedCpo === "true" && !formState.relatedCpoDetails?.trim()) {
							newErrors.push('<a href="#relatedCpoDetails-inputValue">Enter the details of the related CPO</a>');
							newFieldErrors.relatedCpoDetails = "Enter the details of the related CPO";
						}
						// EIP details validation
						if (!formState.eipDetails?.trim()) {
							newErrors.push('<a href="#eipDetails-inputValue">Enter the EIP details related to this project</a>');
							newFieldErrors.eipDetails = "Enter the EIP details related to this project";
						}
						setErrors(newErrors);
						setFieldErrors(newFieldErrors);
						if (newErrors.length > 0) {
							window.scrollTo({ top: 0, behavior: "smooth" });
							return;
						}
						// ...existing submit logic...
					}}>
						<TextInput
							label={projectOverview.projectName}
							id="projectName-inputValue"
							name="projectName.inputValue"
							value={formState.projectName}
							error={fieldErrors?.projectName}
							maxLength={4000}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, projectName: e.target.value }))}
						/>

								{/* Project Description */}
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

								{/* Plan Reference */}
					<div className={`govuk-form-group${fieldErrors?.planReference ? " govuk-form-group--error" : ""}`}> 
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
								<div className={`govuk-form-group${fieldErrors?.areWorkStartDatesKnown ? " govuk-form-group--error" : ""}`}> 
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
																				<option key={m} value={m.toUpperCase()}>{m}</option>
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
																				<option key={m} value={m.toUpperCase()}>{m}</option>
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
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
											<h2 className="govuk-fieldset__heading">{projectOverview.planInformationDocuments}</h2>
										</legend>
										<div className="fds-file-upload govuk-form-group govuk-!-margin-bottom-0" data-module="fds-file-upload-container">
											<div className="fds-file-upload-dropzone" data-module="fds-file-upload-dropzone">
												<div className="fds-file-upload-dropzone__content">
													<div className="fds-file-upload-dropzone__text">
														Drag and drop your documents here, or
														<input
															id="planInformationDocuments"
															className="fds-file-upload-dropzone__hidden-input"
															type="file"
															name="file"
															tabIndex={-1}
															data-module="fds-file-upload"
															data-form-name="planInformationDocuments"
															data-form-field-id-name="uploadedFileId"
															data-form-field-instant-name="uploadedFileInstant"
															data-form-field-name-name="uploadedFileName"
															data-form-field-size-name="uploadedFileSize"
															data-form-field-description-name="uploadedFileDescription"
															data-form-data='{"_csrf": "fnpm6DpTz4YMKa3A31C_i32nfCJSVtAcZxfildIqlO6zSJc1Gk0AjQxnrrchSMjxun2LuRjBURtrZ7UxUy7Q9rNO8d-Gf_NU"}'
															data-url="/eip/section-37/84e7bced-21f6-48d4-8aae-a06145de20f9/project-details/plan-information/documents/upload"
															data-delete-url="/eip/section-37/84e7bced-21f6-48d4-8aae-a06145de20f9/project-details/plan-information/documents/delete/"
															data-download-url="/eip/section-37/84e7bced-21f6-48d4-8aae-a06145de20f9/project-details/plan-information/documents/download/"
															data-file-description="true"
															data-file-description-character-count="false"
															data-file-description-maxlength=""
															upload-file-max-size="52428800"
															accept=".bmp, .doc, .docx, .jpeg, .jpg, .pdf, .png, .txt, .xls, .xlsx"
															data-sequential-uploads="false"
															multiple
														/>
														<label htmlFor="planInformationDocuments" tabIndex={0} className="fds-file-upload-dropzone__link" role="link">
															<span className="fds-file-upload-dropzone__link-error govuk-visually-hidden"></span>
															choose a file
															<span className="govuk-visually-hidden"> for Section-37 plan information file upload</span>
														</label>
													</div>
												</div>
											</div>
											<div className="fds-file-upload-list" data-module="fds-file-upload-list"></div>
										</div>
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
														</thead>
														<tbody className="govuk-table__body">
															<tr>
																<td colSpan={2}>
																	<div className="govuk-inset-text">{projectOverview.relatedApplicationsNone}</div>
																</td>
															</tr>
														</tbody>
													</table>
													<div className="govuk-form-group govuk-form-group--error">
														<label className="govuk-label" htmlFor="relatedApplicationSelect" id="selector-relatedApplicationSelect-label">
															{projectOverview.relatedApplicationsSearch}
														</label>
														<p id="relatedApplicationSelect-error" className="govuk-error-message" style={{display: 'none'}}>
															<span className="govuk-visually-hidden">Error:</span> Add one or more related applications
														</p>
														<div className="fds-search-selector__input">
															<select
																id="relatedApplicationSelect"
																name="relatedApplicationSelect"
																style={{ width: "100%" }}
																className="select2-hidden-accessible"
																data-add-to-list="true"
																data-add-to-list-id="fds-add-to-list-table"
																data-module="fds-search-selector"
																data-selector-request-delay="250"
																data-selector-rest-url="/eip/api/section-37/related-applications/search"
																data-selector-min-input-length="1"
																data-selector-has-error="true"
																data-select2-id="relatedApplicationSelect"
																tabIndex={-1}
																aria-hidden="true"
															>
																{/* Options should be dynamically loaded by select2 */}
															</select>
															<span className="select2 select2-container select2-container--default" dir="ltr" data-select2-id="1" style={{ width: "100%" }}>
																<span className="selection">
																	<span className="select2-selection select2-selection--single relatedApplicationSelect-container fds-search-selector--error" role="combobox" aria-haspopup="true" aria-expanded="false" tabIndex={0} aria-disabled="false" aria-labelledby="selector-relatedApplicationSelect-label select2-relatedApplicationSelect-container">
																		<span className="select2-selection__rendered" id="select2-relatedApplicationSelect-container" role="textbox" aria-readonly="true"></span>
																		<span className="select2-selection__arrow" role="presentation">
																			<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5" aria-hidden="true" focusable="false">
																				<path fill="currentColor" d="M0 0h8L4 5z"></path>
																			</svg>
																		</span>
																	</span>
																</span>
																<span className="dropdown-wrapper" aria-hidden="true"></span>
															</span>
															<span id="selector-relatedApplicationSelect-aria" className="govuk-visually-hidden"></span>
														</div>
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
													value={formState.relatedCpoDetails}
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