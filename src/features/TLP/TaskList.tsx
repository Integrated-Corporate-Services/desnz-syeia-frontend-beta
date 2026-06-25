import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetApplicationId } from "../../hooks/useGetApplicationId";
import { useApplication } from "../../hooks/useApplication";
import { TLP_BASE_URL } from '../../constants/tlp';
import SkipLink from "../../components/SkipLink";

const TaskList: React.FC = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const appId = useGetApplicationId();
	const { application, fetchApplication } = useApplication();
	const [orgName, setOrgName] = useState('');
  	const navigate = useNavigate();
  	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (appId) {
			fetchApplication(appId);
		}
	}, [appId, fetchApplication]);

	useEffect(() => {
		if (application?.application_party?.organisation_name) {
			setOrgName(application.application_party.organisation_name);
		}
	}, [application]);

	return (
		<>
			<SkipLink />
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
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/applicant-details`}>
										<strong>Applicant details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/network-operator-contact-details`}>
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
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/landowner-occupant-details`}>
										<strong>Landowner or occupant details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/application-and-land-details`}>
										<strong>Application and Land details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/assets`}>
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
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/supporting-information`}>
										<strong>Supporting information</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/negotiations`}>
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
									<a className="govuk-link govuk-task-list__link" href={`/frontend/tlp/${appId}/application-statement`}>
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

						<button
							className="govuk-button govuk-button--warning"
							type="button"
							onClick={() => navigate(`${TLP_BASE_URL}/${appId}/delete`)}
							disabled={submitting}
							style={{ marginRight: '1rem' }}
						>
							Delete application
						</button>
					</div>
				</div>
			</main>
		</div>
		</>
};

export default TaskList;
