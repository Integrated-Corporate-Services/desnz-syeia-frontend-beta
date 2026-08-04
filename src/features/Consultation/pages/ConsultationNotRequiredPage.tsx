import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import FileUpload, { FileUploadHandle } from '../../../components/FileUpload';
import { UploadedFile, ApplicationDocument } from '../../../types/fileUpload';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { ConsultationStatus } from '../../../constants/consultationStatus';
import { getNotRequiredStatus, saveNotRequiredStatus } from '../../../services/consultationService';
import { CONSULTATION_VALIDATION_MESSAGES } from '../../../constants/consultationValidationMessages';
import { isWithinCharacterLimit } from '../../../utils/validation';
import SkipLink from '../../../components/SkipLink';

const ConsultationNotRequiredPage: React.FC = () => {
	const { applicationId, consultationId } = useParams();
	const [searchParams] = useSearchParams();
	const consultationName = searchParams.get('consultationName')|| '';

	// Scroll to top on mount
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);
	const [reason, setReason] = useState('');
	const [uploadedFileObjs, setUploadedFileObjs] = useState<any[]>([]);
	const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
	const [notRequiredStatus, setNotRequiredStatus] = useState<any>(null);
	const [errors, setErrors] = useState<{reason?: string; files?: string}>({});
	const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
	const [pendingFiles, setPendingFiles] = useState<File[]>([]);
	// Ref for file upload
	const fileUploadRef = useRef<FileUploadHandle>(null);

	// Handle file deletion
	const handleDeleteFile = (fileId: string) => {
		setUploadedFileObjs(prev => prev.filter(file => file.id !== fileId));
		setApplicationDocuments(prev => prev.filter(doc => doc.fileId !== fileId));
	};

	// Handle file validation errors from FileUpload component
	const handleFileValidationErrors = (errors: string[]) => {
		// Handle validation errors
		setFileValidationErrors(errors);
		// Clear form-level errors when file validation errors are present
		if (errors.length === 0) {
			setErrors(prev => ({ ...prev, files: undefined }));
		}
	};

	// Handle error click to focus file upload area
	const handleErrorClick = (errorType: string) => {
		if (errorType === 'fileUpload') {
			const fileUploadSection = document.querySelector('#file-upload');
			if (fileUploadSection) {
				// First scroll to the section smoothly
				fileUploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
				
				// Wait for scroll to complete, then focus the upload container
				setTimeout(() => {
					const uploadContainer = fileUploadSection.querySelector('.gds-upload-container');
					if (uploadContainer) {
						(uploadContainer as HTMLElement).focus();
					} else {
						// Fallback: try to focus the file input directly
						const fileInput = fileUploadSection.querySelector('#file-upload-input');
						if (fileInput) {
							(fileInput as HTMLElement).focus();
						} 
					}
				}, 300);
			} 
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

	// Handle files uploaded immediately (when uploadImmediately=true)
	const handleFilesUploaded = (newFiles: UploadedFile[], newDocuments: ApplicationDocument[]) => {
		setUploadedFileObjs(prev => [...prev, ...newFiles]);
		setApplicationDocuments(prev => [...prev, ...newDocuments]);
		setErrors(prev => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { files: _files, ...rest } = prev;
			return rest;
		});
		setFileValidationErrors([]);
	};

	// Save and Continue handler (set status to CLOSED)
	const navigate = useNavigate();
	const handleSaveAndContinue = async () => {
		if (fileUploadRef.current?.isBusy()) {
			const scanInProgressMessage = 'File scan is in progress. Wait for the scan to finish before continuing.';
			setFileValidationErrors([scanInProgressMessage]);
			window.scrollTo({ top: 0, behavior: 'smooth' });
			setTimeout(() => {
				setFileValidationErrors(prev => (prev.length === 1 && prev[0] === scanInProgressMessage) ? [] : prev);
			}, 6000);
			return;
		}

		if (!consultationId || !notRequiredStatus?.details) return;

		// Trigger file upload first if there are pending files (deferred upload pattern)
		let newlyUploadedFiles: any[] = [];
		let newlyUploadedDocuments: any[] = [];

		if (fileUploadRef.current) {
			try {
				const result = await fileUploadRef.current.triggerUpload();
				if (result.scanErrors.length > 0) {
					setFileValidationErrors(result.scanErrors);
					window.scrollTo({ top: 0, behavior: 'smooth' });
					return;
				}
				newlyUploadedFiles = result.uploadedFiles;
				newlyUploadedDocuments = result.applicationDocuments;

				// Update state immediately so files remain visible even if validation fails
				setUploadedFileObjs(prev => [...prev, ...newlyUploadedFiles]);
				setApplicationDocuments(prev => [...prev, ...newlyUploadedDocuments]);
			} catch (err: any) {
				const errorMsg = 'Failed to upload files. Please try again.';
				setFileValidationErrors([errorMsg]);
				window.scrollTo({ top: 0, behavior: 'smooth' });
				return;
			}
		}
		
		// Validation
		const newErrors: {reason?: string; files?: string} = {};
		
		if (!reason.trim()) {
			newErrors.reason = CONSULTATION_VALIDATION_MESSAGES.consultationNotRequiredReason.empty;
		} else if (!isWithinCharacterLimit(reason, 4000)) {
			newErrors.reason = CONSULTATION_VALIDATION_MESSAGES.consultationNotRequiredReason.characterLimit;
		}
		
		const totalFiles = uploadedFileObjs.length + applicationDocuments.length + newlyUploadedFiles.length + pendingFiles.length;
		if (totalFiles === 0) {
			newErrors.files = CONSULTATION_VALIDATION_MESSAGES.consultationNotRequiredUpload.empty;
		}
		
		
		if (Object.keys(newErrors).length > 0 || fileValidationErrors.length > 0) {
			setErrors(newErrors);
			window.scrollTo(0, 0);
			return;
		}
		
		setErrors({});
			
			const updatedDetails = {
				...notRequiredStatus.details,
				status: ConsultationStatus.NOT_REQUIRED,
				notRequiredReason: reason,
				uploadedFiles: [...uploadedFileObjs, ...newlyUploadedFiles],
				applicationDocuments: [...applicationDocuments, ...newlyUploadedDocuments]
			};
			try {
				await saveNotRequiredStatus(consultationId, updatedDetails);
				navigate(`${S37_BASE_URL}/${applicationId}/consultation-details`);
			} catch (err) {
				// TODO: error handling
			}
		};

	return (
		<>
			<SkipLink />
			<div className="govuk-width-container">
			<div className="govuk-grid-row">
				<div className="govuk-grid-column-two-thirds">
					<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
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
					<main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
					{/* Error Summary */}
					{(Object.values(errors).some(Boolean) || fileValidationErrors.length > 0) && (
						<div className="govuk-error-summary govuk-!-width-two-thirds" aria-labelledby="error-summary-title" role="alert" data-module="govuk-error-summary">
							<h2 className="govuk-error-summary__title" id="error-summary-title">
								There is a problem
							</h2>
							<div className="govuk-error-summary__body">
								<ul className="govuk-list govuk-error-summary__list">
									{fileValidationErrors.map((error, index) => (
										<li key={`file-${index}`}>
											<a href="#" onClick={(e) => {
												e.preventDefault();
												handleErrorClick('fileUpload');
											}}>
												{error}
											</a>
										</li>
									))}
									{errors.reason && (
										<li>
											<a href="#reason">{errors.reason}</a>
										</li>
									)}
									{errors.files && (
										<li>
											<a href="#" onClick={(e) => {
												e.preventDefault();
												handleErrorClick('fileUpload');
											}}>
												{errors.files}
											</a>
										</li>
									)}
								</ul>
							</div>
						</div>
					)}
					<h2 className="govuk-caption-xl govuk-!-margin-top-0">{consultationName}</h2>
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
											setErrors(prev => ({ ...prev, reason: undefined }));
										}
									}}
									aria-describedby={errors.reason ? "reason-error" : undefined}
								/>
							</div>
						<div className={`govuk-form-group ${errors.files || fileValidationErrors.length > 0 ? 'govuk-form-group--error' : ''} govuk-!-margin-bottom-6`} id="file-upload">
							{errors.files && (
								<p id="files-error" className="govuk-error-message">
									<span className="govuk-visually-hidden">Error:</span> {errors.files}
								</p>
							)}
							{fileValidationErrors.length > 0 && fileValidationErrors.map((error, index) => (
								<p key={index} id={`fileValidation-error-${index}`} className="govuk-error-message">
									<span className="govuk-visually-hidden">Error:</span> {error}
								</p>
							))}
							
							{applicationDocuments && applicationDocuments.length > 0 && (
								<div className="govuk-!-margin-top-2">
									<h3 className="govuk-heading-s">Documents uploaded</h3>
								</div>
							)}
							
							<FileUpload
								ref={fileUploadRef}
								title="Upload any supporting documents"
								prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_NOT_REQUIRED}/${consultationId}`}
								applicationId={applicationId}
								category={FILE_CATEGORIES.CONSULTATION_NOT_REQUIRED}
								uploadedFiles={uploadedFileObjs}
								applicationDocuments={applicationDocuments}
								uploadImmediately={true}
								onUploaded={handleFilesUploaded}
								onDeleteFile={handleDeleteFile}
								onValidationErrors={handleFileValidationErrors}
								onPendingFilesChange={setPendingFiles}
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
		</>
	);
};

export default ConsultationNotRequiredPage;
