import { S37_BASE_URL } from '../../../constants/s37';
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectOverview } from '../../../hooks/useProjectOverview';
import { CONTENT } from "../../../constants/content";
import { PROJECT_OVERVIEW_ERRORS, createErrorLink, createMaxYearError } from "../../../constants/projectOverviewError";
import { Link } from "react-router-dom";
import { getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';


import TextInput from "../component/TextInput";
import TextArea from "../component/TextArea";
import NumberInput from "../component/NumberInput";
import RadioGroup from "../component/RadioGroup";
import FileUpload, { FileUploadHandle } from "../../../components/FileUpload";


import { ProjectOverviewModel } from '../../../types/projectOverview';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { useAuthUser } from '../../../hooks/useAuthUser';
// import SearchableDropdown from "../../../components/SearchableDropdown";
import { FILE_CATEGORIES } from "../../../constants/fileCategoryConstants";
import { useGetApplicationId } from '../../../hooks/useGetApplicationId';

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
	relatedApplicationsDetails: "",
	hasRelatedCpo: "",
	relatedCpoDetails: "",
	eipDetails: "",
	uploadedFiles: [],
	applicationDocuments: [],
	projectId: "",
	applicationId: "",
	createdBy: "",
};

const ProjectOverview = () => {
	const params = useParams();
	const navigate = useNavigate();
	const [formState, setFormState] = useState<ProjectOverviewModel>(emptyProjectOverview);
	const fileUploadRef = useRef<FileUploadHandle>(null);
	const errorSummaryRef = useRef<HTMLDivElement>(null);
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	
	// Handle file deletion
	const handleDeleteFile = (fileId: string) => {
		setFormState(prev => ({
			...prev,
			uploadedFiles: prev.uploadedFiles.filter(file => file.id !== fileId),
			applicationDocuments: prev.applicationDocuments.filter(doc => doc.fileId !== fileId)
		}));
	};
	const [errors, setErrors] = useState<string[]>([]);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user } = useAuthUser();
	const userId = user?.user_id;

	// Scroll and focus error summary ONLY when errors first appear (not on every error state change)
	const prevErrorsRef = React.useRef<number>(0);
	const prevFileValidationErrorsRef = React.useRef<number>(0);
	useEffect(() => {
		const hadNoErrors = prevErrorsRef.current === 0 && prevFileValidationErrorsRef.current === 0;
		const hasErrors = (errors.length > 0 || fileValidationErrors.length > 0);
		if (hadNoErrors && hasErrors && errorSummaryRef.current) {
			errorSummaryRef.current.focus();
			errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
		prevErrorsRef.current = errors.length;
		prevFileValidationErrorsRef.current = fileValidationErrors.length;
	}, [errors, fileValidationErrors]);

	// Helper function to clear field-specific errors (always use *-inputValue keys)
	const clearFieldError = (fieldName: string) => {
		// Always clear both the *-inputValue and legacy keys for robustness
		setFieldErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[fieldName];
			// Also try deleting legacy keys for migration safety
			if (fieldName.endsWith('-inputValue')) {
				const legacyKey = fieldName.replace('-inputValue', '');
				delete newErrors[legacyKey];
			}
			return newErrors;
		});
		// Clear from errors array (error summary links)
		setErrors(prev => prev.filter(error => !error.includes(`#${fieldName}`)));
	};
	// Helper to get applicationId from store, params, or query string

	const applicationId = useGetApplicationId();

	const { projectOverview, months, MAX_DESCRIPTION_LENGTH } = CONTENT;
	const { projectOverview: projectData, fetchProjectOverview, saveProject } = useProjectOverview();
	const remainingChars = Math.max(0, MAX_DESCRIPTION_LENGTH - formState.projectDescription.length);
	const getRelatedCpoDetailsString = (val: typeof formState.relatedCpoDetails) =>
		typeof val === 'string' ? val : (val && typeof val.field === 'string' ? val.field : '');
	const relatedCpoDetailsStr = getRelatedCpoDetailsString(formState.relatedCpoDetails);
	const remainingCpoChars = Math.max(0, MAX_DESCRIPTION_LENGTH - relatedCpoDetailsStr.length);
	const remainingRelatedAppsChars = Math.max(0, MAX_DESCRIPTION_LENGTH - formState.relatedApplicationsDetails.length);

	// Track previous application ID to detect actual changes
	const prevAppIdRef = useRef(applicationId);
	const hasFetchedRef = useRef(false);
	const hasBindDataRef = useRef(false);

	// Clear form only when switching to a different application
	useEffect(() => {
		if (prevAppIdRef.current !== applicationId) {
			setFormState(emptyProjectOverview);
			prevAppIdRef.current = applicationId;
			hasFetchedRef.current = false; // Reset fetch flag
			hasBindDataRef.current = false; // Reset bind flag here
		}
	}, [applicationId]);

	// Fetch project overview once per application (hasFetchedRef guards against repeated fetches)
	useEffect(() => {
		if (applicationId && !hasFetchedRef.current) {
			fetchProjectOverview(applicationId);
			hasFetchedRef.current = true;
		}
	}, [applicationId, fetchProjectOverview]);


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

	// Clear file upload errors when files are selected
	useEffect(() => {
		if (pendingFiles.length > 0 || (formState.uploadedFiles && formState.uploadedFiles.length > 0)) {
			clearFieldError('planInformationDocuments');
			setFileValidationErrors([]);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pendingFiles.length, formState.uploadedFiles.length]);

	// Bind fetched data ONLY once (prevents overwriting unsaved changes)
	useEffect(() => {
		if (hasBindDataRef.current || !projectData) return;
		
		if (projectData && applicationId && projectData.applicationId === applicationId) {
			hasBindDataRef.current = true;
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
				relatedApplicationsDetails: projectData.relatedApplicationsDetails ?? "",
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
						storageProvider: f.storageProvider || '',
						s3Key: f.s3Key || '',
						bucketName: f.bucketName || '',
						virtualFolder: f.virtualFolder || '',
						filename: f.filename || '',
						fileContentType: f.fileContentType || '',
						fileSizeBytes: f.fileSizeBytes || 0,
						uploadedAtTimestamp: f.uploadedAtTimestamp || ''
					}))
					: [],
				applicationDocuments: Array.isArray(projectData.applicationDocuments)
					? projectData.applicationDocuments.map(d => ({
						documentId: d.documentId || '',
						applicationId: d.applicationId || '',
						fileId: d.fileId || '',
						category: d.category || '',
						title: d.title || '',
						virtualFolder: d.virtualFolder || '',
						addedBy: d.addedBy || '',
						addedAt: d.addedAt || '',
						description: d.description || ''
					}))
					: []
			});
		}
	}, [projectData, applicationId]);

	return (
		<div className="govuk-width-container">
			<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
				<ol className="govuk-breadcrumbs__list">
					<li className="govuk-breadcrumbs__list-item">
						<Link
							className="govuk-breadcrumbs__link"
							to={`${S37_BASE_URL}/${applicationId}/task-list`}
						>
							{projectOverview.breadcrumb.taskList}
						</Link>
					</li>
					<li className="govuk-breadcrumbs__list-item" aria-current="page">
						{projectOverview.breadcrumb.current}
					</li>
				</ol>
			</nav>
			<main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
				<h1 className="govuk-heading-l">{projectOverview.heading}</h1>
				   {errors.length > 0 && (
					   <div ref={errorSummaryRef} className="govuk-error-summary govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
						   <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
						   <div className="govuk-error-summary__body">
							   <ul className="govuk-list govuk-error-summary__list">
							   {errors.map((err, idx) => {
								   // Parse error link: errors are in format '<a href="#id">message</a>'
								   const match = err.match(/<a href="#([^"]+)">([^<]+)<\/a>/);
								   if (match) {
									   const [, href, message] = match;
									   return (
										   <li key={idx}>
											   <a href={`#${href}`}>{message}</a>
										   </li>
									   );
								   }
								   return <li key={idx}>{err}</li>;
							   })}
							   </ul>
						   </div>
					   </div>
				   )}
				<form method="post" onSubmit={async e => {
					e.preventDefault();
					setIsSubmitting(true);

					// Track if we uploaded files in this submission
					let filesWereUploaded = false;
					let newlyUploadedFiles: UploadedFile[] = [];
					let newlyUploadedDocuments: ApplicationDocument[] = [];

					// First, upload any pending files to S3
					if (fileUploadRef.current && pendingFiles.length > 0) {
						try {
							const result = await fileUploadRef.current.triggerUpload();
							filesWereUploaded = true; // Mark that files were uploaded
							newlyUploadedFiles = result.uploadedFiles;
							newlyUploadedDocuments = result.applicationDocuments;
						} catch (error) {
							setErrors(['Failed to upload files. Please try again.']);
							setIsSubmitting(false);
							window.scrollTo({ top: 0 });
							return;
						}
					}

					const newErrors: string[] = [];
					const newFieldErrors: Record<string, string> = {};

					// Add file validation errors
					if (fileValidationErrors.length > 0) {
						fileValidationErrors.forEach(error => {
							newErrors.push(`<a href="#file-upload">${error}</a>`);
						});
						newFieldErrors.uploadedFiles = fileValidationErrors[0]; // Show first error in field
					}

					// Validate Project Name
					if (!formState.projectName?.trim()) {
						newErrors.push(createErrorLink('projectName-inputValue', PROJECT_OVERVIEW_ERRORS.PROJECT_NAME_REQUIRED));
						newFieldErrors['projectName-inputValue'] = PROJECT_OVERVIEW_ERRORS.PROJECT_NAME_REQUIRED;
					}

					// Validate Project Description
					if (!formState.projectDescription?.trim()) {
						newErrors.push(createErrorLink('projectDescription-inputValue', PROJECT_OVERVIEW_ERRORS.PROJECT_DESCRIPTION_REQUIRED));
						newFieldErrors['projectDescription-inputValue'] = PROJECT_OVERVIEW_ERRORS.PROJECT_DESCRIPTION_REQUIRED;
					}

					// Validate Tallest Pole Height
					if (!formState.tallestPoleHeight?.trim()) {
						newErrors.push(createErrorLink('tallestPoleHeight-inputValue', PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_REQUIRED));
						newFieldErrors['tallestPoleHeight-inputValue'] = PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_REQUIRED;
					} else {
						const val = formState.tallestPoleHeight.trim();
						const numVal = Number(val);

						if (isNaN(numVal)) {
							newErrors.push(createErrorLink('tallestPoleHeight-inputValue', PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_INVALID_NUMBER));
							newFieldErrors['tallestPoleHeight-inputValue'] = PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_INVALID_NUMBER;
						} else if (numVal < 0) {
							newErrors.push(createErrorLink('tallestPoleHeight-inputValue', PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_NEGATIVE));
							newFieldErrors['tallestPoleHeight-inputValue'] = PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_NEGATIVE;
						} else if (numVal > 9999) {
							newErrors.push(createErrorLink('tallestPoleHeight-inputValue', PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_TOO_LARGE));
							newFieldErrors['tallestPoleHeight-inputValue'] = PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_TOO_LARGE;
						} else {
							// Check for more than two decimal places
							const decimalPart = val.includes('.') ? val.split('.')[1] : '';
							if (decimalPart.length > 2) {
								newErrors.push(createErrorLink('tallestPoleHeight-inputValue', PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_DECIMAL_PLACES));
								newFieldErrors['tallestPoleHeight-inputValue'] = PROJECT_OVERVIEW_ERRORS.TALLEST_POLE_HEIGHT_DECIMAL_PLACES;
							}
						}
					}

					// Validate Plan Reference
					if (!formState.planReference?.trim()) {
						newErrors.push(createErrorLink('planReference-inputValue', PROJECT_OVERVIEW_ERRORS.PLAN_REFERENCE_REQUIRED));
						newFieldErrors['planReference-inputValue'] = PROJECT_OVERVIEW_ERRORS.PLAN_REFERENCE_REQUIRED;
					}

					// Validate Work Start Dates Known
					if (!formState.areWorkStartDatesKnown) {
						newErrors.push(createErrorLink('areWorkStartDatesKnown', PROJECT_OVERVIEW_ERRORS.WORK_START_DATES_REQUIRED));
						newFieldErrors.areWorkStartDatesKnown = PROJECT_OVERVIEW_ERRORS.WORK_START_DATES_REQUIRED;
					}
					// --- Refactored date validation logic ---
					// Helper: Validate month/year pair
					function validateMonthYear(month: string, year: string, fieldPrefix: string, options?: { mustBeFuture?: boolean }) {
						const errors: string[] = [];
						let fieldError = "";
						let yearInvalid = false;
						
						// Determine which error messages to use based on fieldPrefix
						const isEarliest = fieldPrefix === "earliestWorkStartDate";
						const requiredMsg = isEarliest ? PROJECT_OVERVIEW_ERRORS.EARLIEST_DATE_REQUIRED : PROJECT_OVERVIEW_ERRORS.LATEST_DATE_REQUIRED;
						const invalidYearMsg = isEarliest ? PROJECT_OVERVIEW_ERRORS.EARLIEST_DATE_INVALID_YEAR : PROJECT_OVERVIEW_ERRORS.LATEST_DATE_INVALID_YEAR;
						const monthAnchor = `${fieldPrefix}-month`;
						const yearAnchor = `${fieldPrefix}-year`;
						
						if (!month || !year?.trim()) {
							errors.push(createErrorLink(monthAnchor, requiredMsg));
							fieldError = requiredMsg;
							if (!year?.trim()) yearInvalid = true;
						} else if (!/^\d{4}$/.test(year.trim())) {
							yearInvalid = true;
						} else {
							const monthNum = months.findIndex(m => m.toLowerCase() === month.toLowerCase()) + 1;
							if (monthNum > 0 && options?.mustBeFuture) {
								const today = new Date();
								today.setHours(0, 0, 0, 0);
								const currentYear = today.getFullYear();
								const currentMonth = today.getMonth() + 1;
								if (
									Number(year) < currentYear ||
									(Number(year) === currentYear && monthNum < currentMonth)
								) {
									errors.push(createErrorLink(monthAnchor, PROJECT_OVERVIEW_ERRORS.EARLIEST_DATE_MUST_BE_FUTURE));
									fieldError = PROJECT_OVERVIEW_ERRORS.EARLIEST_DATE_MUST_BE_FUTURE;
								}
							}
						}
						if (yearInvalid) {
							errors.push(createErrorLink(yearAnchor, invalidYearMsg));
						}
						return { errors, fieldError, yearInvalid };
					}

					// Helper: Compare two month/year pairs
					function compareMonthYear(earliestMonth: string, earliestYear: string, latestMonth: string, latestYear: string) {
						const earliestMonthNum = months.findIndex(m => m.toLowerCase() === earliestMonth.toLowerCase()) + 1;
						const latestMonthNum = months.findIndex(m => m.toLowerCase() === latestMonth.toLowerCase()) + 1;
						if (earliestMonthNum > 0 && latestMonthNum > 0 && /^\d{4}$/.test(earliestYear) && /^\d{4}$/.test(latestYear)) {
							const earliestDate = new Date(Number(earliestYear), earliestMonthNum - 1, 1);
							const latestDate = new Date(Number(latestYear), latestMonthNum - 1, 1);
							if (
								latestDate.getFullYear() < earliestDate.getFullYear() ||
								(latestDate.getFullYear() === earliestDate.getFullYear() && latestDate.getMonth() < earliestDate.getMonth())
							) {
								return {
									error: createErrorLink('latestWorkStartDate-month', PROJECT_OVERVIEW_ERRORS.LATEST_DATE_COMPARE_ERROR),
									fieldError: PROJECT_OVERVIEW_ERRORS.LATEST_DATE_COMPARE_ERROR
								};
							}
						}
						return null;
					}

					if (formState.areWorkStartDatesKnown === "true") {
						// Earliest expected start date
						const earliest = validateMonthYear(
							formState.earliestWorkStartDateMonth,
							formState.earliestWorkStartDateYear,
							"earliestWorkStartDate",
							{ mustBeFuture: true }
						);
						if (earliest.errors.length > 0) {
							newErrors.push(...earliest.errors);
							newFieldErrors.earliestWorkStartDate = earliest.fieldError;
						}
						// Latest expected start date
						const latest = validateMonthYear(
							formState.latestWorkStartDateMonth,
							formState.latestWorkStartDateYear,
							"latestWorkStartDate"
						);
						if (latest.errors.length > 0) {
							newErrors.push(...latest.errors);
							newFieldErrors.latestWorkStartDate = latest.fieldError;
						}
						// Compare earliest and latest
						if (!earliest.yearInvalid && !latest.yearInvalid) {
							const compareResult = compareMonthYear(
								formState.earliestWorkStartDateMonth,
								formState.earliestWorkStartDateYear,
								formState.latestWorkStartDateMonth,
								formState.latestWorkStartDateYear
							);
							if (compareResult) {
								newErrors.push(compareResult.error);
								newFieldErrors.latestWorkStartDate = compareResult.fieldError;
							}
						}
						// Additional business logic: restrict latest year to reasonable future (e.g., max current year + 50)
						if (!latest.yearInvalid && /^\d{4}$/.test(formState.latestWorkStartDateYear)) {
							const maxYear = new Date().getFullYear() + 50;
							const enteredLatestYear = parseInt(formState.latestWorkStartDateYear, 10);
							if (enteredLatestYear > maxYear) {
								const maxYearError = createMaxYearError(maxYear);
								newErrors.push(createErrorLink('latestWorkStartDate-year', maxYearError));
								newFieldErrors.latestWorkStartDate = maxYearError;
							}
						}
					}
					// Validate File Upload - skip if files were just uploaded (state update is async)
					if (!filesWereUploaded && (!formState.uploadedFiles || formState.uploadedFiles.length === 0) && pendingFiles.length === 0) {
						newErrors.push(createErrorLink('planInformationDocuments', PROJECT_OVERVIEW_ERRORS.FILE_UPLOAD_REQUIRED));
						newFieldErrors.uploadedFiles = PROJECT_OVERVIEW_ERRORS.FILE_UPLOAD_REQUIRED;
					}

					// Validate Related Applications
					if (!formState.hasRelatedApplications) {
						newErrors.push(createErrorLink('hasRelatedApplications', PROJECT_OVERVIEW_ERRORS.RELATED_APPLICATIONS_REQUIRED));
						newFieldErrors['hasRelatedApplications-inputValue'] = PROJECT_OVERVIEW_ERRORS.RELATED_APPLICATIONS_REQUIRED;
					}

					// Validation: If user selects 'Yes' for related applications but no details are provided
					if (formState.hasRelatedApplications === "true" && !formState.relatedApplicationsDetails.trim()) {
						newErrors.push('<a href="#relatedApplicationsDetails-inputValue">Enter details of all related applications</a>');
						newFieldErrors['relatedApplicationsDetails-inputValue'] = "Enter details of all related applications";
					}

					// Validate Related CPO
					if (!formState.hasRelatedCpo) {
						newErrors.push(createErrorLink('hasRelatedCpo', PROJECT_OVERVIEW_ERRORS.RELATED_CPO_REQUIRED));
						newFieldErrors['hasRelatedCpo-inputValue'] = PROJECT_OVERVIEW_ERRORS.RELATED_CPO_REQUIRED;
					}

					// Validate Related CPO Details
					if (formState.hasRelatedCpo === "true" && !getRelatedCpoDetailsString(formState.relatedCpoDetails).trim()) {
						newErrors.push(createErrorLink('relatedCpoDetails-inputValue', PROJECT_OVERVIEW_ERRORS.RELATED_CPO_DETAILS_REQUIRED));
						newFieldErrors['relatedCpoDetails-inputValue'] = PROJECT_OVERVIEW_ERRORS.RELATED_CPO_DETAILS_REQUIRED;
					}
					// Removed EIP details validation logic as requested
					setErrors(newErrors);
					setFieldErrors(newFieldErrors);
					setIsSubmitting(false);
					if (newErrors.length > 0) {
						window.scrollTo({ top: 0 });
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
						createdBy: userId || '',
						applicationFormId: formState.applicationFormId === '' ? undefined : formState.applicationFormId,
						earliestWorkStartDateMonth: shouldClearDates ? '' : (formState.earliestWorkStartDateMonth ? monthNameToNum(formState.earliestWorkStartDateMonth) : ''),
						earliestWorkStartDateYear: shouldClearDates ? '' : (formState.earliestWorkStartDateYear || ''),
						latestWorkStartDateMonth: shouldClearDates ? '' : (formState.latestWorkStartDateMonth ? monthNameToNum(formState.latestWorkStartDateMonth) : ''),
						latestWorkStartDateYear: shouldClearDates ? '' : (formState.latestWorkStartDateYear || ''),
						// Include both existing uploaded files and newly uploaded files from this submission
						uploadedFiles: [...(formState.uploadedFiles || []), ...newlyUploadedFiles].map(f => ({
							id: f.id,
							storageProvider: f.storageProvider,
							s3Key: f.s3Key,
							bucketName: f.bucketName,
							virtualFolder: f.virtualFolder,
							filename: f.filename,
							fileContentType: f.fileContentType,
							fileSizeBytes: f.fileSizeBytes,
							uploadedAtTimestamp: f.uploadedAtTimestamp

						})),
						// Always send relatedCpoDetails as string (not object)
						relatedCpoDetails: typeof formState.relatedCpoDetails === 'object' && formState.relatedCpoDetails !== null
							? formState.relatedCpoDetails.field || ''
							: (formState.relatedCpoDetails || ''),
						// Send relatedApplicationsDetails as string
						relatedApplicationsDetails: formState.relatedApplicationsDetails || '',
						// Include both existing application documents and newly uploaded documents from this submission
						applicationDocuments: [...(formState.applicationDocuments || []), ...newlyUploadedDocuments].map(d => ({
							documentId: d.documentId || '',
							applicationId: d.applicationId || '',
							fileId: d.fileId || '',
							category: d.category || '',
							title: d.title || '',
							virtualFolder: d.virtualFolder || '',
							addedBy: d.addedBy || '',
							addedAt: d.addedAt || '',
							description: d.description || ''
						})),
					};
					
					saveProject(payload)
						.then((response: any) => {
							// Try to get application id from backend response, fallback to payload/params/query string
							const redirectId =
								response?.project?.application_id ||
								response?.application_overview?.application_id ||
								applicationIdForSave ||
								'';
							// Navigate to the next page in the task list sequence
							const nextPageUrl = getNextPageUrl(TASK_NAMES.PROJECT_OVERVIEW, redirectId);
							navigate(nextPageUrl);
						})
						.catch((err: any) => {
							setErrors([err.message || 'Failed to save project overview']);
						});
					return;
				}}>

					{/* Project Name Section */}
					<h2 className="govuk-heading-s govuk-!-margin-bottom-2">Project name</h2>
					<div className="govuk-form-group govuk-!-width-two-thirds">
						<TextInput
							label=""
							id="projectName-inputValue"
							name="projectName.inputValue"
							value={formState.projectName}
							error={fieldErrors['projectName-inputValue']}
							maxLength={4000}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setFormState(prev => ({ ...prev, projectName: e.target.value }));
								clearFieldError('projectName-inputValue');
							}}
						/>
					</div>

					{/* Project Description Section */}
					<h2 className="govuk-heading-s govuk-!-margin-bottom-2">Project description</h2>
					<div className="govuk-form-group govuk-character-count govuk-!-width-two-thirds govuk-!-margin-bottom-2" data-module="govuk-character-count" data-maxlength={MAX_DESCRIPTION_LENGTH}>
						<TextArea
							label=""
							id="projectDescription-inputValue"
							name="projectDescription.inputValue"
							value={formState.projectDescription}
							error={fieldErrors['projectDescription-inputValue']}
							maxLength={MAX_DESCRIPTION_LENGTH}
							infoId="projectDescription-inputValue-info"
							remainingChars={remainingChars}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
								const val = e.target.value;
								if (val.length <= MAX_DESCRIPTION_LENGTH) {
									setFormState(prev => ({ ...prev, projectDescription: val }));
								} else {
									setFormState(prev => ({ ...prev, projectDescription: val.slice(0, MAX_DESCRIPTION_LENGTH) }));
								}
								clearFieldError('projectDescription-inputValue');
							}}
						/>
					</div>

					{/* Details: What type of information should be provided */}
					<details className="govuk-details govuk-!-margin-bottom-6" data-module="govuk-details">
						<summary className="govuk-details__summary">
							<span className="govuk-details__summary-text">{projectOverview.infoDetailsSummary}</span>
						</summary>
						<div className="govuk-details__text">
							<p className="govuk-body">
								{projectOverview.infoDetailsText}
							</p>
						</div>
					</details>

					{/* Tallest Pole Height Section */}
					<h2 className="govuk-heading-s govuk-!-margin-bottom-2">What is the height of the tallest proposed pole?</h2>
					<div className="govuk-!-margin-bottom-6 govuk-!-width-one-third">
						<NumberInput
							label=""
							suffix={projectOverview.tallestPoleHeightSuffix}
							id="tallestPoleHeight-inputValue"
							name="tallestPoleHeight.inputValue"
							value={formState.tallestPoleHeight}
							error={fieldErrors['tallestPoleHeight-inputValue']}
							maxLength={4000}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setFormState(prev => ({ ...prev, tallestPoleHeight: e.target.value }));
								clearFieldError('tallestPoleHeight-inputValue');
							}}
						/>
					</div>

					{/* Plan Reference Section */}
					<h2 className="govuk-heading-s govuk-!-margin-bottom-2">Plan reference</h2>
					<div className={`govuk-form-group govuk-!-margin-bottom-6 govuk-!-width-two-thirds${fieldErrors['planReference-inputValue'] ? " govuk-form-group--error" : ""}`}>
						<label className="govuk-label govuk-visually-hidden" htmlFor="planReference-inputValue">
							Plan reference
						</label>
						{fieldErrors['planReference-inputValue'] && (
							<p id="planReference-inputValue-error" className="govuk-error-message">
								<span className="govuk-visually-hidden">Error:</span> {fieldErrors['planReference-inputValue']}
							</p>
						)}
						<input
							className={`govuk-input${fieldErrors['planReference-inputValue'] ? " govuk-input--error" : ""}`}
							id="planReference-inputValue"
							name="planReference.inputValue"
							type="text"
							maxLength={4000}
							value={formState.planReference}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setFormState(prev => ({ ...prev, planReference: e.target.value }));
								clearFieldError('planReference-inputValue');
							}}
							aria-describedby={fieldErrors['planReference-inputValue'] ? "planReference-inputValue-error" : undefined}
						/>
					</div>

					{/* Work Start Dates Known */}
					<div className={`govuk-form-group govuk-!-margin-bottom-6 govuk-!-width-three-quarters${fieldErrors?.areWorkStartDatesKnown ? " govuk-form-group--error" : ""}`}>
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
									<input className="govuk-radios__input" id="areWorkStartDatesKnown" name="areWorkStartDatesKnown" type="radio" value="true" checked={formState.areWorkStartDatesKnown === "true"} onChange={() => {
										setFormState(prev => ({ ...prev, areWorkStartDatesKnown: "true" }));
										clearFieldError('areWorkStartDatesKnown');
									}} aria-controls="areWorkStartDatesKnown-hidden" aria-expanded={formState.areWorkStartDatesKnown === "true" ? "true" : "false"} />
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
																onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
																	setFormState(prev => ({ ...prev, earliestWorkStartDateMonth: e.target.value }));
																	clearFieldError('earliestWorkStartDate-month');
																}}
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
																onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																	setFormState(prev => ({ ...prev, earliestWorkStartDateYear: e.target.value }));
																	clearFieldError('earliestWorkStartDate-year');
																}}
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
																onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
																	setFormState(prev => ({ ...prev, latestWorkStartDateMonth: e.target.value }));
																	clearFieldError('latestWorkStartDate-month');
																}}
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
																onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
																	setFormState(prev => ({ ...prev, latestWorkStartDateYear: e.target.value }));
																	clearFieldError('latestWorkStartDate-year');
																}}
															/>
														</div>
													</div>
												</div>
											</fieldset>
										</div>
									</div>
								)}
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="areWorkStartDatesKnown-no" name="areWorkStartDatesKnown" type="radio" value="false" checked={formState.areWorkStartDatesKnown === "false"} onChange={() => {
										setFormState(prev => ({ ...prev, areWorkStartDatesKnown: "false" }));
										clearFieldError('areWorkStartDatesKnown');
									}} />
									<label className="govuk-label govuk-radios__label" htmlFor="areWorkStartDatesKnown-no">No</label>
								</div>
							</div>
						</fieldset>
					</div>

					{/* Plan Information Documents */}
					<div id="planInformationDocuments" className={`govuk-form-group${fieldErrors?.uploadedFiles ? " govuk-form-group--error" : ""} govuk-!-margin-bottom-0`}>
						<fieldset className="govuk-fieldset">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
								{projectOverview.planInformationDocuments}
							</legend>
						{fieldErrors?.uploadedFiles && (
							<p id="uploadedFiles-error" className="govuk-error-message">
								<span className="govuk-visually-hidden">Error:</span> {fieldErrors.uploadedFiles}
							</p>
						)}
							
							{formState.applicationDocuments && formState.applicationDocuments.length > 0 && (
								<div className="govuk-!-margin-top-2">
									<h3 className="govuk-heading-s">Documents uploaded</h3>
								</div>
							)}
							
							<FileUpload
								ref={fileUploadRef}
								title='Upload a file'
								showTitle={false}
								prefix={`${applicationId}/${FILE_CATEGORIES.PLAN_INFO}`}
								applicationId={applicationId}
								category={FILE_CATEGORIES.PLAN_INFO}
								addedBy={userId}
								uploadedFiles={formState.uploadedFiles}
								applicationDocuments={formState.applicationDocuments}
								uploadImmediately={true} 
								onDeleteFile={handleDeleteFile}
								onPendingFilesChange={setPendingFiles}
								onValidationErrors={(errors) => {
									setFileValidationErrors(errors);
									if (errors.length > 0) {
										setFieldErrors(prev => ({ ...prev, uploadedFiles: errors[0] }));
										setErrors(prev => [
											...prev.filter(e => !e.includes('#planInformationDocuments')),
											...errors.map(error => `<a href="#planInformationDocuments">${error}</a>`)
										]);
									} else {
										setFieldErrors(prev => { const newErrors = { ...prev }; delete newErrors.uploadedFiles; return newErrors; });
										setErrors(prev => prev.filter(e => !e.includes('#planInformationDocuments')));
									}
								}} onUploaded={(newUploadedFiles, newProjectDocuments) => {
									setFormState(prev => ({
										...prev,
										uploadedFiles: [...(prev.uploadedFiles || []), ...newUploadedFiles],
										applicationDocuments: [...(prev.applicationDocuments || []), ...newProjectDocuments]
									}));
								}}
							/>
						</fieldset>
					</div>

					{/* Details: What information should be included in the plan */}
					<details className="govuk-details govuk-!-margin-bottom-6">
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
					<div className={`govuk-form-group${fieldErrors['hasRelatedApplications-inputValue'] ? " govuk-form-group--error" : ""}`}>
						<fieldset className="govuk-fieldset" aria-describedby={`relatedApplications-hint${fieldErrors?.hasRelatedApplications ? ' hasRelatedApplications-error' : ''}`.trim()} id="relatedApplications-section">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
								<h2 className="govuk-fieldset__heading">{projectOverview.relatedApplications}</h2>
							</legend>
							<div className="govuk-hint govuk-!-width-two-thirds" id="relatedApplications-hint">
								{projectOverview.relatedApplicationsHint}
							</div>
							{fieldErrors['hasRelatedApplications-inputValue'] && (
								<p id="hasRelatedApplications-error" className="govuk-error-message">
									<span className="govuk-visually-hidden">Error:</span> {fieldErrors['hasRelatedApplications-inputValue']}
								</p>
							)}
							<div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input 
										className="govuk-radios__input" 
										id="hasRelatedApplications" 
										name="hasRelatedApplications" 
										type="radio" 
										value="true" 
										checked={formState.hasRelatedApplications === "true"} 
										onChange={() => setFormState(prev => ({ ...prev, hasRelatedApplications: "true" }))} 
										aria-controls="hasRelatedApplications-hidden" 
										aria-expanded={formState.hasRelatedApplications === "true" ? "true" : "false"} 
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="hasRelatedApplications">Yes</label>
								</div>
								{formState.hasRelatedApplications === "true" && (
									<div className="govuk-radios__conditional" id="hasRelatedApplications-hidden">
										<div className="govuk-form-group govuk-character-count" data-module="govuk-character-count" data-maxlength={MAX_DESCRIPTION_LENGTH}>
										<label className="govuk-label govuk-!-width-two-thirds" htmlFor="relatedApplicationsDetails-inputValue">
											{projectOverview.relatedApplicationsDetails}
										</label>
										<div className="govuk-hint govuk-!-width-two-thirds" id="relatedApplicationsDetails-hint">
												{projectOverview.relatedApplicationsDetailsHint}
											</div>
											{fieldErrors['relatedApplicationsDetails-inputValue'] && (
												<p id="relatedApplicationsDetails-inputValue-error" className="govuk-error-message">
													<span className="govuk-visually-hidden">Error:</span> {fieldErrors['relatedApplicationsDetails-inputValue']}
												</p>
											)}
											<textarea
											className={`govuk-textarea govuk-!-width-two-thirds govuk-js-character-count${fieldErrors?.relatedApplicationsDetails ? " govuk-textarea--error" : ""}`}
												id="relatedApplicationsDetails-inputValue"
												name="relatedApplicationsDetails.inputValue"
												rows={5}
												maxLength={MAX_DESCRIPTION_LENGTH}
												value={formState.relatedApplicationsDetails}
												onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
													const val = e.target.value;
													if (val.length <= MAX_DESCRIPTION_LENGTH) {
														setFormState(prev => ({ ...prev, relatedApplicationsDetails: val }));
													} else {
														setFormState(prev => ({ ...prev, relatedApplicationsDetails: val.slice(0, MAX_DESCRIPTION_LENGTH) }));
													}
													clearFieldError('relatedApplicationsDetails-inputValue');
												}}
												aria-describedby={fieldErrors?.relatedApplicationsDetails ? "relatedApplicationsDetails-inputValue-error relatedApplicationsDetails-hint relatedApplicationsDetails-inputValue-info" : "relatedApplicationsDetails-hint relatedApplicationsDetails-inputValue-info"}
											></textarea>
											<div id="relatedApplicationsDetails-inputValue-info" className="govuk-hint govuk-character-count__message govuk-visually-hidden">You can enter up to {MAX_DESCRIPTION_LENGTH} characters</div>
											<div className="govuk-hint govuk-character-count__message govuk-character-count__status" aria-hidden="true">You have {remainingRelatedAppsChars} characters remaining</div>
											<div className="govuk-character-count__sr-status govuk-visually-hidden" aria-live="polite">You have {remainingRelatedAppsChars} characters remaining</div>
										</div>
									</div>
								)}
								<div className="govuk-radios__item">
									<input 
										className="govuk-radios__input" 
										id="hasRelatedApplications-no" 
										name="hasRelatedApplications" 
										type="radio" 
										value="false" 
										checked={formState.hasRelatedApplications === "false"} 
										onChange={() => {
											setFormState(prev => ({ ...prev, hasRelatedApplications: "false", relatedApplicationsDetails: "" }));
											clearFieldError('hasRelatedApplications-inputValue');
										}} 
									/>
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
									<label className="govuk-label govuk-!-width-two-thirds" htmlFor="relatedCpoDetails-inputValue">
										{projectOverview.relatedCpoDetails}
									</label>
									{fieldErrors['relatedCpoDetails-inputValue'] && (
										<p id="relatedCpoDetails-inputValue-error" className="govuk-error-message">
											<span className="govuk-visually-hidden">Error:</span> {fieldErrors['relatedCpoDetails-inputValue']}
										</p>
									)}
									<textarea
										className={`govuk-textarea govuk-!-width-two-thirds govuk-js-character-count${fieldErrors['relatedCpoDetails-inputValue'] ? " govuk-textarea--error" : ""}`}
										id="relatedCpoDetails-inputValue"
										name="relatedCpoDetails.inputValue"
										rows={5}
										maxLength={MAX_DESCRIPTION_LENGTH}
										value={relatedCpoDetailsStr}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
											setFormState(prev => ({ ...prev, relatedCpoDetails: e.target.value }));
											clearFieldError('relatedCpoDetails-inputValue');
										}}
										aria-describedby={fieldErrors['relatedCpoDetails-inputValue'] ? "relatedCpoDetails-inputValue-error relatedCpoDetails-inputValue-info" : "relatedCpoDetails-inputValue-info"}
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
						error={fieldErrors['hasRelatedCpo-inputValue']}
						onChange={(val: string) => {
							setFormState(prev => ({ ...prev, hasRelatedCpo: val }));
							clearFieldError('hasRelatedCpo-inputValue');
						}}
						ariaControls={["hasRelatedCpo-hidden", "hasRelatedCpo-no-hidden"]}
					/>

					<button type="submit" className="govuk-button" value="Save and continue" name="Save and continue" disabled={isSubmitting}>
						{projectOverview.saveAndContinue}
					</button>
				</form>
			</main>
		</div>
	);
}

export default ProjectOverview;