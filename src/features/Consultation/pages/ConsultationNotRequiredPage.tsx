import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import FileUpload from '../../../components/FileUpload';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { ConsultationStatus } from '../../../constants/consultationStatus';
import { getNotRequiredStatus, saveNotRequiredStatus } from '../../../services/consultationService';

const ConsultationNotRequiredPage: React.FC = () => {
	const { applicationId, consultationId } = useParams();
	const [searchParams] = useSearchParams();
	const consultationName = searchParams.get('consultationName')|| '';

	// Scroll to top on mount
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);
	const [reason, setReason] = useState('');
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [uploadedFileObjs, setUploadedFileObjs] = useState<any[]>([]);
	const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
	const [notRequiredStatus, setNotRequiredStatus] = useState<any>(null);
	const [errors, setErrors] = useState<{reason?: string; files?: string}>({});
	// Handler for FileUpload onUploaded
	const handleUploadedFiles = (uploadedFiles: any[], applicationDocumentsArr: any[]) => {
		setUploadedFileObjs(prev => [...prev, ...uploadedFiles]);
		setApplicationDocuments(prev => [...prev, ...applicationDocumentsArr]);
		// Clear files error when files are uploaded
		if (errors.files && (uploadedFiles.length > 0 || applicationDocumentsArr.length > 0)) {
			setErrors(prev => {
				const { files: _files, ...rest } = prev;
				return rest;
			});
		}
	};


	// Fetch 'Consultation Not Required' status on mount
	useEffect(() => {
		if (consultationId && applicationId) {
			getNotRequiredStatus(consultationId, applicationId)
				.then(data => {
					setNotRequiredStatus(data);
					if (data?.details?.notRequiredReason) setReason(data.details.notRequiredReason);
					if (Array.isArray(data?.uploadedFiles)) setUploadedFileObjs(data.uploadedFiles);
					if (Array.isArray(data?.applicationDocuments)) setApplicationDocuments(data.applicationDocuments);
				})
				.catch(() => {
					setNotRequiredStatus(null);
				});
		}
	}, [consultationId, applicationId]);

	// Save and Continue handler

		// Save and Continue handler (set status to CLOSED)
		const navigate = useNavigate();
		const handleSaveAndContinue = async () => {
			if (!consultationId || !notRequiredStatus?.details) return;
			
			// Validation
			const newErrors: {reason?: string; files?: string} = {};
			
			if (!reason.trim()) {
				newErrors.reason = 'You must provide a reason why this consultation is not required';
			}
			
			if (uploadedFileObjs.length === 0 && applicationDocuments.length === 0) {
				newErrors.files = 'You must upload at least one supporting document';
			}
			
			if (Object.keys(newErrors).length > 0) {
				setErrors(newErrors);
				// Scroll to top to show errors
				window.scrollTo(0, 0);
				return;
			}
			
			// Clear any previous errors
			setErrors({});
			
			const updatedDetails = {
				...notRequiredStatus.details,
				status: ConsultationStatus.NOT_REQUIRED,
				notRequiredReason: reason,
				uploadedFiles: uploadedFileObjs,
				applicationDocuments: applicationDocuments
			};
			try {
				await saveNotRequiredStatus(consultationId, updatedDetails);
				navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
			} catch (err) {
				// TODO: error handling
			}
		};

		// Save for later handler (set status to REQUEST_INCOMPLETE)
		const handleSaveForLater = async () => {
			if (!consultationId || !notRequiredStatus?.details) return;
			
			// For save for later, only require reason (allow saving without files for partial completion)
			const newErrors: {reason?: string} = {};
			
			if (!reason.trim()) {
				newErrors.reason = 'You must provide a reason why this consultation is not required';
				setErrors(newErrors);
				window.scrollTo(0, 0);
				return;
			}
			
			// Clear any previous errors
			setErrors({});
			
			const updatedDetails = {
				...notRequiredStatus.details,
				status: ConsultationStatus.REQUEST_INCOMPLETE,
				notRequiredReason: reason,
				uploadedFiles: uploadedFileObjs,
				applicationDocuments: applicationDocuments
			};
			try {
				await saveNotRequiredStatus(consultationId, updatedDetails);
				navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
			} catch (err) {
				// TODO: error handling
			}
		};

	return (
		<div className="govuk-width-container govuk-!-margin-top-6 govuk-!-margin-bottom-6">
			<div className="govuk-grid-row">
				<div className="govuk-grid-column-two-thirds">
					<nav className="govuk-breadcrumbs govuk-!-margin-bottom-4" aria-label="Breadcrumb">
						<ol className="govuk-breadcrumbs__list">
							<li className="govuk-breadcrumbs__list-item">
								<Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>Task list</Link>
							</li>
							<li className="govuk-breadcrumbs__list-item">
							<Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>Manage consultation</Link>
							</li>
							<li className="govuk-breadcrumbs__list-item" aria-current="page">Consultation not required</li>
						</ol>
					</nav>
					<main className="govuk-main-wrapper govuk-!-padding-top-0 govuk-!-margin-bottom-6" id="main-content">
					{/* Error Summary */}
					{(errors.reason || errors.files) && (
						<div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
							<h2 className="govuk-error-summary__title" id="error-summary-title">
								There is a problem
							</h2>
							<div className="govuk-error-summary__body">
								<ul className="govuk-list govuk-error-summary__list">
									{errors.reason && (
										<li>
											<a href="#reason">{errors.reason}</a>
										</li>
									)}
									{errors.files && (
										<li>
											<a href="#file-upload">{errors.files}</a>
										</li>
									)}
								</ul>
							</div>
						</div>
					)}
					<h2 className="govuk-caption-xl">{consultationName}</h2>
						<h1 className="govuk-heading-l govuk-!-margin-bottom-6">Consultation not required</h1>
						<div className="govuk-!-margin-bottom-6">
							<h2 className="govuk-heading-m govuk-!-margin-bottom-2">Sites of Special Scientific Interest (SSSI) assent</h2>
							<p className="govuk-body">You do not need to request Natural England’s assent for activities you believe would not disturb or damage the special features of an SSSI.</p>
							<p className="govuk-body">You must provide appropriate evidence here to demonstrate this.</p>
							<p className="govuk-body">Here are some examples of appropriate evidence (this list is not exhaustive):</p>
							<ul className="govuk-list govuk-list--bullet">
								<li>a survey carried out by a qualified ecologist</li>
								<li>photographs of the work site and proposed access routes</li>
								<li>details of proposed working methods that would minimise impact on the protected site, e.g. only accessing the site on foot</li>
							</ul>
							<h3 className="govuk-heading-s govuk-!-margin-bottom-1">SSSI Impact Risk Zones (IRZs)</h3>
							<p className="govuk-body">You can use DEFRA’s <a href="https://magic.defra.gov.uk" className="govuk-link" target="_blank" rel="noopener noreferrer">Magic Maps</a> or <a href="https://designatedsites.naturalengland.org.uk/IRZStart.aspx" className="govuk-link" target="_blank" rel="noopener noreferrer">Natural England’s IRZ tool</a> to check the types of project Natural England have requested consultations for.</p>
							<p className="govuk-body">If a consultation is not required, you must provide appropriate evidence here to demonstrate this.</p>
							<p className="govuk-body">Please note that the upgrade and refurbishment of existing overhead lines within IRZs do not usually require consultation with Natural England.</p>
						</div>
						<form className="govuk-form-group govuk-!-margin-bottom-6" noValidate onSubmit={e => e.preventDefault()}>
							<div className={`govuk-form-group ${errors.reason ? 'govuk-form-group--error' : ''} govuk-!-margin-bottom-6`}>
								<label className="govuk-label" htmlFor="reason">Explain why this consultation is not required</label>
								{errors.reason && (
									<p id="reason-error" className="govuk-error-message">
										<span className="govuk-visually-hidden">Error:</span> {errors.reason}
									</p>
								)}
								<textarea
									className={`govuk-textarea govuk-!-margin-top-2 ${errors.reason ? 'govuk-textarea--error' : ''}`}
									id="reason"
									name="reason"
									rows={5}
									value={reason}
									onChange={e => {
										setReason(e.target.value);
										// Clear error when user starts typing
										if (errors.reason) {
											setErrors(prev => {
												const { reason: _reason, ...rest } = prev;
												return rest;
											});
										}
									}}
									aria-describedby={errors.reason ? "reason-error" : undefined}
								/>
							</div>
							<div className={`govuk-form-group ${errors.files ? 'govuk-form-group--error' : ''} govuk-!-margin-bottom-6`} id="file-upload">
								{errors.files && (
									<p id="files-error" className="govuk-error-message">
										<span className="govuk-visually-hidden">Error:</span> {errors.files}
									</p>
								)}
								<FileUpload
									title="Upload any supporting documents"
									prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_NOT_REQUIRED}/${consultationId}`}
									applicationId={applicationId}
									category={FILE_CATEGORIES.CONSULTATION_NOT_REQUIRED}
									uploadedFiles={uploadedFileObjs}
									onFilesChange={setUploadedFiles}
									onRemoveFile={idx => {
										setUploadedFiles(files => files.filter((_, i) => i !== idx));
										setUploadedFileObjs(objs => objs.filter((_, i) => i !== idx));
										setApplicationDocuments(docs => docs.filter((_, i) => i !== idx));
										// Clear files error when removing files (validation will re-trigger on save)
										if (errors.files) {
											setErrors(prev => {
												const { files: _files, ...rest } = prev;
												return rest;
											});
										}
									}}
									onUploaded={handleUploadedFiles}
									consultationId={consultationId}
								/>
							</div>
						 <div className="govuk-button-group govuk-!-margin-top-6">
								{/*	<button
									type="button"
									className="govuk-button govuk-button--secondary"
									data-module="govuk-button"
									onClick={handleSaveForLater}
								>
									Save for later
								</button>*/}
								<button
									type="button"
									className="govuk-button govuk-button--primary"
									data-module="govuk-button"
									onClick={handleSaveAndContinue}
								>
									Save and Continue
								</button>
							</div> 
						</form>
					</main>
				</div>
			</div>
		</div>
	);
};

export default ConsultationNotRequiredPage;
