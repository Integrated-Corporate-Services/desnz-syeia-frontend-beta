import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApplicationStore } from "../../../../store/useApplicationStore";
import { useProgressStore } from "../../../../store/useProgressStore";
import { useGetApplicationId } from "../../../../hooks/useGetApplicationId";
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { NWL_TASK_LIST_ROUTES, buildNwlRoute } from '../constants/taskListRoutes';
import { NWL_SUBSECTIONS, getStatusClass, getStatusText, getSubsectionStatus } from '../utils/nwlProgressUtils';


const NWLTaskList: React.FC = () => {
	const appId = useGetApplicationId();
	const fetchAndSetApplication = useApplicationStore(state => state.fetchAndSetApplication);
	const application = useApplicationStore(state => state.application);
	const { progress, fetchProgress } = useProgressStore();
	const [orgName, setOrgName] = useState('');
	const [submitting] = useState(false);
	const navigate = useNavigate();
	const lastFetchedAppId = useRef<string | null>(null);

	// Fetch application and progress only when appId changes
	useEffect(() => {
		if (!appId || lastFetchedAppId.current === appId) return;
		lastFetchedAppId.current = appId;
		fetchAndSetApplication(appId);
		fetchProgress(appId);
	}, [appId, fetchAndSetApplication, fetchProgress]);

	// Set org name when application changes
	useEffect(() => {
		if (application?.application_party?.organisation_name) {
			setOrgName(application.application_party.organisation_name);
		} else {
			setOrgName('');
		}
	}, [application]);


	// Helper to get status for a subsection, always based on current progress and appId
	const getStatus = (subsectionName: string) => {
		return getSubsectionStatus(progress, subsectionName);
	};


	// Helper to check if a link should be disabled
	const isLinkDisabled = (subsectionName: string) => {
		const status = getStatus(subsectionName);
		return status.toLowerCase() === 'cannot start yet';
	};


	// Helper to render status tag
	const renderStatusTag = (subsectionName: string) => {
		const status = getStatus(subsectionName);
		const statusClass = getStatusClass(status);
		const statusText = getStatusText(status);
		return (
			<div className="govuk-task-list__status">
				<strong className={statusClass}>{statusText}</strong>
			</div>
		);
	};


	// Helper to render link or disabled text
	const renderLink = (subsectionName: string, displayText: string, route: string) => {
		const disabled = isLinkDisabled(subsectionName);
		if (disabled) {
			return <strong className="govuk-task-list__name-and-hint">{displayText}</strong>;
		}
		return (
			<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(route, appId)}>
				<strong>{displayText}</strong>
			</Link>
		);
	};

	return (
		<div className="govuk-width-container">
			<nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
				<ol className="govuk-breadcrumbs__list">
					<li className="govuk-breadcrumbs__list-item">
						<Link className="govuk-breadcrumbs__link" to="/workbasket">Workbasket</Link>
					</li>
					<li className="govuk-breadcrumbs__list-item govuk-breadcrumbs__list-item--current" aria-current="true">Task list</li>
				</ol>
			</nav>
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
						{renderStatusTag(NWL_SUBSECTIONS.APPLICANT_DETAILS)}
						</li>
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
							<Link className="govuk-link govuk-task-list__link" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.NETWORK_OPERATOR_CONTACT_DETAILS, appId)}>
								<strong>Check applicant contact details</strong>
							</Link>
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.CHECK_APPLICANT_CONTACT_DETAILS)}
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
								{renderStatusTag(NWL_SUBSECTIONS.TYPE_OF_USE)}
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									{renderLink(NWL_SUBSECTIONS.GROUNDS_FOR_APPLICATION, 'Grounds for application', NWL_TASK_LIST_ROUTES.GROUNDS_FOR_APPLICATION)}
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.GROUNDS_FOR_APPLICATION)}
							</li>
						</ul>

						<h2 className="govuk-heading-m">3. Objector details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									{renderLink(NWL_SUBSECTIONS.OBJECTOR_INTRODUCTION, 'Introduction', NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS_INTRODUCTION)}
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.OBJECTOR_INTRODUCTION)}
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									{renderLink(NWL_SUBSECTIONS.OBJECTOR_DETAILS, 'Objector details', NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS)}
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.OBJECTOR_DETAILS)}
							</li>
						</ul>

						<h2 className="govuk-heading-m">4. Land details</h2>
						<ul className="govuk-task-list">
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									{renderLink(NWL_SUBSECTIONS.SITE_ADDRESS, 'Site address', NWL_TASK_LIST_ROUTES.SITE_ADDRESS)}
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.SITE_ADDRESS)}
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									{renderLink(NWL_SUBSECTIONS.LAND_REGISTRY, 'Land registry', NWL_TASK_LIST_ROUTES.LAND_REGISTRY)}
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.LAND_REGISTRY)}
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									{renderLink(NWL_SUBSECTIONS.OS_GRID_REFERENCE, 'OS Grid reference', NWL_TASK_LIST_ROUTES.OS_GRID_REFERENCE)}
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.OS_GRID_REFERENCE)}
							</li>
							<li className="govuk-task-list__item govuk-task-list__item--with-link">
								<div className="govuk-task-list__name-and-hint">
									{renderLink(NWL_SUBSECTIONS.IDENTIFYING_INFORMATION, 'Identifying information', NWL_TASK_LIST_ROUTES.IDENTIFYING_INFORMATION)}
								</div>
								{renderStatusTag(NWL_SUBSECTIONS.IDENTIFYING_INFORMATION)}
						</li>
					</ul>

					<h2 className="govuk-heading-m">5. Assets</h2>
					<ul className="govuk-task-list">
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
								{renderLink(NWL_SUBSECTIONS.ASSETS, 'Information about the lines', NWL_TASK_LIST_ROUTES.INFORMATION_ABOUT_LINES)}
							</div>
							{renderStatusTag(NWL_SUBSECTIONS.ASSETS)}
						</li>
					</ul>

					<h2 className="govuk-heading-m">6. Negotiations</h2>
					<ul className="govuk-task-list">
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
								{renderLink(NWL_SUBSECTIONS.NEGOTIATIONS, 'Existing negotiations', NWL_TASK_LIST_ROUTES.EXISTING_NEGOTIATIONS)}
							</div>
							{renderStatusTag(NWL_SUBSECTIONS.NEGOTIATIONS)}
						</li>
					</ul>

					<h2 className="govuk-heading-m">7. Additional information</h2>
					<ul className="govuk-task-list">
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
								{renderLink(NWL_SUBSECTIONS.SUPPORTING_INFORMATION, 'Related applications', NWL_TASK_LIST_ROUTES.RELATED_APPLICATIONS)}
							</div>
							{renderStatusTag(NWL_SUBSECTIONS.SUPPORTING_INFORMATION)}
						</li>
					</ul>

					<h2 className="govuk-heading-m">8. Pay and submit</h2>
					<ul className="govuk-task-list">
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
								{renderLink(NWL_SUBSECTIONS.CHECK_YOUR_ANSWERS, 'Check your answers', NWL_TASK_LIST_ROUTES.CHECK_YOUR_ANSWERS)}
							</div>
							{renderStatusTag(NWL_SUBSECTIONS.CHECK_YOUR_ANSWERS)}
						</li>
						<li className="govuk-task-list__item govuk-task-list__item--with-link">
							<div className="govuk-task-list__name-and-hint">
								{renderLink(NWL_SUBSECTIONS.PAY_AND_SUBMIT, 'Pay and submit', NWL_TASK_LIST_ROUTES.PAY_AND_SUBMIT)}
							</div>
							{renderStatusTag(NWL_SUBSECTIONS.PAY_AND_SUBMIT)}
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
