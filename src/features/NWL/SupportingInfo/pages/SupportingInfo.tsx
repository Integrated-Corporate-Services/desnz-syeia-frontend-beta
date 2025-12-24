import React, { useState, useEffect } from "react";
import FileUpload from '../../../../components/FileUpload';
import { Link, useParams, useNavigate } from "react-router-dom";
import { NWL_BASE_URL } from "../../../../constants/nwl";
import { nwlSupportingInfo } from "../../../../types/nwlSupportingInfo";
import {getSupportingInfo, saveSupportingInfo} from '../../../../services/NWLSupportingInfoService';
import { useAuthUser } from "../../../../hooks/useAuthUser";
import { NWL_FILE_CATEGORIES, NWL_FILE_SUBCATEGORIES } from "../../../../constants/fileCategoryConstants";	

const SupportingInfo: React.FC = () => {
	// ...existing state declarations...
	const [errors, setErrors] = useState<string[]>([]);
	const [id, setId] = useState<string>("");
	const [signedWayleave, setSignedWayleave] = useState<string>("");
	const [inheritedWayleave, setInheritedWayleave] = useState<string>("");
	const [anyPayments, setAnyPayments] = useState<string>("");
	const [acceptedPayments, setAcceptedPayments] = useState<string>("");
	const [contact, setContact] = useState<string>("");
	const [contactByEmail, setContactByEmail] = useState<string>("");
	const [writtenTermination, setWrittenTermination] = useState<string>("");
	const [writtenTerminationDate, setWrittenTerminationDate] = useState({ day: "", month: "", year: "" });
	const [writtenRemoval, setWrittenRemoval] = useState<string>("");
	const [writtenRemovalDate, setWrittenRemovalDate] = useState({ day: "", month: "", year: "" });
	const [titlePlan, setTitlePlan] = useState<string>("");
	const [titlePlanMissingReason, setTitlePlanMissingReason] = useState<string>("");
	const [signedWayleaveFiles, setSignedWayleaveFiles] = useState<any[]>([]);
	const [inheritedWayleaveFiles, setInheritedWayleaveFiles] = useState<any[]>([]);
	const [anyPaymentsFiles, setAnyPaymentsFiles] = useState<any[]>([]);
	const [acceptedPaymentsFiles, setAcceptedPaymentsFiles] = useState<any[]>([]);
	const [writtenTerminationFiles, setWrittenTerminationFiles] = useState<any[]>([]);
	const [writtenRemovalFiles, setWrittenRemovalFiles] = useState<any[]>([]);
	const [titlePlanFiles, setTitlePlanFiles] = useState<any[]>([]);

	// State for applicationDocuments by category
	const [signedWayleaveDocs, setSignedWayleaveDocs] = useState<any[]>([]);
	const [inheritedWayleaveDocs, setInheritedWayleaveDocs] = useState<any[]>([]);
	const [anyPaymentsDocs, setAnyPaymentsDocs] = useState<any[]>([]);
	const [acceptedPaymentsDocs, setAcceptedPaymentsDocs] = useState<any[]>([]);
	const [writtenTerminationDocs, setWrittenTerminationDocs] = useState<any[]>([]);
	const [writtenRemovalDocs, setWrittenRemovalDocs] = useState<any[]>([]);
	const [titlePlanDocs, setTitlePlanDocs] = useState<any[]>([]);

	// Handlers for onUploaded for each category
	const handleSignedWayleaveUploaded = (newFiles: any[], newDocs: any[]) => {
		setSignedWayleaveFiles(prev => [...prev, ...newFiles]);
		setSignedWayleaveDocs(prev => [...prev, ...newDocs]);
	};
	const handleInheritedWayleaveUploaded = (newFiles: any[], newDocs: any[]) => {
		setInheritedWayleaveFiles(prev => [...prev, ...newFiles]);
		setInheritedWayleaveDocs(prev => [...prev, ...newDocs]);
	};
	const handleAnyPaymentsUploaded = (newFiles: any[], newDocs: any[]) => {
		setAnyPaymentsFiles(prev => [...prev, ...newFiles]);
		setAnyPaymentsDocs(prev => [...prev, ...newDocs]);
	};
	const handleAcceptedPaymentsUploaded = (newFiles: any[], newDocs: any[]) => {
		setAcceptedPaymentsFiles(prev => [...prev, ...newFiles]);
		setAcceptedPaymentsDocs(prev => [...prev, ...newDocs]);
	};
	const handleWrittenTerminationUploaded = (newFiles: any[], newDocs: any[]) => {
		setWrittenTerminationFiles(prev => [...prev, ...newFiles]);
		setWrittenTerminationDocs(prev => [...prev, ...newDocs]);
	};
	const handleWrittenRemovalUploaded = (newFiles: any[], newDocs: any[]) => {
		setWrittenRemovalFiles(prev => [...prev, ...newFiles]);
		setWrittenRemovalDocs(prev => [...prev, ...newDocs]);
	};
	const handleTitlePlanUploaded = (newFiles: any[], newDocs: any[]) => {
		setTitlePlanFiles(prev => [...prev, ...newFiles]);
		setTitlePlanDocs(prev => [...prev, ...newDocs]);
	};

	const params = useParams();
	 const { user } = useAuthUser();
	  const userId = user?.user_id;
	const navigate = useNavigate();
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

	useEffect(() => {
		if (!applicationId) return;
		const fetchSupportingInfo = async () => {
			try {
				const data: nwlSupportingInfo | null = await getSupportingInfo(applicationId);
				if (data) {
					setId(data.id || "");
					setSignedWayleave(data.hasLandownerSignedWayleave ? "Yes" : "No");
					setInheritedWayleave(data.hasInheritedNecessaryWayleave ? "Yes" : "No");
					setAnyPayments(data.hasPriorWayleavePayments ? "Yes" : "No");
					setAcceptedPayments(data.hasPaymentsAcceptedByGrantor ? "Yes" : "No");
					setContact(data.isNewContractImplied ? "email" : "phone");
					setContactByEmail(data.newContractImpliedReason || "");
					setWrittenTermination(data.hasWrittenTerminationNotice ? "Yes" : "No");
					setWrittenTerminationDate(() => {
						const dateStr = data.writtenTerminationNoticeIssueDate;
						if (!dateStr) return { day: "", month: "", year: "" };
						const dateObj = new Date(dateStr);
						if (isNaN(dateObj.getTime())) return { day: "", month: "", year: "" };
						return {
							day: String(dateObj.getDate()).padStart(2, "0"),
							month: String(dateObj.getMonth() + 1).padStart(2, "0"),
							year: String(dateObj.getFullYear())
						};
					});
				   setWrittenRemoval(data.hasWrittenRemovalNotice ? "Yes" : "No");
					setWrittenRemovalDate(() => {
						const dateStr = data.writtenRemovalNoticeIssueDate;
						if (!dateStr) return { day: "", month: "", year: "" };
						const dateObj = new Date(dateStr);
						if (isNaN(dateObj.getTime())) return { day: "", month: "", year: "" };
						return {
							day: String(dateObj.getDate()).padStart(2, "0"),
							month: String(dateObj.getMonth() + 1).padStart(2, "0"),
							year: String(dateObj.getFullYear())
						};
					});
					setTitlePlan(data.hasTitlePlan ? "Yes" : "No");
					setTitlePlanMissingReason(data.titlePlanMissingReason || "");

					// Assign uploadedFiles/applicationDocuments to category states
					const uploadedFiles = Array.isArray(data.uploadedFiles) ? data.uploadedFiles : [];
					const applicationDocuments = Array.isArray(data.applicationDocuments) ? data.applicationDocuments : [];

					// Helper to get UploadedFiles by category using ApplicationDocuments
						function getFilesByCategory(category: string) {
							const docFileIds = applicationDocuments.filter(doc => doc.subCategory === category).map(doc => doc.fileId);
							return uploadedFiles.filter(f => docFileIds.includes(f.id));
						}
						// Helper to get ApplicationDocuments by category
						function getDocsByCategory(category: string) {
							return applicationDocuments.filter(doc => doc.subCategory === category);
						}

					setSignedWayleaveFiles(getFilesByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_SIGNED_WAYLEAVE));
					setInheritedWayleaveFiles(getFilesByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_INHERITED_WAYLEAVE));
					setAnyPaymentsFiles(getFilesByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ANY_PAYMENTS));
					setAcceptedPaymentsFiles(getFilesByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ACCEPTED_PAYMENTS));
					setWrittenTerminationFiles(getFilesByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_TERMINATION_NOTICE));
					setWrittenRemovalFiles(getFilesByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_REMOVAL_NOTICE));
					setTitlePlanFiles(getFilesByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_TITLE_PLAN));

					setSignedWayleaveDocs(getDocsByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_SIGNED_WAYLEAVE));
					setInheritedWayleaveDocs(getDocsByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_INHERITED_WAYLEAVE));
					setAnyPaymentsDocs(getDocsByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ANY_PAYMENTS));
					setAcceptedPaymentsDocs(getDocsByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ACCEPTED_PAYMENTS));
					setWrittenTerminationDocs(getDocsByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_TERMINATION_NOTICE));
					setWrittenRemovalDocs(getDocsByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_REMOVAL_NOTICE));
					setTitlePlanDocs(getDocsByCategory(NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_TITLE_PLAN));
				}
			} catch {
				// Optionally handle fetch error
			}
		};
		fetchSupportingInfo();
	}, [applicationId]);


	 const handleSubmit = async (e: React.FormEvent) => {
		 e.preventDefault();
		 const newErrors: string[] = [];
		 // ...existing validation logic...
		 if (!signedWayleave) newErrors.push('<a href="#signedWayleave-error">Select if the current landowner has signed a wayleave</a>');
		 if (signedWayleave === "Yes" && signedWayleaveFiles.length === 0) {
			 newErrors.push('<a href="#signedWayleave-upload-1-error">Upload current landowners signed wayleave</a>');
		 }
		 if (!inheritedWayleave) newErrors.push('<a href="#inheritedWayleave-error">Select if the current landowner has inherited a wayleave</a>');
		 if (inheritedWayleave === "Yes" && inheritedWayleaveFiles.length === 0) {
			 newErrors.push('<a href="#inheritedWayleave-upload-1-error">Upload a document that shows inheritance of a necessary wayleave</a>');
		 }
		 if (!anyPayments) newErrors.push('<a href="#anyPayments-error">Select if Wayleave Payments have previously been made to the grantor</a>');
		 if (anyPayments === "Yes" && anyPaymentsFiles.length === 0) {
			 newErrors.push('<a href="#anyPayments-upload-1-error">Upload a document that shows payments made to the grantor</a>');
		 }
		 if (!acceptedPayments) newErrors.push('<a href="#acceptedPayments-error">Select if Wayleave Payments have been accepted by the grantor</a>');
		 if (acceptedPayments === "Yes" && acceptedPaymentsFiles.length === 0) {
			 newErrors.push('<a href="#acceptedPayments-upload-1-error">Upload a document that shows payments have been accepted by the grantor</a>');
		 }
		 if (!contact) newErrors.push('<a href="#contact-error">Select if a new contract is implied</a>');
		 if (contact === "email" && !contactByEmail.trim()) {
			 newErrors.push('<a href="#contact-by-email">Enter why you believe a new contract is implied</a>');
		 }
		 if (!writtenTermination) newErrors.push('<a href="#writtenTermination-error">Select if a Written Termination Notice has been given</a>');
		 if (writtenTermination === "Yes" && (!writtenTerminationDate.day.trim() || !writtenTerminationDate.month.trim() || !writtenTerminationDate.year.trim())) {
			 newErrors.push('<a href="#writtenTerminationDate-day">Enter the full Written Termination Notice issue date</a>');
		 }
		 if (writtenTermination === "Yes" && writtenTerminationFiles.length === 0) {
			 newErrors.push('<a href="#writtenTermination-upload-1-error">Upload Written Termination Notice document</a>');
		 }
		 if (!writtenRemoval) newErrors.push('<a href="#writtenRemoval-error">Select if a Written Removal Notice has been given</a>');
		 if (writtenRemoval === "Yes") {
			 if (!writtenRemovalDate.day.trim() || !writtenRemovalDate.month.trim() || !writtenRemovalDate.year.trim()) {
				 newErrors.push('<a href="#writtenRemovalDate-day">Enter the full Written Removal Notice issue date</a>');
			 }
			 if (writtenRemovalFiles.length === 0) {
				 newErrors.push('<a href="#writtenRemoval-upload-1-error">Upload Written Removal Notice document</a>');
			 }
		 }
		 if (!titlePlan) newErrors.push('<a href="#titlePlan-error">Select if your application includes a title plan</a>');
		 if (titlePlan === "Yes" && titlePlanFiles.length === 0) {
			 newErrors.push('<a href="#titlePlan-upload-1-error">Upload the title plan document</a>');
		 }

		 // Clear contactByEmail if No is selected
		 let contactByEmailToSend = contact === "email" ? contactByEmail : "";
		 if (contact !== "email" && contactByEmail) {
			 setContactByEmail("");
		 }

		 setErrors(newErrors);
		 if (newErrors.length > 0) {
			 // Scroll to error summary
			 const errorSummary = document.querySelector('.govuk-error-summary');
			 if (errorSummary) errorSummary.scrollIntoView({ behavior: 'smooth' });
			 return;
		 }

		 // Prepare request object
		 const request: nwlSupportingInfo = {
			 id,
			 applicationId: applicationId,
			 hasLandownerSignedWayleave: signedWayleave === "Yes",
			 hasInheritedNecessaryWayleave: inheritedWayleave === "Yes",
			 hasPriorWayleavePayments: anyPayments === "Yes",
			 hasPaymentsAcceptedByGrantor: acceptedPayments === "Yes",
			 isNewContractImplied: contact === "email",
			 newContractImpliedReason: contactByEmailToSend,
			 hasWrittenTerminationNotice: writtenTermination === "Yes",
			 writtenTerminationNoticeIssueDate: writtenTermination === "Yes"
				 ? `${String(writtenTerminationDate.year).padStart(4, '0')}-${String(writtenTerminationDate.month).padStart(2, '0')}-${String(writtenTerminationDate.day).padStart(2, '0')}`
				 : undefined,
			 hasWrittenRemovalNotice: writtenRemoval === "Yes",
			 writtenRemovalNoticeIssueDate: writtenRemoval === "Yes"
				 ? `${String(writtenRemovalDate.year).padStart(4, '0')}-${String(writtenRemovalDate.month).padStart(2, '0')}-${String(writtenRemovalDate.day).padStart(2, '0')}`
				 : undefined,
			 hasTitlePlan: titlePlan === "Yes",
			 titlePlanMissingReason: titlePlan === "No" ? titlePlanMissingReason : undefined,
			 createdBy: userId,
			 lastUpdatedBy: userId,
			 uploadedFiles: [
				 ...signedWayleaveFiles,
				 ...inheritedWayleaveFiles,
				 ...anyPaymentsFiles,
				 ...acceptedPaymentsFiles,
				 ...writtenTerminationFiles,
				 ...writtenRemovalFiles,
				 ...titlePlanFiles,
			 ],
			 applicationDocuments: [
				 ...signedWayleaveDocs,
				 ...inheritedWayleaveDocs,
				 ...anyPaymentsDocs,
				 ...acceptedPaymentsDocs,
				 ...writtenTerminationDocs,
				 ...writtenRemovalDocs,
				 ...titlePlanDocs,

			 ],
		 };

		 try {
			 await saveSupportingInfo(request);
			 				   navigate(`/nwl/${applicationId}/task-list`);

		 } catch {
				// TODO: error handling
		 }
	 };

	 const handleSaveForLater = async () => {
		 // Prepare request object (same as handleSubmit, but skip validation)
		 const request: nwlSupportingInfo = {
			 id,
			 applicationId: applicationId,
			 hasLandownerSignedWayleave: signedWayleave === "Yes",
			 hasInheritedNecessaryWayleave: inheritedWayleave === "Yes",
			 hasPriorWayleavePayments: anyPayments === "Yes",
			 hasPaymentsAcceptedByGrantor: acceptedPayments === "Yes",
			 isNewContractImplied: contact === "email",
			 newContractImpliedReason: contact === "email" ? contactByEmail : "",
			 hasWrittenTerminationNotice: writtenTermination === "Yes",
			 writtenTerminationNoticeIssueDate: writtenTermination === "Yes" ? `${writtenTerminationDate.year}-${writtenTerminationDate.month}-${writtenTerminationDate.day}` : undefined,
			 hasWrittenRemovalNotice: writtenRemoval === "Yes",
			 writtenRemovalNoticeIssueDate: writtenRemoval === "Yes" ? `${writtenRemovalDate.year}-${writtenRemovalDate.month}-${writtenRemovalDate.day}` : undefined,
			 hasTitlePlan: titlePlan === "Yes",
			 titlePlanMissingReason: titlePlan === "No" ? titlePlanMissingReason : undefined,
			 createdBy: userId,
			 lastUpdatedBy: userId,
			 uploadedFiles: [
				 ...signedWayleaveFiles,
				 ...inheritedWayleaveFiles,
				 ...anyPaymentsFiles,
				 ...acceptedPaymentsFiles,
				 ...writtenTerminationFiles,
				 ...writtenRemovalFiles,
				 ...titlePlanFiles,
			 ],
			 applicationDocuments: [
				 ...signedWayleaveDocs,
				 ...inheritedWayleaveDocs,
				 ...anyPaymentsDocs,
				 ...acceptedPaymentsDocs,
				 ...writtenTerminationDocs,
				 ...writtenRemovalDocs,
				 ...titlePlanDocs,
			 ],
		 };
		 try {
			await saveSupportingInfo(request);
				   navigate(`/nwl/${applicationId}/task-list`);

		 } catch {	
				// TODO: error handling
		 }
	 };

	return (
	<div className="govuk-width-container">
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
				<li className="govuk-breadcrumbs__list-item" aria-current="page">Supporting information</li>
			</ol>
		</nav>
		<div className="govuk-grid-row">
			<div className="govuk-grid-column-two-thirds">
				<h1 className="govuk-heading-xl">Supporting information</h1>
				{/* Error summary */}
				{errors.length > 0 && (
					<div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
						<h2 className="govuk-error-summary__title">There is a problem</h2>
						<div className="govuk-error-summary__body">
							<ul className="govuk-list govuk-error-summary__list">
								{errors.map((msg, idx) => (
									<li key={idx} dangerouslySetInnerHTML={{ __html: msg }} />
								))}
							</ul>
						</div>
					</div>
				)}
				<form onSubmit={handleSubmit} noValidate>
					{/* Signed wayleave */}
					<div className={`govuk-form-group${!signedWayleave && errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="signedWayleave-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
								Has the current landowner signed a wayleave?
							</legend>
							<div id="signedWayleave-hint" className="govuk-hint">
								{!signedWayleave && errors.length > 0 && (
									<p id="signedWayleave-error" className="govuk-error-message">Select if the current landowner has signed a wayleave</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="signedWayleave" name="signedWayleave" type="radio" value="Yes" checked={signedWayleave === "Yes"} onChange={e => setSignedWayleave(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="signedWayleave">Yes</label>
								</div>
								<div className="govuk-radios__conditional" id="conditional-signedWayleave">
									{signedWayleave === "Yes" && (
										<>
											{errors.some(e => e.includes('signedWayleave-upload-1-error')) && (
												<p id="signedWayleave-upload-1-error" className="govuk-error-message">Upload current landowners signed wayleave</p>
											)}
											<FileUpload
												title="Upload current landowners signed wayleave"
												prefix={`${applicationId}/${NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_SIGNED_WAYLEAVE}/`}
												applicationId={applicationId}
												category={NWL_FILE_CATEGORIES.NWL_SUPPORT_INFO}
												subCategory={NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_SIGNED_WAYLEAVE}
												uploadedFiles={signedWayleaveFiles}
												onUploaded={handleSignedWayleaveUploaded}
												addedBy={userId}
											/>
										</>
									)}
								</div>
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="signedWayleave-2" name="signedWayleave" type="radio" value="No" checked={signedWayleave === "No"} onChange={e => setSignedWayleave(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="signedWayleave-2">No</label>
								</div>
							</div>
						</fieldset>
					</div>
					{/* Inherited wayleave */}
					<div className={`govuk-form-group${!inheritedWayleave && errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="inheritedWayleave-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
								Has the current landowner inherited a necessary wayleave in relation to the specified asset schedule?
							</legend>
							<div id="inheritedWayleave-hint" className="govuk-hint">
								{!inheritedWayleave && errors.length > 0 && (
									<p id="inheritedWayleave-error" className="govuk-error-message">Select if the current landowner has inherited a wayleave</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="inheritedWayleave" name="inheritedWayleave" type="radio" value="Yes" checked={inheritedWayleave === "Yes"} onChange={e => setInheritedWayleave(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="inheritedWayleave">Yes</label>
								</div>
														{inheritedWayleave === "Yes" && (
															<div className="govuk-radios__conditional" id="conditional-inheritedWayleave">
																{errors.some(e => e.includes('inheritedWayleave-upload-1-error')) && (
																	<p id="inheritedWayleave-upload-1-error" className="govuk-error-message">Upload a document that shows inheritance of a necessary wayleave</p>
																)}
																<FileUpload
																	title="Upload a document that shows inheritance of a necessary wayleave in relation to the specified asset schedule"
																	prefix={`${applicationId}/${NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_INHERITED_WAYLEAVE}/`}
																	applicationId={applicationId}
																	category={NWL_FILE_CATEGORIES.NWL_SUPPORT_INFO}
																	subCategory={NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_INHERITED_WAYLEAVE}
																	uploadedFiles={inheritedWayleaveFiles}
																	onUploaded={handleInheritedWayleaveUploaded}
																	addedBy={userId}
																/>
															</div>
														)}
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="inheritedWayleave-2" name="inheritedWayleave" type="radio" value="No" checked={inheritedWayleave === "No"} onChange={e => setInheritedWayleave(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="inheritedWayleave-2">No</label>
								</div>
							</div>
						</fieldset>
					</div>
					{/* Any payments */}
					<div className={`govuk-form-group${!anyPayments && errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="anyPayments-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
								Have Wayleave Payments previously been made to the grantor?
							</legend>
							<div id="anyPayments-hint" className="govuk-hint">
								{!anyPayments && errors.length > 0 && (
									<p id="anyPayments-error" className="govuk-error-message">Select if Wayleave Payments have previously been made to the grantor</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="anyPayments" name="anyPayments" type="radio" value="Yes" checked={anyPayments === "Yes"} onChange={e => setAnyPayments(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="anyPayments">Yes</label>
								</div>
														{anyPayments === "Yes" && (
															<div className="govuk-radios__conditional" id="conditional-anyPayments">
																{errors.some(e => e.includes('anyPayments-upload-1-error')) && (
																	<p id="anyPayments-upload-1-error" className="govuk-error-message">Upload a document that shows payments made to the grantor</p>
																)}
																<FileUpload
																	title="Upload a document that shows payments made to the grantor to support your application"
																	prefix={`${applicationId}/${NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ANY_PAYMENTS}/`}
																	applicationId={applicationId}
																	category={NWL_FILE_CATEGORIES.NWL_SUPPORT_INFO}
																	subCategory={NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ANY_PAYMENTS}
																	uploadedFiles={anyPaymentsFiles}
																	onUploaded={handleAnyPaymentsUploaded}
																	addedBy={userId}
																/>
															</div>
														)}
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="anyPayments-2" name="anyPayments" type="radio" value="No" checked={anyPayments === "No"} onChange={e => setAnyPayments(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="anyPayments-2">No</label>
								</div>
							</div>
						</fieldset>
					</div>
					{/* Accepted payments */}
					<div className={`govuk-form-group${!acceptedPayments && errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="acceptedPayments-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
								Have Wayleave Payments been accepted by the grantor?
							</legend>
							<div id="acceptedPayments-hint" className="govuk-hint">
								{!acceptedPayments && errors.length > 0 && (
									<p id="acceptedPayments-error" className="govuk-error-message">Select if Wayleave Payments have been accepted by the grantor</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="acceptedPayments" name="acceptedPayments" type="radio" value="Yes" checked={acceptedPayments === "Yes"} onChange={e => setAcceptedPayments(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="acceptedPayments">Yes</label>
								</div>
														{acceptedPayments === "Yes" && (
															<div className="govuk-radios__conditional" id="conditional-acceptedPayments">
																{errors.some(e => e.includes('acceptedPayments-upload-1-error')) && (
																	<p id="acceptedPayments-upload-1-error" className="govuk-error-message">Upload a document that shows payments have been accepted by the grantor</p>
																)}
																<FileUpload
																	title="Upload a document that shows payments have been accepted by the grantor"
																	prefix={`${applicationId}/${NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ACCEPTED_PAYMENTS}/`}
																	applicationId={applicationId}
																	category={NWL_FILE_CATEGORIES.NWL_SUPPORT_INFO}
																	subCategory={NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_ACCEPTED_PAYMENTS}
																	uploadedFiles={acceptedPaymentsFiles}
																	onUploaded={handleAcceptedPaymentsUploaded}
																	addedBy={userId}
																/>
															</div>
														)}
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="acceptedPayments-2" name="acceptedPayments" type="radio" value="No" checked={acceptedPayments === "No"} onChange={e => setAcceptedPayments(e.target.value)} />
									<label className="govuk-label govuk-radios__label" htmlFor="acceptedPayments-2">No</label>
								</div>
							</div>
						</fieldset>
					</div>
					{/* Is a new contract implied? */}


					<div className={`govuk-form-group${(!contact && errors.length > 0) || (contact === "email" && errors.some(e => e.includes('contact-by-email-error'))) ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="contact-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
								<h1 className="govuk-fieldset__heading">Is a new contract implied?</h1>
							</legend>
							<div id="contact-hint" className="govuk-hint">
								{!contact && errors.length > 0 && (
									<p id="contact-error" className="govuk-error-message">Select if a new contract is implied</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="contact"
										name="contact"
										type="radio"
										value="email"
										checked={contact === "email"}
										onChange={e => setContact(e.target.value)}
										aria-controls="conditional-contact"
										aria-expanded={contact === "email"}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="contact">Yes</label>
								</div>
								{contact === "email" && (
									<div className="govuk-radios__conditional" id="conditional-contact">
										<div className={`govuk-form-group${errors.some(e => e.includes('contact-by-email')) ? ' govuk-form-group--error' : ''}`}>
											<label className="govuk-label" htmlFor="contact-by-email">Why do you believe this is so?</label>
											{errors.some(e => e.includes('contact-by-email')) && (
												<p id="contact-by-email-error" className="govuk-error-message">Enter why you believe a new contract is implied</p>
											)}
											<textarea
												className={`govuk-textarea govuk-!-width-one-third${errors.some(e => e.includes('contact-by-email')) ? ' govuk-textarea--error' : ''}`}
												id="contact-by-email"
												name="contactByEmail"
												spellCheck={true}
												rows={1}
												value={contactByEmail}
												onChange={e => setContactByEmail(e.target.value)}
											/>
										</div>
									</div>
								)}
								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="contact-2"
										name="contact"
										type="radio"
										value="phone"
										checked={contact === "phone"}
										onChange={e => setContact(e.target.value)}
										aria-controls="conditional-contact-2"
										aria-expanded={contact === "phone"}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="contact-2">No</label>
								</div>
								{contact === "phone" && (
									<div className="govuk-radios__conditional govuk-radios__conditional--hidden" id="conditional-contact-2"></div>
								)}
							</div>
						</fieldset>
					</div>
					{/* Written Termination Notice */}

					<div className={`govuk-form-group${!writtenTermination && errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="writtenTermination-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Has a Written Termination Notice been given?</legend>
							<div id="writtenTermination-hint" className="govuk-hint">
								{!writtenTermination && errors.length > 0 && (
									<p id="writtenTermination-error" className="govuk-error-message">Select if a Written Termination Notice has been given</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="writtenTermination"
										name="writtenTermination"
										type="radio"
										value="Yes"
										checked={writtenTermination === "Yes"}
										onChange={e => setWrittenTermination(e.target.value)}
										aria-controls="conditional-writtenTermination"
										aria-expanded={writtenTermination === "Yes"}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="writtenTermination">Yes</label>
								</div>
								{writtenTermination === "Yes" && (
									<div className="govuk-radios__conditional" id="conditional-writtenTermination">
										<div className={`govuk-form-group${errors.some(e => e.includes('writtenTerminationDate-day')) ? ' govuk-form-group--error' : ''}`}>
											<fieldset className="govuk-fieldset" role="group" aria-describedby="writtenTerminationDate-hint">
												<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Written Termination Notice issue date</legend>
												<div id="writtenTerminationDate-hint" className="govuk-hint"></div>
												{errors.some(e => e.includes('writtenTerminationDate-day')) && (
													<p id="writtenTerminationDate-error" className="govuk-error-message">Enter the full Written Termination Notice issue date</p>
												)}
												<div className="govuk-date-input" id="writtenTerminationDate">
													<div className="govuk-date-input__item">
														<div className="govuk-form-group">
															<label className="govuk-label govuk-date-input__label" htmlFor="writtenTerminationDate-day">Day</label>
															<input className="govuk-input govuk-date-input__input govuk-input--width-2" id="writtenTerminationDate-day" name="writtenTerminationDate-day" type="text" inputMode="numeric" value={writtenTerminationDate.day} onChange={e => setWrittenTerminationDate({ ...writtenTerminationDate, day: e.target.value })} />
														</div>
													</div>
													<div className="govuk-date-input__item">
														<div className="govuk-form-group">
															<label className="govuk-label govuk-date-input__label" htmlFor="writtenTerminationDate-month">Month</label>
															<input className="govuk-input govuk-date-input__input govuk-input--width-2" id="writtenTerminationDate-month" name="writtenTerminationDate-month" type="text" inputMode="numeric" value={writtenTerminationDate.month} onChange={e => setWrittenTerminationDate({ ...writtenTerminationDate, month: e.target.value })} />
														</div>
													</div>
													<div className="govuk-date-input__item">
														<div className="govuk-form-group">
															<label className="govuk-label govuk-date-input__label" htmlFor="writtenTerminationDate-year">Year</label>
															<input className="govuk-input govuk-date-input__input govuk-input--width-4" id="writtenTerminationDate-year" name="writtenTerminationDate-year" type="text" inputMode="numeric" value={writtenTerminationDate.year} onChange={e => setWrittenTerminationDate({ ...writtenTerminationDate, year: e.target.value })} />
														</div>
													</div>
												</div>
												
											</fieldset>
										</div>
										<div className="govuk-form-group">
										{errors.some(e => e.includes('writtenTermination-upload-1-error')) && (
											<p id="writtenTermination-upload-1-error" className="govuk-error-message">Upload Written Termination Notice document</p>
										)}
										<FileUpload
												title="Upload Written Termination Notice document"
												prefix={`${applicationId}/${NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_TERMINATION_NOTICE}/`}
												applicationId={applicationId}
												category={NWL_FILE_CATEGORIES.NWL_SUPPORT_INFO}
												subCategory={NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_TERMINATION_NOTICE}
												uploadedFiles={writtenTerminationFiles}
												onUploaded={handleWrittenTerminationUploaded}
												addedBy={userId}
											/>
										</div>
									</div>
								)}
								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="writtenTermination-2"
										name="writtenTermination"
										type="radio"
										value="No"
										checked={writtenTermination === "No"}
										onChange={e => setWrittenTermination(e.target.value)}
										aria-controls="conditional-writtenTermination-2"
										aria-expanded={writtenTermination === "No"}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="writtenTermination-2">No</label>
								</div>
								{writtenTermination === "No" && (
									<div className="govuk-radios__conditional govuk-radios__conditional--hidden" id="conditional-writtenTermination-2"></div>
								)}
							</div>
						</fieldset>
					</div>
					{/* Written Removal Notice */}
					<div className={`govuk-form-group${!writtenRemoval && errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="writtenRemoval-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Has a Written Removal Notice been given?</legend>
							<div id="writtenRemoval-hint" className="govuk-hint">
								{!writtenRemoval && errors.length > 0 && (
									<p id="writtenRemoval-error" className="govuk-error-message">Select if a Written Removal Notice has been given</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="writtenRemoval"
										name="writtenRemoval"
										type="radio"
										value="Yes"
										checked={writtenRemoval === "Yes"}
										onChange={e => setWrittenRemoval(e.target.value)}
										aria-controls="conditional-writtenRemoval"
										aria-expanded={writtenRemoval === "Yes"}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="writtenRemoval">Yes</label>
								</div>
								   {writtenRemoval === "Yes" && (
									   <div className="govuk-radios__conditional" id="conditional-writtenRemoval">
										   <div className={`govuk-form-group${errors.some(e => e.includes('writtenRemovalDate-day')) ? ' govuk-form-group--error' : ''}`}>
											   <fieldset className="govuk-fieldset" role="group" aria-describedby="writtenRemovalDate-hint">
												   <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Written Removal Notice issue date</legend>
												   <div id="writtenRemovalDate-hint" className="govuk-hint"></div>
												   {errors.some(e => e.includes('writtenRemovalDate-day')) && (
													   <p id="writtenRemovalDate-error" className="govuk-error-message">Enter the full Written Removal Notice issue date</p>
												   )}
												   <div className="govuk-date-input" id="writtenRemovalDate">
													   <div className="govuk-date-input__item">
														   <div className="govuk-form-group">
															   <label className="govuk-label govuk-date-input__label" htmlFor="writtenRemovalDate-day">Day</label>
															   <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="writtenRemovalDate-day" name="writtenRemovalDate-day" type="text" inputMode="numeric" value={writtenRemovalDate.day} onChange={e => setWrittenRemovalDate({ ...writtenRemovalDate, day: e.target.value })} />
														   </div>
													   </div>
													   <div className="govuk-date-input__item">
														   <div className="govuk-form-group">
															   <label className="govuk-label govuk-date-input__label" htmlFor="writtenRemovalDate-month">Month</label>
															   <input className="govuk-input govuk-date-input__input govuk-input--width-2" id="writtenRemovalDate-month" name="writtenRemovalDate-month" type="text" inputMode="numeric" value={writtenRemovalDate.month} onChange={e => setWrittenRemovalDate({ ...writtenRemovalDate, month: e.target.value })} />
														   </div>
													   </div>
													   <div className="govuk-date-input__item">
														   <div className="govuk-form-group">
															   <label className="govuk-label govuk-date-input__label" htmlFor="writtenRemovalDate-year">Year</label>
															   <input className="govuk-input govuk-date-input__input govuk-input--width-4" id="writtenRemovalDate-year" name="writtenRemovalDate-year" type="text" inputMode="numeric" value={writtenRemovalDate.year} onChange={e => setWrittenRemovalDate({ ...writtenRemovalDate, year: e.target.value })} />
														   </div>
													   </div>
												   </div>
											   </fieldset>
										   </div>
										   {errors.some(e => e.includes('writtenRemoval-upload-1-error')) && (
											  <p id="writtenRemoval-upload-1-error" className="govuk-error-message">Upload Written Removal Notice document</p>
										   )}
										   <FileUpload
											   title="Upload Written Removal Notice document"
											   prefix={`${applicationId}/${NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_REMOVAL_NOTICE}/`}
											   applicationId={applicationId}
											   category={NWL_FILE_CATEGORIES.NWL_SUPPORT_INFO}
											   subCategory={NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_WRITTEN_REMOVAL_NOTICE}
											   uploadedFiles={writtenRemovalFiles}
											   onUploaded={handleWrittenRemovalUploaded}
											   addedBy={userId}
										   />
									   </div>
								   )}
								<div className="govuk-radios__item">
									<input
										className="govuk-radios__input"
										id="writtenRemoval-2"
										name="writtenRemoval"
										type="radio"
										value="No"
										checked={writtenRemoval === "No"}
										onChange={e => setWrittenRemoval(e.target.value)}
										aria-controls="conditional-writtenRemoval-2"
										aria-expanded={writtenRemoval === "No"}
									/>
									<label className="govuk-label govuk-radios__label" htmlFor="writtenRemoval-2">No</label>
								</div>
								{writtenRemoval === "No" && (
									<div className="govuk-radios__conditional govuk-radios__conditional--hidden" id="conditional-writtenRemoval-2"></div>
								)}
							</div>
						</fieldset>
					</div>
					{/* Title Plan */}
					<div className={`govuk-form-group${!titlePlan && errors.length > 0 ? ' govuk-form-group--error' : ''}`}>
						<fieldset className="govuk-fieldset" aria-describedby="titlePlan-hint">
							<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Does your application include a title plan?</legend>
							<div id="titlePlan-hint" className="govuk-hint">
								{!titlePlan && errors.length > 0 && (
									<p id="titlePlan-error" className="govuk-error-message">Select if your application includes a title plan</p>
								)}
							</div>
							<div className="govuk-radios" data-module="govuk-radios">
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="titlePlan" name="titlePlan" type="radio" value="Yes" checked={titlePlan === "Yes"} onChange={e => setTitlePlan(e.target.value)} aria-controls="conditional-titlePlan" aria-expanded={titlePlan === "Yes"} />
									<label className="govuk-label govuk-radios__label" htmlFor="titlePlan">Yes</label>
								</div>
								{titlePlan === "Yes" && (
	<div className="govuk-radios__conditional" id="conditional-titlePlan">
		{errors.some(e => e.includes('titlePlan-upload-1-error')) && (
			<p id="titlePlan-upload-1-error" className="govuk-error-message">Upload the title plan document</p>
		)}
		<FileUpload
			title="Upload the title plan document"
			prefix={`${applicationId}/${NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_TITLE_PLAN}/`}
			applicationId={applicationId}
			category={NWL_FILE_CATEGORIES.NWL_SUPPORT_INFO}
			subCategory={NWL_FILE_SUBCATEGORIES.NWL_SUPPORT_INFO_TITLE_PLAN}
			uploadedFiles={titlePlanFiles}
			onUploaded={handleTitlePlanUploaded}
			addedBy={userId}
		/>
	</div>
)}
								<div className="govuk-radios__item">
									<input className="govuk-radios__input" id="titlePlan-2" name="titlePlan" type="radio" value="No" checked={titlePlan === "No"} onChange={e => setTitlePlan(e.target.value)} aria-controls="conditional-titlePlan-2" aria-expanded={titlePlan === "No"} />
									<label className="govuk-label govuk-radios__label" htmlFor="titlePlan-2">No</label>
								</div>
								{titlePlan === "No" && (
									<div className="govuk-radios__conditional" id="conditional-titlePlan-2">
										<div className="govuk-form-group">
											<label className="govuk-label" htmlFor="titlePlan-detail">Tell us why you’re not submitting a title plan</label>
											<textarea
												className="govuk-textarea govuk-!-static-margin-bottom-1"
												id="titlePlan-detail"
												name="titlePlanDetail"
												rows={5}
												value={titlePlanMissingReason}
												onChange={e => setTitlePlanMissingReason(e.target.value)}
											></textarea>
										</div>
									</div>
								)}
							</div>
						</fieldset>
					</div>
					{/* Call to action buttons */}
					<div className="govuk-!-static-margin-top-6">
						<button
							type="button"
							className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2"
							onClick={handleSaveForLater}
						>
							Save for later
						</button>
						<button type="submit" className="govuk-button" data-module="govuk-button">Save and continue</button>
					</div>
				</form>
			</div>
		</div>
	</div>
);
};


export default SupportingInfo;
