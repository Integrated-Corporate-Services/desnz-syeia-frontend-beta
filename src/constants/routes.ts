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
    path: '/',
    component: Workbasket,
    auth: true,
    layout: true
  },
  {
    path: '/task-list',
    component: TaskList,
    auth: true,
    layout: true
  },
  {
    path: '/network-operator-details',
    component: NetworkOperatorDetails,
    auth: true,
    layout: true
  },
  {
    path: '/network-operator-contact-details',
    component: NetworkOperatorContactDetails,
    auth: true,
    layout: true
  },
  {
    path: '/asset-information',
    component: AssetInformationForm,
    auth: true,
    layout: true
  },
  {
    path: '/application-submitted',
    component: ApplicationSubmitted,
    auth: true,
    layout: true
  },
  {
    path: '/project-overview',
    component: ProjectOverview,
    auth: true,
    layout: true
  },
  {
    path: '/route-overview',
    component: RouteOverviewPage,
    auth: true,
    layout: true
  },
  {
    path: '/route-overview/:applicationId',
    component: RouteOverviewPage,
    auth: true,
    layout: true
  },
  {
    path: '/route-map',
    component: RouteMapPage,
    auth: true,
    layout: true
  },
    {
    path: '/route-delete',
    component: RouteDeletePage,
    auth: true,
    layout: true
  },
    {
    path: '/route-guidance',
    component: RouteGuidancePage,
    auth: true,
    layout: true
  },
  {
    path: '/sensitive-area-check',
    component: SensitiveAreaPage,
    auth: true,
    layout: true
  },
  {
    path: '/sensitive-area-review',
    component: SensitiveAreaReviewPage,
    auth: true,
    layout: true
  },
  {
    path: '/works-overview',
    component: ComingSoon,
    auth: true,
    layout: true
  },
  {
    path: '/parishes',
    component: ComingSoon,
    auth: true,
    layout: true
  },
  {
    path: '/supporting-info',
    component: SupportingInfo,
    auth: true,
    layout: true
  },
  {
    path: '/eia-fees',
    component: EIAFeesForm,
    auth: true,
    layout: true
  },
  {
    path: '/consultations',
    component: ComingSoon,
    auth: true,
    layout: true
  },
  {
    path: '/post-consultation-actions',
    component: ComingSoon,
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
  NETWORK_OPERATOR_DETAILS: '/network-operator-details',
  TASK_LIST: '/task-list',
  NETWORK_OPERATOR_CONTACT_DETAILS: '/network-operator-contact-details',
};

export const BASE_URL = import.meta.env.BASE_URL;
