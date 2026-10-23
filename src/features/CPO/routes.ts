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
import { CpoNoticesPage } from './RecordNotices';
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
    { path: `${CPO_BASE_URL}/:applicationId/notice-requirements`, component: CpoNoticesPage, auth: true, layout: true },
    { path: `${CPO_BASE_URL}/:applicationId/record-notices`, component: CpoNoticesPage, auth: true, layout: true },
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
    `${CPO_BASE_URL}/:applicationId/record-notices/:noticeStep`,
    `${CPO_BASE_URL}/:applicationId/check-and-submit`,
    `${CPO_BASE_URL}/:applicationId/pre-submission-meeting`,
    `${CPO_BASE_URL}/:applicationId/pre-submission-meeting/confirmation`,
]);
export const cpoRoutes = cpoPageRoutes.map(route =>
    backendRoutePaths.has(route.path) ? route : { ...route, auth: false, accessGuard: false });
