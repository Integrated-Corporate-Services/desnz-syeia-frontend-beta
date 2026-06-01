/**
 * Project Overview Constants
 * Contains default values and configuration for Project Overview feature
 *
 * Following GDS standard pattern for constants organization
 */

import { ProjectOverviewModel } from '../types/projectOverview';

/**
 * Empty/Initial state for Project Overview form
 * Used as default values when creating a new project overview
 */
export const EMPTY_PROJECT_OVERVIEW: ProjectOverviewModel = {
	applicationFormId: "",
	projectName: "",
	projectDescription: "",
	tallestPoleHeight: "",
	planReference: "",
	areWorkStartDatesKnown: "",
	earliestWorkStartDateMonth: "",
	earliestWorkStartDateYear: "",
	latestWorkStartDateMonth: "",
	latestWorkStartDateYear: "",
	hasRelatedApplications: "",
	relatedApplicationsDetails: "",
	hasRelatedCpo: "",
	relatedCpoDetails: "",
	eipDetails: "",
	uploadedFiles: [],
	applicationDocuments: [],
	projectId: "",
	applicationId: "",
	createdBy: "",
};
