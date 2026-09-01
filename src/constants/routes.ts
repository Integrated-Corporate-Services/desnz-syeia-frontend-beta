import { S37_BASE_URL } from './s37';
// import { TLP_BASE_URL } from './tlp';
import { NWL_BASE_URL } from './nwl';
import TaskList from '../features/TaskList/pages/TaskList';
import {
  PrivacyNoticePage,
  TermsAndConditionsPage,
  AccessibilityStatementPage,
  ContactPage
} from '../modules/privacy-policy';
import { CookiesSettingsPage } from '../modules/cookie-consent';

type RouteConfig = {
    path: string;
    component: React.ComponentType;
    auth?: boolean;
    layout?: boolean | 'minimal';
};

import ConsultationResponse from '../features/Consultation/pages/ConsultationResponse';
import ConsultationResponseDocuments from '../features/Consultation/pages/ConsultationResponseDocuments';
import ConsultationResponseReview from '../features/Consultation/pages/ConsultationResponseReview';
import ConsultationNotRequiredPage from '../features/Consultation/pages/ConsultationNotRequiredPage';
import ConsultationRequestPage from '../features/Consultation/pages/ConsultationRequestPage';
import ConsultationRequestsRequired from '../features/Consultation/pages/ConsultationRequestsRequired';
import SelectOtherConsultations from '../features/Consultation/pages/SelectOtherConsultations';
import NetworkOperatorDetails from '../features/ApplicantInfo/pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from '../features/ApplicantInfo/pages/NetworkOperatorContactDetails';
import ApplicationDashboard from '../features/ApplicationDashboard/pages/ApplicationDashboard';
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
import { NWLTaskList } from '../features/NWL/TaskList';
import NWLAssets from '../features/NWL/Assets/pages/Assets';
import NWLLandownerOccupantDetails from '../features/NWL/LandownerOccupantDetails/pages/LandownerOccupantDetails';
import NWLApplicationLandDetails from '../features/NWL/ApplicationLandDetails/pages/ApplicationLandDetails';
import { nwlObjectorDetailsRoutes, nwlLandDetailsRoutes } from '../features/NWL/routes';
import { nwlRoutes } from '../features/NWL/routes';

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
import EmailTemplate from '../features/Consultation/pages/emailTemplate';
import ConsultationWithdrawnPage from '../features/Consultation/pages/ConsultationWithdrawnPage';
import { ApplicationDeleteConfirmationPage } from '../pages/ApplicationDeleteConfirmationPage';
import { ApplicationDeleteSuccessPage } from '../pages/ApplicationDeleteSuccessPage';
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
// Old S37 ApplicationSummary - keep for S37 backward compatibility
import S37ApplicationSummary from '../features/CheckYourAnswers/pages/ApplicationSummary';
// Old S37 WithdrawApplication - keep for S37 backward compatibility  
import S37WithdrawApplicationPage from '../features/CheckYourAnswers/pages/WithdrawApplicationPage';
import S37WithdrawalConfirmationPage from '../features/CheckYourAnswers/pages/WithdrawalConfirmationPage';
// New modular ApplicationSummary - for NWL and future types
import ApplicationSummaryPage from '../features/ApplicationSummary/pages/ApplicationSummaryPage';
import WhoIsApplying from '../features/WhoIsApplying/pages/WhoIsApplying';
import Parishes from '../features/Parishes/pages/Parishes';
import PostConsultationLpaAgreement from '../features/PostConsultation/pages/PostConsultationLpaAgreement';
import PostConsultationLpaConditions from '../features/PostConsultation/pages/PostConsultationLpaConditions';
import PostConsultationLpaReason from '../features/PostConsultation/pages/PostConsultationLpaReason';
import PostConsultationConsulteesRecommendations from '../features/PostConsultation/pages/PostConsultationConsulteesRecommendations';
import PostConsultationConsulteesAcceptance from '../features/PostConsultation/pages/PostConsultationConsulteesAcceptance';
import PostConsultationConsulteesReason from '../features/PostConsultation/pages/PostConsultationConsulteesReason';
import PaymentAmountPage from '../features/Payments/pages/PaymentAmountPage';
import InvoiceGenerationPage from '../features/Payments/pages/InvoiceGenerationPage';
import InvoiceDownloadPage from '../features/Payments/pages/InvoiceDownloadPage';
import InvoiceGenerationErrorPage from '../features/Payments/pages/InvoiceGenerationErrorPage';
import PaymentMethodPage from '../features/Payments/pages/PaymentMethodPage';
import BankTransferPaymentPage from '../features/Payments/pages/BankTransferPaymentPage';
import BankTransferConfirmationPage from '../features/Payments/pages/BankTransferConfirmationPage';
import BankTransferSuccessPage from '../features/Payments/pages/BankTransferSuccessPage';
import PaymentCallbackPage from '../features/Payments/pages/PaymentCallbackPage';
import PaymentSuccessPage from '../features/Payments/pages/PaymentSuccessPage';
import PaymentFailurePage from '../features/Payments/pages/PaymentFailurePage';
import RouteMapOnlyPage from '../features/RouteMap/page/RouteMapOnlyPage';
import ConsultationInitialQuestion from '../features/Consultation/pages/ConsultationInitialQuestion';
import ConsultationResponseInitialQuestion from '../features/Consultation/pages/ConsultationResponseInitialQuestion';
import ConsultationRequestNotSent from '../features/Consultation/pages/ConsultationRequestNotSent';
import LPADetailsPage from '../features/Consultation/pages/LPADetailsPage';
import ProposedDevelopmentPage from '../features/Consultation/pages/ProposedDevelopmentPage';
import EvidenceResponseNotReceivedPage from '../features/Consultation/pages/EvidenceResponseNotReceivedPage';
import RemoveConsultation from '../features/Consultation/pages/RemoveConsultation';
import PublicNoticesEvidence from '../features/Consultation/pages/PublicNoticesEvidence';
import SignedOutPage from '../pages/SignedOutPage';
import ProblemWithServicePage from '../pages/ProblemWithServicePage';
import DownloadLpaConsultationFormPage from '../features/Consultation/pages/DownloadLpaConsultationFormPage';
import ClosedPage from '../pages/ClosedPage';
import StartRedirect from '../components/StartRedirect';
import { FeedbackPage } from '../modules/feedback';
// import YourDetailsPage from '../features/YourDetails/pages/YourDetailsPage';
// import ChangeFullNamePage from '../features/YourDetails/pages/ChangeFullNamePage';
// import ChangeWorkAddressPage from '../features/YourDetails/pages/ChangeWorkAddressPage';
// import ChangeAgencyNamePage from '../features/YourDetails/pages/ChangeAgencyNamePage';
// import ChangeOrganisationsPage from '../features/YourDetails/pages/ChangeOrganisationsPage';
// import ChangeOrganisationsConfirmationPage from '../features/YourDetails/pages/ChangeOrganisationsConfirmationPage';

export const ROUTE_CONFIG: RouteConfig[] = [
    // UAT Invite System Routes
    {
        path: '/access-denied',
        component: ClosedPage,
        auth: false,
        layout: false,
    },
    {
        path: '/start/:orgCode',
        component: StartRedirect,
        auth: false,
        layout: false,
    },
    // Existing Routes
    {
        path: '/cookies',
        component: CookiesSettingsPage,
        auth: false,
        layout: true,
    },
    {
        path: '/privacy',
        component: PrivacyNoticePage,
        auth: false,
        layout: true,
    },
    {
        path: '/terms',
        component: TermsAndConditionsPage,
        auth: false,
        layout: true,
    },
    {
        path: '/accessibility',
        component: AccessibilityStatementPage,
        auth: false,
        layout: true,
    },
    {
        path: '/contact',
        component: ContactPage,
        auth: false,
        layout: true,
    },
    {
        path: '/signed-out',
        component: SignedOutPage,
        auth: false,
        layout: true,
    },
    {
        path: '/problem-with-service',
        component: ProblemWithServicePage,
        auth: false,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/payment-success`,
        component: PaymentSuccessPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/payment-failed`,
        component: PaymentFailurePage,
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
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/download-form`,
        component: DownloadLpaConsultationFormPage,
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

    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/remove`,
        component: RemoveConsultation,
        auth: true,
        layout: true,
    },

    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/public-notices`,
        component: PublicNoticesEvidence,
        auth: true,
        layout: true,
    },
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
        path: `${S37_BASE_URL}/:applicationId/bank-transfer-payment`,
        component: BankTransferPaymentPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/bank-transfer-confirmation`,
        component: BankTransferConfirmationPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/bank-transfer-success`,
        component: BankTransferSuccessPage,
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
        path: `${S37_BASE_URL}/:applicationId/generate-invoice-error`,
        component: InvoiceGenerationErrorPage,
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
    // {
    //     path: '/admin/organisation/:organisationId/settings',
    //     component: ManageOrganisationSettingsPage,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: '/admin/organisations/:organisationId/team-coordinators',
    //     component: TeamCoordinatorsPage,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: '/admin/organisations/:organisationId/team-coordinators/:coordinatorId',
    //     component: ManageTeamCoordinatorPage,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: '/admin/organisations/:organisationId/approved-domains',
    //     component: ApprovedEmailDomainsPage,
    //     auth: true,
    //     layout: true,
    // },
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
    // {
    //     path: '/admin/add-user',
    //     component: AddUserPage,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: '/admin/user-created',
    //     component: UserCreatedPage,
    //     auth: true,
    //     layout: true,
    // },
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
        path: '/application-dashboard',
        component: ApplicationDashboard,
        auth: true,
        layout: false,
    },
    /* Your details routes are temporarily hidden from the UI.
    ...(!yourDetailsFeatureDisabled
        ? [
            {
                path: '/your-details',
                component: YourDetailsPage,
                auth: true,
                layout: true,
            },
            {
                path: '/your-details/change-full-name',
                component: ChangeFullNamePage,
                auth: true,
                layout: true,
            },
            {
                path: '/your-details/change-work-address',
                component: ChangeWorkAddressPage,
                auth: true,
                layout: true,
            },
            {
                path: '/your-details/change-agency-name',
                component: ChangeAgencyNamePage,
                auth: true,
                layout: true,
            },
            {
                path: '/your-details/change-organisations',
                component: ChangeOrganisationsPage,
                auth: true,
                layout: true,
            },
            {
                path: '/your-details/change-organisations/confirmation',
                component: ChangeOrganisationsConfirmationPage,
                auth: true,
                layout: true,
            },
        ]
        : []),
    */
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
        path: `${NWL_BASE_URL}/:applicationId/application-summary`,
        component: ApplicationSummaryPage,  // Shared summary (NWL uses ReviewApplicationSummary)
        auth: true,
        layout: true,
    },
    ...nwlObjectorDetailsRoutes,
    ...nwlLandDetailsRoutes,
    ...nwlRoutes,
  
    // {
    //     path: `${TLP_BASE_URL}/who-is-applying`,
    //     component: TLPWhoIsApplying,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/applicant-details`,
    //     component: TLPNetworkOperatorDetails,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/network-operator-contact-details`,
    //     component: TLPNetworkOperatorContactDetails,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/assets`,
    //     component: TLPAssets,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/task-list`,
    //     component: TLPTaskList,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/landowner-occupant-details`,
    //     component: TLPLandownerOccupantDetails,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/application-and-land-details`,
    //     component: TLPApplicationLandDetails,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/supporting-information`,
    //     component: TLPSupportingInfo,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/negotiations`,
    //     component: TLPNegotiations,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/application-statement`,
    //     component: TLPApplicationStatement,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/withdraw`,
    //     component: S37WithdrawApplicationPage,  // Unified withdraw page for all application types
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/withdrawal-confirmation`,
    //     component: S37WithdrawalConfirmationPage,  // Unified confirmation page for all application types
    //     auth: true,
    //     layout: true,
    // },
    {
        path: '/',
        component: ApplicationDashboard,
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
        path: `${S37_BASE_URL}/:applicationId/post-consultation-actions/lpa-agreement`,
        component: PostConsultationLpaAgreement,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/post-consultation-actions/lpa-conditions`,
        component: PostConsultationLpaConditions,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/post-consultation-actions/lpa-reason`,
        component: PostConsultationLpaReason,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/post-consultation-actions/consultees-recommendations`,
        component: PostConsultationConsulteesRecommendations,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/post-consultation-actions/consultees-recommendations-acceptance`,
        component: PostConsultationConsulteesAcceptance,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/post-consultation-actions/consultees-recommendations-reason`,
        component: PostConsultationConsulteesReason,
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
        component: ConsultationResponseDocuments,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/response3`,
        component: ConsultationResponseReview,
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
        path: `${S37_BASE_URL}/:applicationId/delete-confirmation`,
        component: ApplicationDeleteConfirmationPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/delete-success`,
        component: ApplicationDeleteSuccessPage,
        auth: true,
        layout: true,
    },
    
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/delete-confirmation`,
    //     component: ApplicationDeleteConfirmationPage,
    //     auth: true,
    //     layout: true,
    // },
    // {
    //     path: `${TLP_BASE_URL}/:applicationId/delete-success`,
    //     component: ApplicationDeleteSuccessPage,
    //     auth: true,
    //     layout: true,
    // },

    {
        path: `${S37_BASE_URL}/:applicationId/check-your-answers`,
        component: CheckYourAnswers,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/application-summary`,
        component: S37ApplicationSummary,  // Use old proven S37 implementation
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/withdraw`,
        component: S37WithdrawApplicationPage,  // Use old proven S37 implementation
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/withdrawal-confirmation`,
        component: S37WithdrawalConfirmationPage,  // Use old proven S37 implementation
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/who-is-applying`,
        component: WhoIsApplying,
        auth: true,
        layout: true,
    },
    {
        path: '/access-revoked',
        component: UserAccessRevokedPage,
        auth: false,
        layout: 'minimal',
    },
    {
        path: '/admin/manage-user/:userId',
        component: ManageUserPage,
        auth: true,
        layout: true,
    },

    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-review`,
        component: ReviewSensitiveAreaResultsPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-review-manual`,
        component: ReviewManualPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-add-question`,
        component: AddOtherAreasQuestionPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-add-areas`,
        component: AddOtherAreasPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-review/poles`,
        component: ReviewPolesPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/:applicationId/sensitive-area-review/documents`,
        component: ReviewDocumentsPage,
        auth: true,
        layout: true,
    },
    {
        path: `${S37_BASE_URL}/who-is-applying`,
        component: WhoIsApplying,
        auth: true,
        layout: true,
    },

    {
        path: `${S37_BASE_URL}/:applicationId/route-map-only`,
        component: RouteMapOnlyPage,
        auth: true,
        layout: true, // or true, depending on your layout needs
    },
    {
        path: '/feedback',
        component: FeedbackPage,
        auth: false,
        layout: true,
    },
];

export const SANDBOX_ROUTE_CONFIG = [];

export const FEEDBACK_PATH = '/feedback';

export const ROUTES = {
    NETWORK_OPERATOR_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-details`,
    TASK_LIST: `${S37_BASE_URL}/:applicationId/task-list`,
    NETWORK_OPERATOR_CONTACT_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-contact-details`,
};

/**
 * Get the base URL for the application
 * This reads from runtime configuration to support sub-path deployments
 * @returns The base URL path (e.g., '/' or '/app')
 */
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window._env_) {
    return window._env_.VITE_ROUTER_BASENAME || '/';
  }
  return '/';
};

// For backwards compatibility - use getBaseUrl() for dynamic access
export const BASE_URL = getBaseUrl();
