import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { NWL_TASK_LIST_ROUTES, buildNwlRoute } from '../constants/taskListRoutes';

const NWLTaskList: React.FC = () => {
	const appId = useGetApplicationId();
	const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
	const application = useApplicationStore(state => state.application);
	const [orgName, setOrgName] = useState('');
	const [submitting] = useState(false);
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
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.APPLICANT_DETAILS, appId)}>
								<strong>Applicant details</strong>
							</Link>
							</div>
							<div className="govuk-task-list__status">
								<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
							</div>
						</li>
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.NETWORK_OPERATOR_CONTACT_DETAILS, appId)}>
								<strong>Check applicant contact details</strong>
							</Link>
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
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.TYPE_OF_USE, appId)}>
									<strong>Type of use</strong>
								</Link>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.GROUNDS_FOR_APPLICATION, appId)}>
									<strong>Grounds for application</strong>
								</Link>
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
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS_INTRODUCTION, appId)}>
									<strong>Introduction</strong>
								</Link>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS, appId)}>
									<strong>Objector details</strong>
								</Link>
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
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.SITE_ADDRESS, appId)}>
									<strong>Site address</strong>
								</Link>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.LAND_REGISTRY, appId)}>
									<strong>Land registry</strong>
								</Link>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.OS_GRID_REFERENCE, appId)}>
									<strong>OS Grid reference</strong>
								</Link>
								</div>
								<div className="govuk-task-list__status">
									<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
								</div>
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.IDENTIFYING_INFORMATION, appId)}>
									<strong>Identifying information</strong>
								</Link>
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
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.INFORMATION_ABOUT_LINES, appId)}>
									<strong>Information about the lines</strong>
								</Link>
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
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.EXISTING_NEGOTIATIONS, appId)}>
									<strong>Existing negotiations</strong>
								</Link>
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
						<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.RELATED_APPLICATIONS, appId)}>
								<strong>Related applications</strong>
							</Link>
							</div>
							<div className="govuk-task-list__status">
								<strong className="govuk-tag govuk-tag--blue">Incomplete</strong>
							</div>
						</li>
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
						<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.OTHER_IMPORTANT_INFORMATION, appId)}>
								<strong>Other important information</strong>
							</Link>
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
						<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.CHECK_YOUR_ANSWERS, appId)}>
								<strong>Check your answers</strong>
							</Link>
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

export default NWLTaskList;
