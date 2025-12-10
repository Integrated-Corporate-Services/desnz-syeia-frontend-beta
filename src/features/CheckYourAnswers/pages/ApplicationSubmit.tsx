import React from "react";
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
								<h2 className="govuk-heading-m">Applicant details</h2>
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
										<dd className="govuk-summary-list__value">Project name</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Project description</dt>
										<dd className="govuk-summary-list__value">Project description</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Tallest pole height</dt>
										<dd className="govuk-summary-list__value">Tallest pole height</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Plan reference</dt>
										<dd className="govuk-summary-list__value">Plan reference</dd>
									</div>
									<div className="govuk-summary-list__row govuk-summary-list__row--no-actions ">
										<dt className="govuk-summary-list__key">Plan information documents</dt>
										<dd className="govuk-summary-list__value">
											<ul className="govuk-list"></ul>
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
						{/* Supporting information summary card */}
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Route A</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/route-guidance`}>Change<span className="govuk-visually-hidden"> from University of Bristol (University of Bristol)</span></Link>
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
										<tr className="govuk-table__row">
											<td className="govuk-table__cell">425209</td>
											<td className="govuk-table__cell">110283</td>
										</tr>
										<tr className="govuk-table__row">
											<td className="govuk-table__cell">425103</td>
											<td className="govuk-table__cell">110092</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
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
												<li>National Parks (England)</li>
												<li>Ramsar (England)</li>
												<li>Sites of Special Scientific Interest (England)</li>
												<li>Special Areas of Conservation (England)</li>
												<li>Special Protection Areas (England)</li>
												<li>SSSI Impact Risk Zones (England)</li>
											</ul>
										</dd>
									</div>
								</dl>
							</div>
						</div>
						<h2 className="govuk-heading-m">Supporting information</h2>
						{/* Supporting information summary card */}
						<div className="govuk-summary-card">
							<div className="govuk-summary-card__title-wrapper">
								<h2 className="govuk-summary-card__title">Supporting information</h2>
								<ul className="govuk-summary-card__actions">
									<li className="govuk-summary-card__action">
										<Link className="govuk-link" to={`${S37_BASE_URL}/${applicationId}/supporting-info`}>Change<span className="govuk-visually-hidden"> from University of Bristol (University of Bristol)</span></Link>
									</li>
								</ul>
							</div>
							<div className="govuk-summary-card__content">
								<dl className="govuk-summary-list">
									{/* ...existing code for supporting information rows... */}
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Has the current landowner signed a wayleave?</dt>
										<dd className="govuk-summary-list__value">Yes</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Upload current landowners signed wayleave</dt>
										<dd className="govuk-summary-list__value">
											<Link className="govuk-link" to="#">Document 1</Link><br />
											<Link className="govuk-link" to="#">Document 2</Link><br />
											<Link className="govuk-link" to="#">Document 3</Link>
										</dd>
									</div>
									{/* ...other supporting information rows... */}
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Has the current landowner inherited a necessary wayleave in relation to the specified asset schedule?</dt>
										<dd className="govuk-summary-list__value">Yes</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Upload a document thats shows inheritance of a necessary wayleave in relation to the specified asset schedule</dt>
										<dd className="govuk-summary-list__value">
											<Link className="govuk-link" to="#">Document 1</Link><br />
											<Link className="govuk-link" to="#">Document 2</Link><br />
											<Link className="govuk-link" to="#">Document 3</Link>
										</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Have Wayleave Payments previously been made to the grantor?</dt>
										<dd className="govuk-summary-list__value">No</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Have Wayleave Payments been accepted by the grantor?</dt>
										<dd className="govuk-summary-list__value">No</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Is a new contract implied?</dt>
										<dd className="govuk-summary-list__value">Yes</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Why do you believe this is so?</dt>
										<dd className="govuk-summary-list__value">Reason for new contract</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Has a Written Termination Notice been given?</dt>
										<dd className="govuk-summary-list__value">Yes</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Written Termination Notice issue date</dt>
										<dd className="govuk-summary-list__value">05 March 2025</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Upload Written Termination Notice document</dt>
										<dd className="govuk-summary-list__value">
											<Link className="govuk-link" to="#">Document 1</Link><br />
											<Link className="govuk-link" to="#">Document 2</Link><br />
											<Link className="govuk-link" to="#">Document 3</Link>
										</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Has a Written Removal Notice been given?</dt>
										<dd className="govuk-summary-list__value">Yes</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Written Removal Notice issue date</dt>
										<dd className="govuk-summary-list__value">10 March 2025</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Upload Written Removal Notice document</dt>
										<dd className="govuk-summary-list__value">
											<Link className="govuk-link" to="#">Document 1</Link><br />
											<Link className="govuk-link" to="#">Document 2</Link><br />
											<Link className="govuk-link" to="#">Document 3</Link>
										</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Does your application include a title plan?</dt>
										<dd className="govuk-summary-list__value">Yes</dd>
									</div>
									<div className="govuk-summary-list__row">
										<dt className="govuk-summary-list__key">Upload the title plan document</dt>
										<dd className="govuk-summary-list__value">
											<Link className="govuk-link" to="#">Titleplan-pic 1</Link><br />
											<Link className="govuk-link" to="#">Titleplan-pic 2</Link><br />
											<Link className="govuk-link" to="#">Titleplan-pic 3</Link>
										</dd>
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
