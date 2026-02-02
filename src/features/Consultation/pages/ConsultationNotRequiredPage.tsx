import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import FileUpload from '../../../components/FileUpload';
import { S37_BASE_URL } from '../../../constants/s37';
import { FILE_CATEGORIES } from '../../../constants/fileCategoryConstants';
import { ConsultationStatus } from '../../../constants/consultationStatus';
import { getNotRequiredStatus, saveNotRequiredStatus } from '../../../services/consultationService';

const ConsultationNotRequiredPage: React.FC = () => {
	const { applicationId, consultationId } = useParams();
	const [reason, setReason] = useState('');
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [uploadedFileObjs, setUploadedFileObjs] = useState<any[]>([]);
	const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
	const [notRequiredStatus, setNotRequiredStatus] = useState<any>(null);
	// Handler for FileUpload onUploaded
	const handleUploadedFiles = (uploadedFiles: any[], applicationDocumentsArr: any[]) => {
		setUploadedFileObjs(prev => [...prev, ...uploadedFiles]);
		setApplicationDocuments(prev => [...prev, ...applicationDocumentsArr]);
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

		// Save and Continue handler (set status to NOT_REQUIRED)
		const navigate = useNavigate();
		const handleSaveAndContinue = async () => {
			if (!consultationId || !notRequiredStatus?.details) return;
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
					<nav className="govuk-breadcrumbs govuk-!-margin-bottom-6" aria-label="Breadcrumb">
						<ol className="govuk-breadcrumbs__list">
							<li className="govuk-breadcrumbs__list-item">
								<Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>Task list</Link>
							</li>
							<li className="govuk-breadcrumbs__list-item">
								<Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/consultation-details`}>Consultation details</Link>
							</li>
							<li className="govuk-breadcrumbs__list-item" aria-current="page">Consultation not required</li>
						</ol>
					</nav>
					<main className="govuk-main-wrapper govuk-!-margin-bottom-6" id="main-content">
						<h1 className="govuk-heading-s govuk-hint " style={{ color: '#b1b4b6' }}>Natural England</h1>
						<h2 className="govuk-heading-l govuk-!-margin-bottom-6">Consultation not required</h2>
						<div className="govuk-!-margin-bottom-6">
							<h2 className="govuk-heading-m govuk-!-margin-bottom-2">Important information</h2>
							<h3 className="govuk-heading-s govuk-!-margin-bottom-1">Sites of Special Scientific Interest (SSSI) assent</h3>
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
							<div className="govuk-form-group govuk-!-margin-bottom-6">
								<label className="govuk-label govuk-label--s" htmlFor="reason">Explain why this consultation is not required.</label>
								<textarea
									className="govuk-textarea govuk-!-margin-top-2"
									id="reason"
									name="reason"
									rows={4}
									value={reason}
									onChange={e => setReason(e.target.value)}
								/>
							</div>
							<div className="govuk-form-group govuk-!-margin-bottom-6">
								<FileUpload
									title="Upload supporting documents if any"
									prefix={`${applicationId}/${FILE_CATEGORIES.CONSULTATION_NOT_REQUIRED}/${consultationId}`}
									applicationId={applicationId}
									category={FILE_CATEGORIES.CONSULTATION_NOT_REQUIRED}
									uploadedFiles={uploadedFileObjs}
									onFilesChange={setUploadedFiles}
									onRemoveFile={idx => {
										setUploadedFiles(files => files.filter((_, i) => i !== idx));
										setUploadedFileObjs(objs => objs.filter((_, i) => i !== idx));
										setApplicationDocuments(docs => docs.filter((_, i) => i !== idx));
									}}
									onUploaded={handleUploadedFiles}
									consultationId={consultationId}
								/>
							</div>
							<div className="govuk-button-group govuk-!-margin-top-6">
								<button
									type="button"
									className="govuk-button govuk-button--secondary"
									data-module="govuk-button"
									onClick={handleSaveForLater}
								>
									Save for later
								</button>
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
