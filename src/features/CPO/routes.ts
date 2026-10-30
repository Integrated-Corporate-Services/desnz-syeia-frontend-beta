import { CPO_BASE_URL } from '../../constants/cpo';
import { ApplicationDeleteConfirmationPage } from '../../pages/ApplicationDeleteConfirmationPage';
import { ApplicationDeleteSuccessPage } from '../../pages/ApplicationDeleteSuccessPage';
import { NetworkOperatorDetails } from './ApplicantDetails';
import { NetworkOperatorContactDetails } from './CheckApplicantDetails';
import { CpoPreSubmissionMeetingPage, CpoPreSubmissionMeetingConfirmationPage } from './PreApplicationMeeting';
import { CPOWhoIsApplying } from './WhoIsApplying';
import { CpoTaskListPage, CpoTaskUnavailablePage } from './TaskList';
import { CpoOrderDetailsPage } from './OrderDetails';
import { CpoExecutiveSummaryPage } from './ExecutiveSummary';
import { CpoOrderDocumentsPage } from './OrderDocuments';
import { CpoNoticesPage, CpoNoticeRequirementsPage, CpoNoticeInspectionPage, CpoNoticeInspectionAddressPage, CpoNoticeInspectionDatePage, CpoNoticeOnlinePage, CpoNoticeWebsitePage, CpoNoticeNewspapersPage, CpoNoticeSitePage, CpoNoticePeoplePage, CpoNoticeCheckPage } from './RecordNotices';
import { CpoCheckYourAnswersPage } from './CheckAndSubmitApplication';

const cpoPageRoutes = [
    { path: `${CPO_BASE_URL}/who-is-applying`, component: CPOWhoIsApplying, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/applicant-details`, component: NetworkOperatorDetails, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/network-operator-contact-details`, component: NetworkOperatorContactDetails, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/task-list`, component: CpoTaskListPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/delete-confirmation`, component: ApplicationDeleteConfirmationPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/delete-success`, component: ApplicationDeleteSuccessPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/:taskSlug`, component: CpoTaskUnavailablePage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/order-details`, component: CpoOrderDetailsPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/notice-requirements`, component: CpoNoticeRequirementsPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices`, component: CpoNoticeRequirementsPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/requirements`, component: CpoNoticeRequirementsPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/inspection`, component: CpoNoticeInspectionPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/inspection-address`, component: CpoNoticeInspectionAddressPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/inspection-date`, component: CpoNoticeInspectionDatePage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/online`, component: CpoNoticeOnlinePage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/website`, component: CpoNoticeWebsitePage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/newspapers`, component: CpoNoticeNewspapersPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/site`, component: CpoNoticeSitePage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/people`, component: CpoNoticePeoplePage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/check`, component: CpoNoticeCheckPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices/:noticeStep`, component: CpoNoticesPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/check-and-submit`, component: CpoCheckYourAnswersPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/order-documents`, component: CpoOrderDocumentsPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/order-documents/:documentStep`, component: CpoOrderDocumentsPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/order-details/executive-summary`, component: CpoExecutiveSummaryPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/order-details/:orderStep`, component: CpoOrderDetailsPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/pre-submission-meeting`, component: CpoPreSubmissionMeetingPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/pre-submission-meeting/confirmation`, component: CpoPreSubmissionMeetingConfirmationPage, auth: true, layout: true },
];

// LOCAL (frontend-only) MODE: keep backend-connected routes authenticated; open the remaining pages without auth or access checks.
const backendRoutePaths = new Set([
    `${CPO_BASE_URL}/:applicationId/notice-requirements`,
    `${CPO_BASE_URL}/:applicationId/record-notices`,
    `${CPO_BASE_URL}/:applicationId/record-notices/requirements`,
    `${CPO_BASE_URL}/:applicationId/record-notices/inspection`,
    `${CPO_BASE_URL}/:applicationId/record-notices/inspection-address`,
    `${CPO_BASE_URL}/:applicationId/record-notices/inspection-date`,
    `${CPO_BASE_URL}/:applicationId/record-notices/online`,
    `${CPO_BASE_URL}/:applicationId/record-notices/website`,
    `${CPO_BASE_URL}/:applicationId/record-notices/newspapers`,
    `${CPO_BASE_URL}/:applicationId/record-notices/site`,
    `${CPO_BASE_URL}/:applicationId/record-notices/people`,
    `${CPO_BASE_URL}/:applicationId/record-notices/check`,
    `${CPO_BASE_URL}/:applicationId/record-notices/:noticeStep`,
    `${CPO_BASE_URL}/:applicationId/check-and-submit`,
    `${CPO_BASE_URL}/:applicationId/pre-submission-meeting`,
    `${CPO_BASE_URL}/:applicationId/pre-submission-meeting/confirmation`,
    `${CPO_BASE_URL}/:applicationId/order-details`,
    `${CPO_BASE_URL}/:applicationId/order-details/executive-summary`,
    `${CPO_BASE_URL}/:applicationId/order-details/:orderStep`,
    `${CPO_BASE_URL}/:applicationId/order-documents`,
    `${CPO_BASE_URL}/:applicationId/order-documents/:documentStep`,


]);



// LOCAL (frontend-only) MODE: no sign-in or backend access check, so the pages open with the backend off.
// Backend-wired pages (Order documents) keep real sign-in and the application access check.
// Backend-wired pages (Order details) keep real sign-in and the application access check.
// To use the backend everywhere, replace this with `export const cpoRoutes = cpoPageRoutes;`.
export const cpoRoutes = cpoPageRoutes.map((route) => {
    return backendRoutePaths.has(route.path) ? route : { ...route, auth: false, accessGuard: false };

});
