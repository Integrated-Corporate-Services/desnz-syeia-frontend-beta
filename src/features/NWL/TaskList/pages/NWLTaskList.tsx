import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { NWL_BASE_URL } from '../../../../constants/nwl';
import { NWL_TASK_LIST_ROUTES, buildNwlRoute } from '../constants/taskListRoutes';
import { NWL_SUBSECTIONS, getStatusClass, getStatusText, getSubsectionStatus } from '../utils/nwlProgressUtils';
import { applicationApiService } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';

const NWLTaskList: React.FC = () => {
	const params = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const [application, setApplication] = useState<any>(null);
	const [progress, setProgress] = useState<any>(null);
	const [orgName, setOrgName] = useState('');
	const [submitting] = useState(false);
	const lastFetchedAppId = useRef<string | null>(null);

	// Get applicationId from params, query, or application state
	const getApplicationId = () => {
		if (application && application.application_id) return application.application_id;
		if (params.applicationId) return params.applicationId as string;
		if (params.id) return params.id as string;
		if (typeof window !== "undefined") {
			const searchParams = new URLSearchParams(location.search);
			const idFromQuery = searchParams.get("id") || searchParams.get("applicationId");
			if (idFromQuery) return idFromQuery;
		}
		return "";
	};
	const appId = getApplicationId();


	// Fetch application and progress only when appId changes
	useEffect(() => {
		if (!appId || lastFetchedAppId.current === appId) return;
		lastFetchedAppId.current = appId;
		// Fetch application
		applicationApiService.getApplicationById(appId)
			.then(app => {
				setApplication(app);
				if (app?.application_party?.organisation_name) {
					setOrgName(app.application_party.organisation_name);
				} else {
					setOrgName('');
				}
			});
		// Fetch progress
		progressApiService.fetchApplicationProgress(appId)
			.then(data => setProgress(data));
	}, [appId]);

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
		
		// Render "Cannot start yet" as plain text without tag styling
		if (status.toLowerCase() === 'cannot start yet') {
			return <span className="govuk-body">{statusText}</span>;
		}
		
		return (
			<span className={statusClass}>{statusText}</span>
		);
	};


	// Helper to render link or disabled text
	const renderLink = (subsectionName: string, displayText: string, route: string) => {
		const disabled = isLinkDisabled(subsectionName);
		if (disabled) {
			return <span className="govuk-body govuk-!-font-weight-bold" style={{ color: '#626a6e' }}>{displayText}</span>;
		}
		return (
			<Link className="govuk-link govuk-!-font-weight-bold" to={buildNwlRoute(route, appId)}>
				{displayText}
			</Link>
		);
	};

	return (
		<div className="govuk-width-container">
			<main className="govuk-main-wrapper" id="main-content">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<span className="govuk-caption-l">{orgName || 'Organisation'}</span>
						<h1 className="govuk-heading-l">Necessary wayleave consent application</h1>
						<p className="govuk-hint">Complete the following sections in order to create and submit your application</p>

						<div className="govuk-!-margin-top-8">
						<h2 className="govuk-heading-m govuk-!-margin-bottom-4">1. Applicant details</h2>
						<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
						<table className="govuk-table">
							<tbody className="govuk-table__body">
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										<Link className="govuk-link govuk-!-font-weight-bold" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.APPLICANT_DETAILS, appId)}>
											Applicant details
										</Link>
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.APPLICANT_DETAILS)}
									</td>
								</tr>
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										<Link className="govuk-link govuk-!-font-weight-bold" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.NETWORK_OPERATOR_CONTACT_DETAILS, appId)}>
											Check applicant contact details
										</Link>
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.CHECK_APPLICANT_CONTACT_DETAILS)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

<div className="govuk-!-margin-top-8">
						<h2 className="govuk-heading-m govuk-!-margin-bottom-4">2. Application details</h2>
						<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
						<table className="govuk-table">
							<tbody className="govuk-table__body">
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										<Link className="govuk-link govuk-!-font-weight-bold" to={buildNwlRoute(NWL_TASK_LIST_ROUTES.TYPE_OF_USE, appId)}>
											Type of line
										</Link>
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.TYPE_OF_USE)}
									</td>
								</tr>
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.GROUNDS_FOR_APPLICATION, 'Grounds for application', NWL_TASK_LIST_ROUTES.GROUNDS_FOR_APPLICATION)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.GROUNDS_FOR_APPLICATION)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

<div className="govuk-!-margin-top-8">
						<h2 className="govuk-heading-m govuk-!-margin-bottom-4">3. Objector details</h2>
						<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
						<table className="govuk-table">
							<tbody className="govuk-table__body">
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.OBJECTOR_DETAILS, 'Objector details', NWL_TASK_LIST_ROUTES.OBJECTOR_DETAILS)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.OBJECTOR_DETAILS)}
									</td>
								</tr>
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.LANDOWNER_DETAILS, 'Landowner details', NWL_TASK_LIST_ROUTES.LANDOWNER_DETAILS)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.LANDOWNER_DETAILS)}
									</td>
								</tr>
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.REPRESENTATIVE_DETAILS, 'Representative details', NWL_TASK_LIST_ROUTES.REPRESENTATIVE_DETAILS)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.REPRESENTATIVE_DETAILS)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

				<div className="govuk-!-margin-top-8">
					<h2 className="govuk-heading-m govuk-!-margin-bottom-4">4. Land details</h2>
					<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
					<table className="govuk-table">
						<tbody className="govuk-table__body">
							<tr className="govuk-table__row">
								<td className="govuk-table__cell">
									{renderLink(NWL_SUBSECTIONS.SITE_ADDRESS, 'Site address', NWL_TASK_LIST_ROUTES.SITE_ADDRESS)}
								</td>
								<td className="govuk-table__cell govuk-!-text-align-right">
									{renderStatusTag(NWL_SUBSECTIONS.SITE_ADDRESS)}
								</td>
							</tr>
							<tr className="govuk-table__row">
								<td className="govuk-table__cell">
									{renderLink(NWL_SUBSECTIONS.LAND_REGISTRY, 'Land registry', NWL_TASK_LIST_ROUTES.LAND_REGISTRY)}
								</td>
								<td className="govuk-table__cell govuk-!-text-align-right">
									{renderStatusTag(NWL_SUBSECTIONS.LAND_REGISTRY)}
								</td>
							</tr>
							<tr className="govuk-table__row">
								<td className="govuk-table__cell">
									{renderLink(NWL_SUBSECTIONS.OS_GRID_REFERENCE, 'OS Grid reference', NWL_TASK_LIST_ROUTES.OS_GRID_REFERENCE)}
								</td>
								<td className="govuk-table__cell govuk-!-text-align-right">
									{renderStatusTag(NWL_SUBSECTIONS.OS_GRID_REFERENCE)}
								</td>
							</tr>
							<tr className="govuk-table__row">
								<td className="govuk-table__cell">
									{renderLink(NWL_SUBSECTIONS.IDENTIFYING_INFORMATION, 'Identifying information', NWL_TASK_LIST_ROUTES.IDENTIFYING_INFORMATION)}
								</td>
								<td className="govuk-table__cell govuk-!-text-align-right">
									{renderStatusTag(NWL_SUBSECTIONS.IDENTIFYING_INFORMATION)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

					<div className="govuk-!-margin-top-8">
						<h2 className="govuk-heading-m govuk-!-margin-bottom-4">5. Assets</h2>
						<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
						<table className="govuk-table">
							<tbody className="govuk-table__body">
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.ASSETS, 'Information about the lines', NWL_TASK_LIST_ROUTES.INFORMATION_ABOUT_LINES)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.ASSETS)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="govuk-!-margin-top-8">
						<h2 className="govuk-heading-m govuk-!-margin-bottom-4">6. Negotiations</h2>
						<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
						<table className="govuk-table">
							<tbody className="govuk-table__body">
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.NEGOTIATIONS, 'Existing negotiations', NWL_TASK_LIST_ROUTES.EXISTING_NEGOTIATIONS)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.NEGOTIATIONS)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="govuk-!-margin-top-8">
						<h2 className="govuk-heading-m govuk-!-margin-bottom-4">7. Additional information</h2>
						<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
						<table className="govuk-table">
							<tbody className="govuk-table__body">
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.SUPPORTING_INFORMATION, 'Related applications', NWL_TASK_LIST_ROUTES.RELATED_APPLICATIONS)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.SUPPORTING_INFORMATION)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="govuk-!-margin-top-8">
						<h2 className="govuk-heading-m govuk-!-margin-bottom-4">8. Pay and submit</h2>
						<hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-0" />
						<table className="govuk-table">
							<tbody className="govuk-table__body">
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.CHECK_YOUR_ANSWERS, 'Check your answers', NWL_TASK_LIST_ROUTES.CHECK_YOUR_ANSWERS)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.CHECK_YOUR_ANSWERS)}
									</td>
								</tr>
								<tr className="govuk-table__row">
									<td className="govuk-table__cell">
										{renderLink(NWL_SUBSECTIONS.PAY_AND_SUBMIT, 'Pay and submit', NWL_TASK_LIST_ROUTES.PAY_AND_SUBMIT)}
									</td>
									<td className="govuk-table__cell govuk-!-text-align-right">
										{renderStatusTag(NWL_SUBSECTIONS.PAY_AND_SUBMIT)}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="govuk-!-margin-top-6">
						<button
							className="govuk-button govuk-button--warning"
							type="button"
							onClick={() => navigate(`${NWL_BASE_URL}/${appId}/delete-confirmation`)}
							disabled={submitting}
						>
							Delete application
						</button>
					</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default NWLTaskList;