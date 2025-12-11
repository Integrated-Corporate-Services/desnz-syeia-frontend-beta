import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";

const ApplicationSubmit: React.FC = () => {
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

	// State for project details, plan documents, layers, and routes
	const [projectDetails, setProjectDetails] = useState<any>(null);
	const [planDocuments, setPlanDocuments] = useState<any[]>([]);
	const [layers, setLayers] = useState<string[]>([]);
	const [routes, setRoutes] = useState<any[]>([]);

	// Add state for supporting info
	const [supportingQuestions, setSupportingQuestions] = useState<any>(null);
	const [supportingDocuments, setSupportingDocuments] = useState<any[]>([]);
	useEffect(() => {
		if (!applicationId) return;
		fetch(`/backend/api/applications/${applicationId}/review`)
			.then(res => res.json())
			.then(data => {
				const overview = data.sections?.projectDetails?.overview;
				let details = null;
				// Prefer application_project_overview
				if (overview?.application_project_overview) {
					details = { ...overview.application_project_overview };
					if (!details.project_description && overview?.project_details?.project_description) {
						details.project_description = overview.project_details.project_description;
					}
					if (!details.projectDescription && overview?.project_details?.projectDescription) {
						details.projectDescription = overview.project_details.projectDescription;
					}
					if (!details.project_name && overview?.project_details?.project_name) {
						details.project_name = overview.project_details.project_name;
					}
				} else if (overview?.project_details) {
					details = { ...overview.project_details };
				}
				if (details && !details.project_name && Array.isArray(overview?.application_relations) && overview.application_relations.length > 0) {
					details.project_name = overview.application_relations[0].project_name;
				}
				setProjectDetails(details);
				setPlanDocuments(overview?.planDocuments || []);
				// Set layers data for sensitive areas from location.sensitiveAreaChecks
				const sensitiveLayers = data.sections?.location?.sensitiveAreaChecks?.layers;
				if (Array.isArray(sensitiveLayers)) {
					setLayers(sensitiveLayers);
				} else {
					setLayers([]);
				}
				// Set routes data from location.route
				const routeArr = data.sections?.location?.route;
				if (Array.isArray(routeArr)) {
					setRoutes(routeArr);
				} else {
					setRoutes([]);
				}
				// Set supporting info questions and documents
				setSupportingQuestions(data.sections?.supportingInformation?.supportingQuestions || null);
				setSupportingDocuments(data.sections?.supportingInformation?.supportingDocuments || []);
			})
			.catch(() => {
				setProjectDetails(null);
				setPlanDocuments([]);
			});
	}, [applicationId]);

	return (
		<div className="govuk-width-container">
			<main className="govuk-main-wrapper" id="main-content">
				<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
                    <ol className="govuk-breadcrumbs__list">
                        <li className="govuk-breadcrumbs__list-item" aria-current="false">
                            <Link className="govuk-breadcrumbs__link" to={`${S37_BASE_URL}/${applicationId}/task-list`}>
                                Task list
                            </Link>
                        </li>
                        <li className="govuk-breadcrumbs__list-item" aria-current="true">
                            Submit Section 37 application
                        </li>
                    </ol>
				</nav>
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-three-quarters">
						<h1 className="govuk-heading-xl">Check your answers before sending your application</h1>
						{/* Applicant details summary card */}
						<h2 className="govuk-heading-m">Applicant details</h2>
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Applicant details</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/network-operator-details`}>Change<span className="govuk-visually-hidden"> of University of Gloucestershire (University of Gloucestershire)</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Applicant name</dt>
										<dd className="govuk-summary-list__value">Network operator name</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Applicant contact name</dt>
										<dd className="govuk-summary-list__value">Network operator contact name</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Address</dt>
										<dd className="govuk-summary-list__value">72 Guild Street<br />London<br />SE23 6FH</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Email address</dt>
										<dd className="govuk-summary-list__value">abc@example.com</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Phone number</dt>
										<dd className="govuk-summary-list__value">07700 900457</dd>
									</div>
								</dl>
							</div>
						</div>
						{/* Project details summary card */}
						<h2 className="govuk-heading-m">Project details</h2>	
						{/* Project overview summary card */}
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Project overview</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/project-overview`}>Change<span className="govuk-visually-hidden"> from University of Bristol (University of Bristol)</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Project name</dt>
										<dd className="govuk-summary-list__value">{projectDetails?.project_name || "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Project description</dt>
										<dd className="govuk-summary-list__value">{projectDetails?.project_description || projectDetails?.projectDescription || "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Plan reference</dt>
										<dd className="govuk-summary-list__value">{projectDetails?.plan_reference || "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Earliest work start date</dt>
										<dd className="govuk-summary-list__value">
											{projectDetails && projectDetails.earliest_work_start_date_month && projectDetails.earliest_work_start_date_year
												? `${projectDetails.earliest_work_start_date_month}/${projectDetails.earliest_work_start_date_year}`
												: "-"}
										</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Latest work start date</dt>
										<dd className="govuk-summary-list__value">
											{projectDetails && projectDetails.latest_work_start_date_month && projectDetails.latest_work_start_date_year
												? `${projectDetails.latest_work_start_date_month}/${projectDetails.latest_work_start_date_year}`
												: "-"}
										</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Max structure height (m)</dt>
										<dd className="govuk-summary-list__value">{projectDetails?.max_structure_height_m || "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Last updated</dt>
										<dd className="govuk-summary-list__value">{projectDetails?.updated_at ? new Date(projectDetails.updated_at).toLocaleDateString() : "-"}</dd>
									</div>
									<div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
										<dt className="govuk-summary-list__key">Plan information documents</dt>
										<dd className="govuk-summary-list__value">
											<ul className="govuk-list">
												{planDocuments.length > 0 ? (
													planDocuments.map(doc => (
														<li key={doc.document_id}>
															{doc.title} {doc.description && <>- {doc.description}</>}
														</li>
													))
												) : (
													<li>-</li>
												)}
											</ul>
										</dd>
									</div>
								</dl>
							</div>
						</div>           
						{/* Assets summary card */}
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Assets</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/asset-information`}>Change<span className="govuk-visually-hidden"> from University of Bristol (University of Bristol)</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Line type</dt>
										<dd className="govuk-summary-list__value">Low voltage overhead line</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Line voltage</dt>
										<dd className="govuk-summary-list__value">6.6kV</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Description</dt>
										<dd className="govuk-summary-list__value">Test comment</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Line type</dt>
										<dd className="govuk-summary-list__value">High voltage overhead line</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Line voltage</dt>
										<dd className="govuk-summary-list__value">11kV</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Description</dt>
										<dd className="govuk-summary-list__value">Test comment</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Line type</dt>
										<dd className="govuk-summary-list__value">High voltage overhead line</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Line voltage</dt>
										<dd className="govuk-summary-list__value">20kV</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Description</dt>
										<dd className="govuk-summary-list__value">Test comment</dd>
									</div>
								</dl>
							</div>
						</div>
                        <h2 className="govuk-heading-m">Location</h2>
						{/* Route summary cards */}
						{routes.length > 0 ? routes.map((route, idx) => (
							<div className="govuk-summary-card" key={route.route_id || idx}>
								<div className="govuk-summary-card__title-wrapper">
									<h2 className="govuk-summary-card__title">{`Route ${String.fromCharCode(65 + idx)}`}</h2>
									<ul className="govuk-summary-card__actions">
										<li className="govuk-summary-card__action">
											<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/route-overview`}>Change<span className="govuk-visually-hidden"> for {route.routeName}</span></Link>
										</li>
									</ul>
								</div>
								<div className="govuk-summary-card__content">
									<table className="govuk-table" style={{ marginBottom: '30px' }}>
										<thead className="govuk-table__head">
											<tr className="govuk-table__row">
												<th className="govuk-table__header">Easting</th>
												<th className="govuk-table__header">Northing</th>
											</tr>
										</thead>
										<tbody className="govuk-table__body">
											{Array.isArray(route.gridPoints) && route.gridPoints.length > 0 ? (
												route.gridPoints.map((point, pidx) => (
													<tr className="govuk-table__row" key={point.point_id || pidx}>
														<td className="govuk-table__cell">{point.easting}</td>
														<td className="govuk-table__cell">{point.northing}</td>
													</tr>
												))
											) : (
												<tr className="govuk-table__row">
													<td className="govuk-table__cell">-</td>
													<td className="govuk-table__cell">-</td>
												</tr>
											)}
										</tbody>
									</table>
									{route.disconnectedroute_justification && (
										<div className="govuk-inset-text">
											<strong>Disconnected route justification:</strong> {route.disconnectedroute_justification}
										</div>
									)}
								</div>
							</div>
						)) : null}
                        {/* Sensitive area check summary card */}
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Sensitive area check</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/sensitive-area-check`}>Change<span className="govuk-visually-hidden"> from University of Bristol (University of Bristol)</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Tolerance required</dt>
										<dd className="govuk-summary-list__value">No</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Sensitive areas the route passes through</dt>
										<dd className="govuk-summary-list__value">
											<ul className="govuk-list govuk-list--bullet">
												{layers.length > 0
													? layers.map((layer, idx) => <li key={idx}>{layer}</li>)
													: <li>-</li>}
											</ul>
										</dd>
									</div>
								</dl>
							</div>
						</div>
						<h2 className="govuk-heading-m">Supporting information</h2>
						{/* Supporting information summary card - fixed to use state variables and map correct questions/answers */}
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Supporting information</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/supporting-info`}>Change<span className="govuk-visually-hidden"> supporting information</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Have all wayleaves been obtained?</dt>
										<dd className="govuk-summary-list__value">{supportingQuestions ? (supportingQuestions.wayleaves_obtained ? "Yes" : "No") : "-"}</dd>
									</div>
									{supportingQuestions && supportingQuestions.wayleaves_obtained === false && (
										<div className="govuk-summary-list__row">
											<dt className="govuk-summary-list__key">Why have all wayleaves not been obtained?</dt>
											<dd className="govuk-summary-list__value">{supportingQuestions.wayleaves_not_obtained_reason || "-"}</dd>
										</div>
									)}
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">I confirm that the works will comply with The Electricity Safety, Quality and Continuity Regulations 2002</dt>
										<dd className="govuk-summary-list__value">{supportingQuestions ? (supportingQuestions.esqcr_2002_compliance_confirmed ? "Yes" : "No") : "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Do you have any further supporting documents to provide?</dt>
										<dd className="govuk-summary-list__value">{supportingQuestions ? (supportingQuestions.has_additional_supporting_documents ? "Yes" : "No") : "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Do you have any comments to make in support of your application?</dt>
										<dd className="govuk-summary-list__value">{supportingQuestions?.applicant_supporting_comments || "-"}</dd>
									</div>
									<div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
										<dt className="govuk-summary-list__key">Supporting information documents</dt>
										<dd className="govuk-summary-list__value">
											<ul className="govuk-list">
												{supportingDocuments.length > 0 ? (
													supportingDocuments.map((doc: any) => (
														<li key={doc.document_id}>
															{doc.title} {doc.description && <>- {doc.description}</>}
														</li>
													))
												) : (
													<li>-</li>
												)}
											</ul>
										</dd>
									</div>
								</dl>
							</div>
						</div>
						{/* EIA fees summary card - updated to show correct questions and mapped data */}
						<h2 className="govuk-heading-m">EIA fees</h2>
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">EIA fees</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/eia-fees`}>Change<span className="govuk-visually-hidden"> EIA fees</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Is this an EIA development?</dt>
										<dd className="govuk-summary-list__value">{supportingQuestions && typeof supportingQuestions.is_eia_development !== 'undefined' ? (supportingQuestions.is_eia_development ? "Yes" : "No") : "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Does this application require a full EIA?</dt>
										<dd className="govuk-summary-list__value">{supportingQuestions && typeof supportingQuestions.requires_full_eia !== 'undefined' ? (supportingQuestions.requires_full_eia ? "Yes" : "No") : "-"}</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Is this application for screening only?</dt>
										<dd className="govuk-summary-list__value">{supportingQuestions && typeof supportingQuestions.screening_only !== 'undefined' ? (supportingQuestions.screening_only ? "Yes" : "No") : "-"}</dd>
									</div>
								</dl>
							</div>
						</div>
						{/* Application statement summary card */}
						<h2 className="govuk-heading-m">Application statement</h2>
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Application statement</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to="/form-statement">Change<span className="govuk-visually-hidden"> from University of Bristol (University of Bristol)</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Tell us more about your application</dt>
										<dd className="govuk-summary-list__value">Description about the application</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Upload any other documents to support your application</dt>
										<dd className="govuk-summary-list__value">
											<Link className="govuk-link" to="#">Document 1</Link>
										</dd>
									</div>
								</dl>
							</div>
						</div>
						{/* Submit application form */}
						<div className="govuk-form-group">
							<form action="/application-submit" method="post" noValidate>
								<div className="govuk-form-group">
									<fieldset className="govuk-fieldset">
										<legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Submit application</legend>
										<div className="govuk-checkboxes govuk-checkboxes--small" data-module="govuk-checkboxes" data-govuk-checkboxes-init="">
											<div className="govuk-checkboxes__item">
												<input className="govuk-checkboxes__input" id="organisation" name="organisation" type="checkbox" value="hmrc" />
												<label className="govuk-label govuk-checkboxes__label" htmlFor="organisation">
													I confirm I’ve read and understood the information I’ve provided, and that it’s accurate to the best of my knowledge.
												</label>
											</div>
										</div>
									</fieldset>
								</div>
								<div>
									<button type="submit" className="govuk-button" data-module="govuk-button" data-govuk-button-init>
										Pay and submit application
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default ApplicationSubmit;
