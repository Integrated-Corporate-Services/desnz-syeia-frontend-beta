// import { S37_BASE_URL } from './s37';
// import { TLP_BASE_URL } from './tlp';
// import { NWL_BASE_URL } from './nwl';
// import TaskList from '../features/TaskList/pages/TaskList';
// import ConsultationResponse from '../features/Consultation/pages/ConsultationResponse';
// import ConsultationResponse2 from '../features/Consultation/pages/ConsultationResponse2';
// import ConsultationResponse3 from '../features/Consultation/pages/ConsultationResponse3';
// import ConsultationNotRequiredPage from '../features/Consultation/pages/ConsultationNotRequiredPage';
// import ConsultationRequestPage from '../features/Consultation/pages/ConsultationRequestPage';
// import ConsultationRequestsRequired from '../features/Consultation/pages/ConsultationRequestsRequired';
// import SelectOtherConsultations from '../features/Consultation/pages/SelectOtherConsultations';
// import NetworkOperatorDetails from '../features/ApplicantInfo/pages/NetworkOperatorDetails';
// import NetworkOperatorContactDetails from '../features/ApplicantInfo/pages/NetworkOperatorContactDetails';
// import Workbasket from '../features/Workbasket/pages/Workbasket';
// import ApplicationSubmitted from '../features/TaskList/pages/ApplicationSubmitted';
// import AssetInformationForm from '../features/AssetInfo/pages/AssetInformationForm';
// import ProjectOverview from '../features/ProjectOverview/pages/ProjectOverview';
// import RouteMapPage from '../features/RouteMap/page/RouteMapPage';
// import SensitiveAreaPage from '../features/sensitiveArea/page/SensitiveAreaPage';
// import SensitiveAreaReviewPage from '../features/sensitiveArea/page/SensitiveAreaReviewPage';
// import ReviewResultsPage from '../features/sensitiveArea/page/ReviewResultsPage';
// import ReviewManualPage from '../features/sensitiveArea/page/ReviewManualPage';
// import AddOtherAreasQuestionPage from '../features/sensitiveArea/page/AddOtherAreasQuestionPage';
// import AddOtherAreasPage from '../features/sensitiveArea/page/AddOtherAreasPage';
// import ReviewPolesPage from '../features/sensitiveArea/page/ReviewPolesPage';
// import ReviewDocumentsPage from '../features/sensitiveArea/page/ReviewDocumentsPage';
// import RouteOverviewPage from '../features/RouteMap/page/RouteOverviewPage';
// import EIAFeesForm from '../features/EIAFees/pages/eiafeesform';
// import SupportingInfo from '../features/SupportingInfo/page/SupportingInfo';
// import RouteGuidancePage from '../features/RouteMap/page/RouteGuidancePage';
// import RouteDeletePage from '../features/RouteMap/page/RouteDeletePage';
// import WorksOverview from '../features/WorksOverview/pages/WorksOverview';
// import ConsultationPage from '../features/Consultation/pages/consultationDetailsPage';
// import consulteeApplicationDetails from '../features/Consultation/pages/consulteeApplicationInfo';
// import ConsultationRequestSent from '../features/Consultation/pages/ConsultationRequestSent';
// import SendApplicationToConsultee from '../features/Consultation/pages/sendApplicationToConsultee';
// import NWLWhoIsApplying from '../features/NWL/WhoIsApplying/pages/WhoIsApplying';
// import NWLNetworkOperatorDetails from '../features/NWL/ApplicantInfo/pages/NetworkOperatorDetails';
// import NWLNetworkOperatorContactDetails from '../features/NWL/ApplicantInfo/pages/NetworkOperatorContactDetails';
// import NWLTaskList from '../features/NWL/TaskList';
// import NWLAssets from '../features/NWL/Assets/pages/Assets';
// import NWLSupportingInfo from '../features/NWL/SupportingInfo/pages/SupportingInfo';
// import NWLNegotiations from '../features/NWL/Negotiations/pages/Negotiations';
// import NWLLandownerOccupantDetails from '../features/NWL/LandownerOccupantDetails/pages/LandownerOccupantDetails';
// import NWLApplicationLandDetails from '../features/NWL/ApplicationLandDetails/pages/ApplicationLandDetails';
// import NWLApplicationStatement from '../features/NWL/ApplicationStatement/pages/ApplicationStatement';
// import TLPWhoIsApplying from '../features/TLP/WhoIsApplying/pages/WhoIsApplying';
// import TLPNetworkOperatorDetails from '../features/TLP/ApplicantInfo/pages/NetworkOperatorDetails';
// import TLPNetworkOperatorContactDetails from '../features/TLP/ApplicantInfo/pages/NetworkOperatorContactDetails';
// import TLPTaskList from '../features/TLP/TaskList';
// import TLPAssets from '../features/TLP/Assets/pages/Assets';
// import TLPLandownerOccupantDetails from '../features/TLP/LandownerOccupantDetails/pages/LandownerOccupantDetails';
// import TLPApplicationLandDetails from '../features/TLP/ApplicationLandDetails/pages/ApplicationLandDetails';
// import TLPSupportingInfo from '../features/TLP/SupportingInfo/pages/SupportingInfo';
// import TLPNegotiations from '../features/TLP/Negotiations/pages/Negotiations';
// import TLPApplicationStatement from '../features/TLP/ApplicationStatement/pages/ApplicationStatement';
// import EmailTemplate from '../features/Consultation/pages/emailTemplate';
// import ConsultationWithdrawnPage from '../features/Consultation/pages/ConsultationWithdrawnPage';
// import DeleteApplicationPage from '../features/TaskList/pages/DeleteApplicationPage';
// import LandingPage from '../features/SignIn/LandingPage';
// import Section37GuidancePage from '../features/SignIn/Section37GuidancePage';
// import NWLGuidancePage from '../features/SignIn/NWLGuidancePage';
// import ChooseApplicationTypePage from '../features/SignIn/ChooseApplicationTypePage';
// import AccessRequestIntroPage from '../features/SignIn/AccessRequestIntroPage';
// import ContactDetailsPage from '../features/SignIn/ContactDetailsPage';
// import WorkAddressPage from '../features/SignIn/WorkAddressPage';
// import AgentQuestionPage from '../features/SignIn/AgentQuestionPage';
// import CompanyNamePage from '../features/SignIn/CompanyNamePage';
// import SelectOrganisationsPage from '../features/SignIn/SelectOrganisationsPage';
// import AccessRequestSubmittedPage from '../features/SignIn/AccessRequestSubmittedPage';
// import OTPVerifyPage from '../features/OTPVerifyPage';
// import ReviewRequestPage from '../features/admin/pages/ReviewRequestPage';
// import AccessApprovedPage from '../features/admin/pages/AccessApprovedPage';
// import AccessDeniedPage from '../features/admin/pages/AccessDeniedPage';
// import AddUserPage from '../features/admin/pages/AddUserPage';
// import UserCreatedPage from '../features/admin/pages/UserCreatedPage';
// import AccessRevokedPage from '../features/admin/pages/AccessRevokedPage';
// import RevokeUserAccessPage from '../features/admin/pages/RevokeUserAccessPage';
// import UserManagementDashboard from '../features/admin/pages/UserManagementDashboard';
// import ManageOrganisationSettingsPage from '../features/admin/pages/ManageOrganisationSettingsPage';
// import TeamCoordinatorsPage from '../features/admin/pages/TeamCoordinatorsPage';
// import ManageTeamCoordinatorPage from '../features/admin/pages/ManageTeamCoordinatorPage';
// import ApprovedEmailDomainsPage from '../features/admin/pages/ApprovedEmailDomainsPage';
// import CheckYourAnswers from '../features/CheckYourAnswers/pages/CheckYourAnswers';
// import ApplicationSubmit from '../features/CheckYourAnswers/pages/ApplicationSubmit';
// import WhoIsApplying from '../features/WhoIsApplying/pages/WhoIsApplying';
// import Parishes from '../features/Parishes/pages/Parishes';
// import PostConsultationActions from '../features/PostConsultation/pages/PostConsultation';
// import PaymentAmountPage from '../features/Payments/pages/PaymentAmountPage';
// import InvoiceGenerationPage from '../features/Payments/pages/InvoiceGenerationPage';
// import InvoiceDownloadPage from '../features/Payments/pages/InvoiceDownloadPage';
// import PaymentMethodPage from '../features/Payments/pages/PaymentMethodPage';
// import PaymentCallbackPage from '../features/Payments/pages/PaymentCallbackPage';
// import PaymentSuccessPage from '../features/Payments/pages/PaymentSuccessPage';

// export const ROUTE_CONFIG = [
//   {
//   path: `${S37_BASE_URL}/:applicationId/payment-success`,
//   component: PaymentSuccessPage,
//   auth: true,
//   layout: true
//   },
//   {
//     path: '/payment/callback',
//     component: PaymentCallbackPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/payment-method`,
//     component: PaymentMethodPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/generate-invoice`,
//     component: InvoiceGenerationPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/invoice-download`,
//     component: InvoiceDownloadPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/choose-application',
//     component: ChooseApplicationTypePage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/pay-and-submit`,
//     component: PaymentAmountPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/landingPage',
//     component: LandingPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/s37-guidance',
//     component: Section37GuidancePage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/nwl-guidance',
//     component: NWLGuidancePage,
//     auth: false,
//     layout: true
//   },


//   {
//     path: '/otp-verify',
//     component: OTPVerifyPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/user-management',
//     component: UserManagementDashboard,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/organisation/:organisationId/settings',
//     component: ManageOrganisationSettingsPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/organisations/:organisationId/team-coordinators',
//     component: TeamCoordinatorsPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/organisations/:organisationId/team-coordinators/:coordinatorId',
//     component: ManageTeamCoordinatorPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/organisations/:organisationId/approved-domains',
//     component: ApprovedEmailDomainsPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/request-access',
//     component: AccessRequestIntroPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/request-access/contact-details',
//     component: ContactDetailsPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/request-access/work-address',
//     component: WorkAddressPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/request-access/agent-question',
//     component: AgentQuestionPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/request-access/company-name',
//     component: CompanyNamePage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/request-access/select-organisations',
//     component: SelectOrganisationsPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/request-access/select-organisation',
//     component: SelectOrganisationsPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/request-access/submitted',
//     component: AccessRequestSubmittedPage,
//     auth: false,
//     layout: true
//   },
//   {
//     path: '/admin/review-request/:requestId',
//     component: ReviewRequestPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/access-approved',
//     component: AccessApprovedPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/access-denied',
//     component: AccessDeniedPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/add-user',
//     component: AddUserPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/user-created',
//     component: UserCreatedPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/access-revoked',
//     component: AccessRevokedPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/admin/revoke-user/:userId',
//     component: RevokeUserAccessPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/workbasket',
//     component: Workbasket,
//     auth: true,
//     layout: false
//   },
//   {
//     path:`${NWL_BASE_URL}/who-is-applying`,
//     component: NWLWhoIsApplying,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/applicant-details`,
//     component: NWLNetworkOperatorDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/network-operator-contact-details`,
//     component: NWLNetworkOperatorContactDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/assets`,
//     component: NWLAssets,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/task-list`,
//     component: NWLTaskList,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/landowner-occupant-details`,
//     component: NWLLandownerOccupantDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/application-and-land-details`,
//     component: NWLApplicationLandDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/supporting-information`,
//     component: NWLSupportingInfo,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/negotiations`,
//     component: NWLNegotiations,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/application-statement`,
//     component: NWLApplicationStatement,
//     auth: true,
//     layout: true
//   },
//   {
//     path:`${TLP_BASE_URL}/who-is-applying`,
//     component: TLPWhoIsApplying,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/applicant-details`,
//     component: TLPNetworkOperatorDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/network-operator-contact-details`,
//     component: TLPNetworkOperatorContactDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/assets`,
//     component: TLPAssets,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/task-list`,
//     component: TLPTaskList,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/landowner-occupant-details`,
//     component: TLPLandownerOccupantDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/application-and-land-details`,
//     component: TLPApplicationLandDetails,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/supporting-information`,
//     component: TLPSupportingInfo,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/negotiations`,
//     component: TLPNegotiations,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/application-statement`,
//     component: TLPApplicationStatement,
//     auth: true,
//     layout: true
//   },
//   {
//     path: '/',
//     component: Workbasket,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/task-list`,
//     component: TaskList,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/network-operator-details`,
//     component: NetworkOperatorDetails,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/network-operator-contact-details`,
//     component: NetworkOperatorContactDetails,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/asset-information`,
//     component: AssetInformationForm,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/application-submitted`,
//     component: ApplicationSubmitted,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/project-overview`,
//     component: ProjectOverview,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/route-overview`,
//     component: RouteOverviewPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/route-map`,
//     component: RouteMapPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/route-delete`,
//     component: RouteDeletePage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/route-guidance`,
//     component: RouteGuidancePage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/sensitive-area-check`,
//     component: SensitiveAreaPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/sensitive-area-review`,
//     component: ReviewResultsPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/sensitive-area-review/failed`,
//     component: ReviewManualPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/sensitive-area-review/add-question`,
//     component: AddOtherAreasQuestionPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/sensitive-area-review/add-areas`,
//     component: AddOtherAreasPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/sensitive-area-review/poles`,
//     component: ReviewPolesPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/sensitive-area-review/documents`,
//     component: ReviewDocumentsPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/works-overview`,
//     component: WorksOverview,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/parishes`,
//     component: Parishes,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/supporting-info`,
//     component: SupportingInfo,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/eia-fees`,
//     component: EIAFeesForm,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/consultation-details`,
//     component: ConsultationPage,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/consultee-application-details`,
//     component: consulteeApplicationDetails,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/consultation/consultee-application-details`,
//     component: consulteeApplicationDetails,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/send-application-to-consultee`,
//     component: SendApplicationToConsultee,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/send-application-to-consultee`,
//     component: SendApplicationToConsultee,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/post-consultation-actions`,
//     component: PostConsultationActions,
//     auth: true,
//     layout: true
//   },
//   {
//   path: `${S37_BASE_URL}/:applicationId/consultation-request-sent`,
//     component: ConsultationRequestSent,
//     auth: true,
//     layout: true
//   },

//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response`,
//     component: ConsultationResponse,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response2`,
//     component: ConsultationResponse2,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response3`,
//     component: ConsultationResponse3,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/consultation-withdrawn`,
//     component: ConsultationWithdrawnPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/not-required`,
//     component: ConsultationNotRequiredPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/requests-required`,
//     component: ConsultationRequestsRequired,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/select-other-consultations`,
//     component: SelectOtherConsultations,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/consultation-request`,
//     component: ConsultationRequestPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/email-consultee`,
//     component: EmailTemplate,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/delete`,
//     component: DeleteApplicationPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${NWL_BASE_URL}/:applicationId/delete`,
//     component: DeleteApplicationPage,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${TLP_BASE_URL}/:applicationId/delete`,
//     component: DeleteApplicationPage,
//     auth: true,
//     layout: true
//   },
//   // {
//   //   path: `${S37_BASE_URL}/:applicationId/check-your-answers`,
//   //   component: CheckYourAnswers,
//   //   auth: true,
//   //   layout: true
//   // },
//   // {
//   //   path: `${S37_BASE_URL}/:applicationId/application-submit`,
//   //   component: ApplicationSubmit,
//   //   auth: true,
//   //   layout: true
//   // },
//   {
//     path: `${S37_BASE_URL}/:applicationId/check-your-answers`,
//     component: CheckYourAnswers,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/:applicationId/application-submit`,
//     component: ApplicationSubmit,
//     auth: true,
//     layout: true
//   },
//   {
//     path: `${S37_BASE_URL}/who-is-applying`,
//     component: WhoIsApplying,
//     auth: true,
//     layout: true
//   }
// ];

// export const SANDBOX_ROUTE_CONFIG = [
  
// ];

// export const ROUTES = {
//   NETWORK_OPERATOR_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-details`,
//   TASK_LIST: `${S37_BASE_URL}/:applicationId/task-list`,
//   NETWORK_OPERATOR_CONTACT_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-contact-details`,
// };

// export const BASE_URL = im
import { S37_BASE_URL } from './s37';
import { TLP_BASE_URL } from './tlp';
import { NWL_BASE_URL } from './nwl';
import TaskList from '../features/TaskList/pages/TaskList';

type RouteConfig = {
  path: string;
  component: React.ComponentType;
  auth?: boolean;
  layout?: boolean | 'minimal';
};

import ConsultationResponse from '../features/Consultation/pages/ConsultationResponse';
import ConsultationResponse2 from '../features/Consultation/pages/ConsultationResponse2';
import ConsultationResponse3 from '../features/Consultation/pages/ConsultationResponse3';
import ConsultationNotRequiredPage from '../features/Consultation/pages/ConsultationNotRequiredPage';
import ConsultationRequestPage from '../features/Consultation/pages/ConsultationRequestPage';
import ConsultationRequestsRequired from '../features/Consultation/pages/ConsultationRequestsRequired';
import SelectOtherConsultations from '../features/Consultation/pages/SelectOtherConsultations';
import NetworkOperatorDetails from '../features/ApplicantInfo/pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from '../features/ApplicantInfo/pages/NetworkOperatorContactDetails';
import Workbasket from '../features/Workbasket/pages/Workbasket';
import ApplicationSubmitted from '../features/TaskList/pages/ApplicationSubmitted';
import AssetInformationForm from '../features/AssetInfo/pages/AssetInformationForm';
import ProjectOverview from '../features/ProjectOverview/pages/ProjectOverview';
import RouteMapPage from '../features/RouteMap/page/RouteMapPage';
import SensitiveAreaPage from '../features/sensitiveArea/page/SensitiveAreaPage';
import ReviewSensitiveAreaResultsPage from '../features/sensitiveArea/page/ReviewSensitiveAreaResultsPage';
import ReviewManualPage from '../features/sensitiveArea/page/ReviewManualPage';
import AddOtherAreasQuestionPage from '../features/sensitiveArea/page/AddOtherAreasQuestionPage';
import AddOtherAreasPage from '../features/sensitiveArea/page/AddOtherAreasPage';
import ReviewPolesPage from '../features/sensitiveArea/page/ReviewPolesPage';
import ReviewDocumentsPage from '../features/sensitiveArea/page/ReviewDocumentsPage';
import RouteOverviewPage from '../features/RouteMap/page/RouteOverviewPage';
import EIAFeesForm from '../features/EIAFees/pages/eiafeesform';
import SupportingInfo from '../features/SupportingInfo/page/SupportingInfo';
import RouteGuidancePage from '../features/RouteMap/page/RouteGuidancePage';
import RouteDeletePage from '../features/RouteMap/page/RouteDeletePage';
import WorksOverview from '../features/WorksOverview/pages/WorksOverview';
import ConsultationPage from '../features/Consultation/pages/consultationDetailsPage';
import consulteeApplicationDetails from '../features/Consultation/pages/consulteeApplicationInfo';
import ConsultationRequestSent from '../features/Consultation/pages/ConsultationRequestSent';
import SendApplicationToConsultee from '../features/Consultation/pages/sendApplicationToConsultee';
import NWLWhoIsApplying from '../features/NWL/WhoIsApplying/pages/WhoIsApplying';
import NWLNetworkOperatorDetails from '../features/NWL/ApplicantInfo/pages/NetworkOperatorDetails';
import NWLNetworkOperatorContactDetails from '../features/NWL/ApplicantInfo/pages/NetworkOperatorContactDetails';
import NWLTaskList from '../features/NWL/TaskList';
import NWLAssets from '../features/NWL/Assets/pages/Assets';
import NWLSupportingInfo from '../features/NWL/SupportingInfo/pages/SupportingInfo';
import NWLNegotiations from '../features/NWL/Negotiations/pages/Negotiations';
import NWLLandownerOccupantDetails from '../features/NWL/LandownerOccupantDetails/pages/LandownerOccupantDetails';
import NWLApplicationLandDetails from '../features/NWL/ApplicationLandDetails/pages/ApplicationLandDetails';
import NWLApplicationStatement from '../features/NWL/ApplicationStatement/pages/ApplicationStatement';
import TLPWhoIsApplying from '../features/TLP/WhoIsApplying/pages/WhoIsApplying';
import TLPNetworkOperatorDetails from '../features/TLP/ApplicantInfo/pages/NetworkOperatorDetails';
import TLPNetworkOperatorContactDetails from '../features/TLP/ApplicantInfo/pages/NetworkOperatorContactDetails';
import TLPTaskList from '../features/TLP/TaskList';
import TLPAssets from '../features/TLP/Assets/pages/Assets';
import TLPLandownerOccupantDetails from '../features/TLP/LandownerOccupantDetails/pages/LandownerOccupantDetails';
import TLPApplicationLandDetails from '../features/TLP/ApplicationLandDetails/pages/ApplicationLandDetails';
import TLPSupportingInfo from '../features/TLP/SupportingInfo/pages/SupportingInfo';
import TLPNegotiations from '../features/TLP/Negotiations/pages/Negotiations';
import TLPApplicationStatement from '../features/TLP/ApplicationStatement/pages/ApplicationStatement';
import EmailTemplate from '../features/Consultation/pages/emailTemplate';
import ConsultationWithdrawnPage from '../features/Consultation/pages/ConsultationWithdrawnPage';
import DeleteApplicationPage from '../features/TaskList/pages/DeleteApplicationPage';
import LandingPage from '../features/SignIn/LandingPage';
import Section37GuidancePage from '../features/SignIn/Section37GuidancePage';
import NWLGuidancePage from '../features/SignIn/NWLGuidancePage';
import ChooseApplicationTypePage from '../features/SignIn/ChooseApplicationTypePage';
import AccessRequestIntroPage from '../features/SignIn/AccessRequestIntroPage';
import ContactDetailsPage from '../features/SignIn/ContactDetailsPage';
import WorkAddressPage from '../features/SignIn/WorkAddressPage';
import AgentQuestionPage from '../features/SignIn/AgentQuestionPage';
import CompanyNamePage from '../features/SignIn/CompanyNamePage';
import SelectOrganisationsPage from '../features/SignIn/SelectOrganisationsPage';
import AccessRequestSubmittedPage from '../features/SignIn/AccessRequestSubmittedPage';
import OTPVerifyPage from '../features/OTPVerifyPage';
import ReviewRequestPage from '../features/admin/pages/ReviewRequestPage';
import AccessApprovedPage from '../features/admin/pages/AccessApprovedPage';
import AccessDeniedPage from '../features/admin/pages/AccessDeniedPage';
import AddUserPage from '../features/admin/pages/AddUserPage';
import UserCreatedPage from '../features/admin/pages/UserCreatedPage';
import AccessRevokedPage from '../features/admin/pages/AccessRevokedPage';
import RevokeUserAccessPage from '../features/admin/pages/RevokeUserAccessPage';
import UserAccessRevokedPage from '../features/auth/pages/UserAccessRevokedPage';
import ManageUserPage from '../features/admin/pages/ManageUserPage';
import UserManagementDashboard from '../features/admin/pages/UserManagementDashboard';
import ManageOrganisationSettingsPage from '../features/admin/pages/ManageOrganisationSettingsPage';
import TeamCoordinatorsPage from '../features/admin/pages/TeamCoordinatorsPage';
import ManageTeamCoordinatorPage from '../features/admin/pages/ManageTeamCoordinatorPage';
import ApprovedEmailDomainsPage from '../features/admin/pages/ApprovedEmailDomainsPage';
import CheckYourAnswers from '../features/CheckYourAnswers/pages/CheckYourAnswers';
import ApplicationSubmit from '../features/CheckYourAnswers/pages/ApplicationSubmit';
import WhoIsApplying from '../features/WhoIsApplying/pages/WhoIsApplying';
import Parishes from '../features/Parishes/pages/Parishes';
import PostConsultationActions from '../features/PostConsultation/pages/PostConsultation';
import PaymentAmountPage from '../features/Payments/pages/PaymentAmountPage';
import InvoiceGenerationPage from '../features/Payments/pages/InvoiceGenerationPage';
import InvoiceDownloadPage from '../features/Payments/pages/InvoiceDownloadPage';
import PaymentMethodPage from '../features/Payments/pages/PaymentMethodPage';
import PaymentCallbackPage from '../features/Payments/pages/PaymentCallbackPage';
import PaymentSuccessPage from '../features/Payments/pages/PaymentSuccessPage';
// import ConsultationResponseReceived from '../features/Consultation/pages/ConsultationResponseReceived';
// import LPAConsultationForm from '../features/Consultation/pages/LPAConsultationForm';
// import LPADetailsForm from '../features/Consultation/pages/LPADetailsForm';
// import ProposedDevelopmentForm from '../features/Consultation/pages/ProposedDevelopmentForm';
// import ConsultationEvidenceNotReceived from '../features/Consultation/pages/ConsultationEvidenceNotReceived';
import ConsultationInitialQuestion from '../features/Consultation/pages/ConsultationInitialQuestion';
import ConsultationResponseInitialQuestion from '../features/Consultation/pages/ConsultationResponseInitialQuestion';
import ConsultationRequestNotSent from '../features/Consultation/pages/ConsultationRequestNotSent';
import LPADetailsPage from '../features/Consultation/pages/LPADetailsPage';
import ProposedDevelopmentPage from '../features/Consultation/pages/ProposedDevelopmentPage';
import EvidenceResponseNotReceivedPage from '../features/Consultation/pages/EvidenceResponseNotReceivedPage';

export const ROUTE_CONFIG = [
    {
        path: `${S37_BASE_URL}/:applicationId/payment-success`,
        component: PaymentSuccessPage,
        auth: true,
        layout: true,
    },

    {
    path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/evidence-response-not-received`,
    component: EvidenceResponseNotReceivedPage,
    auth: true,
    layout: true,
    },

    {
    path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/proposed-development`,
    component: ProposedDevelopmentPage,
    auth: true,
    layout: true,
   },

    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/lpa-details`,
        component: LPADetailsPage,
        auth: true,
        layout: true,
    },

    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/initial-consultation-question`,
        component: ConsultationRequestNotSent,
        auth: true,
        layout: true,
    },

    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response-initial`,
        component: ConsultationResponseInitialQuestion,
        auth: true,
        layout: true,
    },

    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/initial-question`,
        component: ConsultationInitialQuestion,
        auth: true,
        layout: true,
    },
    // {
    //   path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/evidence-not-received`,
    //   component: ConsultationEvidenceNotReceived,
    //   auth: true,
    //   layout: true
    // },
    // {
    //   path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response-received`,
    //   component: ConsultationResponseReceived,
    //   auth: true,
    //   layout: true
    // },

    // {
    //   path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/lpa-consultation-form`,
    //   component: LPAConsultationForm,
    //   auth: true,
    //   layout: true
    // },

    // {
    //   path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/lpa-details`,
    //   component: LPADetailsForm,
    //   auth: true,
    //   layout: true
    // },

    // {
    //   path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/proposed-development`,
    //   component: ProposedDevelopmentForm,
    //   auth: true,
    //   layout: true
    // },

    {
        path: '/payment/callback',
        component: PaymentCallbackPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/payment-method`,
        component: PaymentMethodPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/generate-invoice`,
        component: InvoiceGenerationPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/invoice-download`,
        component: InvoiceDownloadPage,
        auth: true,
        layout: true,
    },
    {
        path: '/choose-application',
        component: ChooseApplicationTypePage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/pay-and-submit`,
        component: PaymentAmountPage,
        auth: true,
        layout: true,
    },
    {
        path: '/landingPage',
        component: LandingPage,
        auth: false,
        layout: true,
    },
    {
        path: '/s37-guidance',
        component: Section37GuidancePage,
        auth: false,
        layout: true,
    },
    {
        path: '/nwl-guidance',
        component: NWLGuidancePage,
        auth: false,
        layout: true,
    },

    {
        path: '/otp-verify',
        component: OTPVerifyPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/user-management',
        component: UserManagementDashboard,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/organisation/:organisationId/settings',
        component: ManageOrganisationSettingsPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/organisations/:organisationId/team-coordinators',
        component: TeamCoordinatorsPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/organisations/:organisationId/team-coordinators/:coordinatorId',
        component: ManageTeamCoordinatorPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/organisations/:organisationId/approved-domains',
        component: ApprovedEmailDomainsPage,
        auth: true,
        layout: true,
    },
    {
        path: '/request-access',
        component: AccessRequestIntroPage,
        auth: false,
        layout: true,
    },
    {
        path: '/request-access/contact-details',
        component: ContactDetailsPage,
        auth: false,
        layout: true,
    },
    {
        path: '/request-access/work-address',
        component: WorkAddressPage,
        auth: false,
        layout: true,
    },
    {
        path: '/request-access/agent-question',
        component: AgentQuestionPage,
        auth: false,
        layout: true,
    },
    {
        path: '/request-access/company-name',
        component: CompanyNamePage,
        auth: false,
        layout: true,
    },
    {
        path: '/request-access/select-organisations',
        component: SelectOrganisationsPage,
        auth: false,
        layout: true,
    },
    {
        path: '/request-access/select-organisation',
        component: SelectOrganisationsPage,
        auth: false,
        layout: true,
    },
    {
        path: '/request-access/submitted',
        component: AccessRequestSubmittedPage,
        auth: false,
        layout: true,
    },
    {
        path: '/admin/review-request/:requestId',
        component: ReviewRequestPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/access-approved',
        component: AccessApprovedPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/access-denied',
        component: AccessDeniedPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/add-user',
        component: AddUserPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/user-created',
        component: UserCreatedPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/access-revoked',
        component: AccessRevokedPage,
        auth: true,
        layout: true,
    },
    {
        path: '/admin/revoke-user/:userId',
        component: RevokeUserAccessPage,
        auth: true,
        layout: true,
    },
    {
        path: '/workbasket',
        component: Workbasket,
        auth: true,
        layout: false,
    },
    {
        path: `${NWL_BASE_URL}/who-is-applying`,
        component: NWLWhoIsApplying,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/applicant-details`,
        component: NWLNetworkOperatorDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/network-operator-contact-details`,
        component: NWLNetworkOperatorContactDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/assets`,
        component: NWLAssets,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/task-list`,
        component: NWLTaskList,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/landowner-occupant-details`,
        component: NWLLandownerOccupantDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/application-and-land-details`,
        component: NWLApplicationLandDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/supporting-information`,
        component: NWLSupportingInfo,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/negotiations`,
        component: NWLNegotiations,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/application-statement`,
        component: NWLApplicationStatement,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/who-is-applying`,
        component: TLPWhoIsApplying,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/applicant-details`,
        component: TLPNetworkOperatorDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/network-operator-contact-details`,
        component: TLPNetworkOperatorContactDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/assets`,
        component: TLPAssets,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/task-list`,
        component: TLPTaskList,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/landowner-occupant-details`,
        component: TLPLandownerOccupantDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/application-and-land-details`,
        component: TLPApplicationLandDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/supporting-information`,
        component: TLPSupportingInfo,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/negotiations`,
        component: TLPNegotiations,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/application-statement`,
        component: TLPApplicationStatement,
        auth: true,
        layout: true,
    },
    {
        path: '/',
        component: Workbasket,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/task-list`,
        component: TaskList,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/network-operator-details`,
        component: NetworkOperatorDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/network-operator-contact-details`,
        component: NetworkOperatorContactDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/asset-information`,
        component: AssetInformationForm,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/application-submitted`,
        component: ApplicationSubmitted,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/project-overview`,
        component: ProjectOverview,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/route-overview`,
        component: RouteOverviewPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/route-map`,
        component: RouteMapPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/route-delete`,
        component: RouteDeletePage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/route-guidance`,
        component: RouteGuidancePage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-check`,
        component: SensitiveAreaPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-review`,
        component: SensitiveAreaReviewPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/works-overview`,
        component: WorksOverview,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/parishes`,
        component: Parishes,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/supporting-info`,
        component: SupportingInfo,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/eia-fees`,
        component: EIAFeesForm,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation-details`,
        component: ConsultationPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/consultee-application-details`,
        component: consulteeApplicationDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/consultee-application-details`,
        component: consulteeApplicationDetails,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/send-application-to-consultee`,
        component: SendApplicationToConsultee,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/send-application-to-consultee`,
        component: SendApplicationToConsultee,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/post-consultation-actions`,
        component: PostConsultationActions,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation-request-sent`,
        component: ConsultationRequestSent,
        auth: true,
        layout: true,
    },

    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response`,
        component: ConsultationResponse,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response2`,
        component: ConsultationResponse2,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response3`,
        component: ConsultationResponse3,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/consultation-withdrawn`,
        component: ConsultationWithdrawnPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/not-required`,
        component: ConsultationNotRequiredPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/requests-required`,
        component: ConsultationRequestsRequired,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/select-other-consultations`,
        component: SelectOtherConsultations,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/consultation-request`,
        component: ConsultationRequestPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/email-consultee`,
        component: EmailTemplate,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/delete`,
        component: DeleteApplicationPage,
        auth: true,
        layout: true,
    },
    {
        path: `${NWL_BASE_URL}/:applicationId/delete`,
        component: DeleteApplicationPage,
        auth: true,
        layout: true,
    },
    {
        path: `${TLP_BASE_URL}/:applicationId/delete`,
        component: DeleteApplicationPage,
        auth: true,
        layout: true,
    },
    // {
    //   path: `${S37_BASE_URL}/:applicationId/check-your-answers`,
    //   component: CheckYourAnswers,
    //   auth: true,
    //   layout: true
    // },
    // {
    //   path: `${S37_BASE_URL}/:applicationId/application-submit`,
    //   component: ApplicationSubmit,
    //   auth: true,
    //   layout: true
    // },
    {
        path: `${S37_BASE_URL}/:applicationId/check-your-answers`,
        component: CheckYourAnswers,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/application-submit`,
        component: ApplicationSubmit,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/who-is-applying`,
        component: WhoIsApplying,
        auth: true,
        layout: true,
    },
];

export const SANDBOX_ROUTE_CONFIG = [
  
];

export const ROUTES = {
  NETWORK_OPERATOR_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-details`,
  TASK_LIST: `${S37_BASE_URL}/:applicationId/task-list`,
  NETWORK_OPERATOR_CONTACT_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-contact-details`,
};

export const BASE_URL = import.meta.env.BASE_URL;