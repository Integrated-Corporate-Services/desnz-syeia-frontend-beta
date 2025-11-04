import TaskList from '../features/TaskList/pages/TaskList';
import NetworkOperatorDetails from '../features/ApplicantInfo/pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from '../features/ApplicantInfo/pages/NetworkOperatorContactDetails';
import Workbasket from '../features/Workbasket/pages/Workbasket';
import ApplicationSubmitted from '../features/TaskList/pages/ApplicationSubmitted';
import SignInPage from '../features/SignIn/SignInPage';
import AssetInformationForm from '../features/AssetInfo/pages/AssetInformationForm';
import ProjectOverview from '../features/ProjectOverview/pages/ProjectOverview';
import RouteMapPage from '../features/RouteMap/page/RouteMapPage';
import SensitiveAreaPage from '../features/sensitiveArea/page/SensitiveAreaPage';
import SensitiveAreaReviewPage from '../features/sensitiveArea/page/SensitiveAreaReviewPage';
import RouteOverviewPage from '../features/RouteMap/page/RouteOverviewPage';
import ComingSoon from '../features/NotFound/ComingSoon';
import EIAFeesForm from '../features/EIAFees/pages/eiafeesform';
import SupportingInfo from '../features/SupportingInfo/page/SupportingInfo';
import RouteGuidancePage from '../features/RouteMap/page/RouteGuidancePage';
import RouteDeletePage from '../features/RouteMap/page/RouteDeletePage';
import WorksOverview from '../features/WorksOverview/pages/WorksOverview';
import ConsultationPage from '../features/Consultation/pages/consultationDetailsPage';
import consulteeApplicationDetails from '../features/Consultation/pages/consulteeApplicationInfo';
import ConsultationRequestSent from '../features/Consultation/pages/ConsultationRequestSent';
import { S37_BASE_URL } from './s37';
import SendApplicationToConsultee from '../features/Consultation/pages/sendApplicationToConsultee';
import NWLWhoIsApplying from '../features/NWL/WhoIsApplying/pages/WhoIsApplying';
import ApplicantDetails from '../features/NWL/ApplicantDetails/pages/ApplicantDetails';
import NWLNetworkOperatorContactDetails from '../features/NWL/NetworkOperatorContactDetails/pages/NetworkOperatorContactDetails';
import NWLTaskList from '../features/NWL/TaskList';
import NWLAssets from '../features/NWL/Assets/pages/Assets';
import LandownerOccupantDetails from '../features/NWL/LandownerOccupantDetails/pages/LandownerOccupantDetails';
import ApplicationLandDetails from '../features/NWL/ApplicationLandDetails/pages/ApplicationLandDetails';

export const ROUTE_CONFIG = [
  {
    path: '/signin',
    component: SignInPage,
    auth: false,
    layout: false
  },
  {
    path: '/workbasket',
    component: Workbasket,
    auth: true,
    layout: true
  },
  {
    path:'/nwl/who-is-applying',
    component: NWLWhoIsApplying,
    auth: true,
    layout: true
  },
  {
    path: '/nwl/applicant-details',
    component: ApplicantDetails,
    auth: true,
    layout: true
  },
  {
    path: '/nwl/network-operator-contact-details',
    component: NWLNetworkOperatorContactDetails,
    auth: true,
    layout: true
  },
  {
    path: '/nwl/assets',
    component: NWLAssets,
    auth: true,
    layout: true
  },
  {
    path: '/nwl/task-list',
    component: NWLTaskList,
    auth: true,
    layout: true
  },
  {
    path: '/nwl/landowner-occupant-details',
    component: LandownerOccupantDetails,
    auth: true,
    layout: true
  },
  {
    path: '/nwl/application-and-land-details',
    component: ApplicationLandDetails,
    auth: true,
    layout: true
  },
  {
    path: '/',
    component: Workbasket,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/task-list`,
    component: TaskList,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/network-operator-details`,
    component: NetworkOperatorDetails,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/network-operator-contact-details`,
    component: NetworkOperatorContactDetails,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/asset-information`,
    component: AssetInformationForm,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/application-submitted`,
    component: ApplicationSubmitted,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/project-overview`,
    component: ProjectOverview,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/route-overview`,
    component: RouteOverviewPage,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/route-map`,
    component: RouteMapPage,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/route-delete`,
    component: RouteDeletePage,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/route-guidance`,
    component: RouteGuidancePage,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/sensitive-area-check`,
    component: SensitiveAreaPage,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/sensitive-area-review`,
    component: SensitiveAreaReviewPage,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/works-overview`,
    component: WorksOverview,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/parishes`,
    component: ComingSoon,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/supporting-info`,
    component: SupportingInfo,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/eia-fees`,
    component: EIAFeesForm,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/consultation-details`,
    component: ConsultationPage,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/consultee-application-details`,
    component: consulteeApplicationDetails,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/consultation/consultee-application-details`,
    component: consulteeApplicationDetails,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/consultation/:consultationId/send-application-to-consultee`,
    component: SendApplicationToConsultee,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/send-application-to-consultee`,
    component: SendApplicationToConsultee,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/post-consultation-actions`,
    component: ComingSoon,
    auth: true,
    layout: true
  },
  {
  path: `${S37_BASE_URL}/:applicationId/consultation-request-sent`,
    component: ConsultationRequestSent,
    auth: true,
    layout: true
  },
  {
    path: '*',
    component: ComingSoon,
    auth: false,
    layout: false
  }
];

export const SANDBOX_ROUTE_CONFIG = [
  
];

export const ROUTES = {
  NETWORK_OPERATOR_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-details`,
  TASK_LIST: `${S37_BASE_URL}/:applicationId/task-list`,
  NETWORK_OPERATOR_CONTACT_DETAILS: `${S37_BASE_URL}/:applicationId/network-operator-contact-details`,
};

export const BASE_URL = import.meta.env.BASE_URL;
