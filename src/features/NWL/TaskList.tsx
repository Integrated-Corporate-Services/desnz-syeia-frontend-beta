import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../store/useApplicationStore";
import { useGetApplicationId } from "../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from '../../constants/nwl';

const TaskList: React.FC = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const appId = useGetApplicationId();
	const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
	const application = useApplicationStore(state => state.application);
	const [orgName, setOrgName] = useState('');
	const [submitting, setSubmitting] = useState(false);
  	const navigate = useNavigate();

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
						<h1 className="govuk-heading-l">Necessary wayleave consent application</h1>
						<p className="govuk-hint">Complete the following sections in order to create and submit your application</p>

						<h2 className="govuk-heading-m">1. Applicant details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/applicant-details`}>
										<strong>Applicant details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/network-operator-contact-details`}>
										<strong>Check applicant contact details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">2. Application details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/type-of-use`}>
										<strong>Type of use</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/grounds-for-application`}>
										<strong>Grounds for application</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">3. Objector details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/objector-details-introduction`}>
										<strong>Introduction</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/objector-details`}>
										<strong>Objector details</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">4. Land details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/site-address`}>
										<strong>Site address</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/land-registry`}>
										<strong>Land registry</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/os-grid-reference`}>
										<strong>OS Grid reference</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/identifying-information`}>
										<strong>Identifying information</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">5. Assets</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/information-about-lines`}>
										<strong>Information about the lines</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/application-plan`}>
										<strong>Application plan</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/plan-verification`}>
										<strong>Plan verification</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">6. Negotiations</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/existing-negotiations`}>
										<strong>Existing negotiations</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/evidence-of-negotiations`}>
										<strong>Evidence of negotiations</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">7. Additional information</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/related-applications`}>
										<strong>Related applications</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/other-important-information`}>
										<strong>Other important information</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
						</ul>

						<h2 className="govuk-heading-m">8. Pay and submit</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/check-your-answers`}>
										<strong>Check your answers</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--grey">Cannot start yet</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									<a className="govuk-link govuk-task-list__link" href={`/frontend/nwl/${appId}/pay-and-submit`}>
										<strong>Pay and submit</strong>
									</a>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--grey">Cannot start yet</strong>
								</div>
							</li>
						</ul>

						<button
							className="govuk-button govuk-button--warning"
							type="button"
							onClick={() => navigate(`${NWL_BASE_URL}/${appId}/delete`)}
							disabled={submitting}
							style={{ marginRight: '1rem' }}
						>
							Delete application
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default TaskList;
