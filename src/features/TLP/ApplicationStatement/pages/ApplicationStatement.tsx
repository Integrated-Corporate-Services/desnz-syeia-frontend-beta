
import React, { useState } from "react";
import FileUpload from '../../../../components/FileUpload';
import { Link, useParams } from "react-router-dom";
import { TLP_BASE_URL } from "../../../../constants/tlp";

const ApplicationStatement: React.FC = () => {
	const [details, setDetails] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [errors, setErrors] = useState<{[key:string]:string}>({});
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
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: {[key:string]:string} = {};
		if (!details.trim()) {
			newErrors.details = "Enter details about your application";
		}
		if (files.length === 0) {
			newErrors.files = "Upload a document to support your application";
		} else {
			const allowedExtensions = ["jpg", "jpeg"];
			const fileName = files[0].name;
			const fileExt = fileName.split('.').pop()?.toLowerCase();
			if (!allowedExtensions.includes(fileExt || "")) {
				newErrors.files = "Upload a JPG or JPEG site photograph";
			}
		}
		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) {
			// Redirect to application overview
			window.location.href = `${TLP_BASE_URL}/${applicationId}/task-list`;
		} else {
			setTimeout(() => {
				const errorSummary = document.querySelector('.govuk-error-summary');
				if (errorSummary) errorSummary.scrollIntoView({ behavior: 'smooth' });
			}, 0);
		}
	};

	return (
		<main className="govuk-main-wrapper" id="main-content">
        <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
            <ol className="govuk-breadcrumbs__list">
                <li className="govuk-breadcrumbs__list-item">
                    <Link
                        className="govuk-breadcrumbs__link"
                        to={`${TLP_BASE_URL}/${applicationId}/task-list`}
                    >
                        Task list
                    </Link>
                </li>
                <li className="govuk-breadcrumbs__list-item" aria-current="page">Application statement</li>
            </ol>
        </nav>
			<div className="govuk-grid-row">
				<div className="govuk-grid-column-two-thirds">
					<h1 className="govuk-heading-xl">Application statement</h1>
					{/* Error summary */}
					{Object.keys(errors).length > 0 && (
						<div className="govuk-error-summary" data-module="govuk-error-summary" tabIndex={-1} role="alert">
							<h2 className="govuk-error-summary__title">There is a problem</h2>
							<div className="govuk-error-summary__body">
								<ul className="govuk-list govuk-error-summary__list">
									{errors.details && (
										<li><a href="#more-detail">{errors.details}</a></li>
									)}
									{errors.files && (
										<li><a href="#fileUpload1">{errors.files}</a></li>
									)}
								</ul>
							</div>
						</div>
					)}
					<form onSubmit={handleSubmit} noValidate>
						<div className={`govuk-form-group${errors.details ? " govuk-form-group--error" : ""}`} id="more-detail-group">
							<label className="govuk-label govuk-label--s" htmlFor="more-detail">
								Tell us more about your application
							</label>
							<div className="govuk-hint">
								You can use this box to:
								<ul>
									<li>explain the purpose of your application</li>
									<li>mention the legislation it relates to</li>
									<li>share background information not covered elsewhere</li>
									<li>flag anything urgent, legal or important</li>
									<li>list any linked or adjoining applications</li>
								</ul>
							</div>
							{errors.details && (
								<p id="more-detail-error" className="govuk-error-message">{errors.details}</p>
							)}
							<textarea
								className="govuk-textarea govuk-!-static-margin-bottom-1"
								id="more-detail"
								name="moreDetail"
								rows={5}
								value={details}
								onChange={e => setDetails(e.target.value)}
							></textarea>
						</div>
						{/* FileUpload evidence */}
						<div className={`govuk-form-group${errors.files ? " govuk-form-group--error" : ""}`}>
							{errors.files && (
								<p id="fileUpload1-error" className="govuk-error-message">{errors.files}</p>
							)}
							<FileUpload
								title="Upload evidence"
								prefix={`application-statement/evidence`}
								onFilesChange={setFiles}
								category="APPLICATION_STATEMENT_EVIDENCE"
							/>
						</div>
						{/* Call to action buttons */}
						<div className="govuk-!-static-margin-top-6">
							<a href={`/frontend${TLP_BASE_URL}/${applicationId}/task-list`} className="govuk-button govuk-button--secondary govuk-!-static-margin-right-2">Save for later</a>
							<button type="submit" className="govuk-button" data-module="govuk-button">Save and continue</button>
						</div>
					</form>
				</div>
			</div>
		</main>
	);
};

export default ApplicationStatement;
