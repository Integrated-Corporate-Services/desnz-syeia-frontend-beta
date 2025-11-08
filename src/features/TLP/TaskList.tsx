import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useApplicationStore } from "../../store/useApplicationStore";

const TaskList: React.FC = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const appId = params.get('id');
	const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
	const application = useApplicationStore(state => state.application);
	const [orgName, setOrgName] = useState('');

	useEffect(() => {
		if (appId) {
			fetchAndSetApplication(appId);
		}
	}, [appId, fetchAndSetApplication]);

	useEffect(() => {
		if (application?.application_party?.organisation_name) {
			setOrgName(application.application_party.organisation_name);
		}
	}, [application]);

	return (
		<div className="govuk-width-container">
			<main className="govuk-main-wrapper" id="main-content">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<span className="govuk-caption-l">{orgName || 'Organisation'}</span>
						<h1 className="govuk-heading-l">Tree lopping and felling application</h1>
						<p className="govuk-hint">Complete the following sections in order to create and submit your application</p>

						<h2 className="govuk-heading-m">1. Applicant details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/applicant-details?id=${appId}`}>
										<strong>Applicant details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/network-operator-contact-details?id=${appId}`}>
										<strong>Check applicant contact details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">2. Project details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/landowner-occupant-details?id=${appId}`}>
										<strong>Landowner or occupant details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/application-and-land-details?id=${appId}`}>
										<strong>Application and Land details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/assets?id=${appId}`}>
										<strong>Trees and vegetation</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">3. Supporting information</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/not-found/coming-soon?id=${appId}`}>
										<strong>Supporting information</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href="form-negotiations.html">
										<strong>Negotiations</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">4. Application statement</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href="form-statement.html">
										<strong>Application statement</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">5. Payment</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href="#">
										<strong>Payment</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">6. Review and Submit</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href="application-submit.html">
										<strong>Submit application</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<a className="govuk-button govuk-button--warning" href="delete-application.html">
							Delete application
						</a>
					</div>
				</div>
			</main>
		</div>
	);
};

export default TaskList;
