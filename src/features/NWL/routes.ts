import { NWL_BASE_URL } from '../../constants/nwl';
import NWLObjectorDetailsIntroduction from './ObjectorDetails/pages/ObjectorDetailsIntroduction';
import NWLObjectorDetails from './ObjectorDetails/pages/ObjectorDetails';
import NWLObjectorAddress from './ObjectorDetails/pages/ObjectorAddress';
import NWLIsObjectorLandowner from './ObjectorDetails/pages/IsObjectorLandowner';
import NWLLandownerDetails from './ObjectorDetails/pages/LandownerDetails';
import NWLLandownerAddress from './ObjectorDetails/pages/LandownerAddress';
import NWLIsThereRepresentative from './ObjectorDetails/pages/IsThereRepresentative';
import NWLRepresentativeDetails from './ObjectorDetails/pages/RepresentativeDetails';
import NWLRepresentativeAddress from './ObjectorDetails/pages/RepresentativeAddress';
import { 
  SiteAddress, 
  CountrySelection,
  LandRegistry,
  LandRegistryInformation,
  UnregisteredLandDetails,
  OSGridReference,
  IdentifyingInformation,
  UploadSiteInformation,
  EquipmentVisibility
} from './LandDetails';
import NWLAssets from './Assets/pages/Assets';
import NWLAssetsReview from './Assets/pages/AssetsReview';
import ProvideApplicationPlan from './Assets/pages/ProvideApplicationPlan';
import AssetsMatchPlan from './Assets/pages/AssetsMatchPlan';
import NWLWhoIsApplying from './WhoIsApplying/pages/WhoIsApplying';
import NWLNetworkOperatorDetails from './ApplicantInfo/pages/NetworkOperatorDetails';
import NWLNetworkOperatorContactDetails from './ApplicantInfo/pages/NetworkOperatorContactDetails';
import { NWLTaskList } from './TaskList';
import NWLSupportingInfo from './SupportingInfo/pages/SupportingInfo';
import NWLNegotiations from './Negotiations/pages/Negotiations';
import NWLLandownerOccupantDetails from './LandownerOccupantDetails/pages/LandownerOccupantDetails';
import NWLApplicationLandDetails from './ApplicationLandDetails/pages/ApplicationLandDetails';
import NWLApplicationStatement from './ApplicationStatement/pages/ApplicationStatement';
import { 
    TypeOfUse as NWLTypeOfUse, 
    WayleaveOffer as NWLWayleaveOffer,
    GroundsForApplication as NWLGroundsForApplication,
    WayleaveType as NWLWayleaveType,
    WayleaveExpiryDate as NWLWayleaveExpiryDate,
    NoticeToRemove as NWLNoticeToRemove,
    NoticeToRemoveClear as NWLNoticeToRemoveClear,
    NoticeToRemoveUnclear as NWLNoticeToRemoveUnclear,
    ApplicationWithinThreeMonths as NWLApplicationWithinThreeMonths,
    ApplicationOutsideTimeframe as NWLApplicationOutsideTimeframe,
    StandardTerm as NWLStandardTerm,
    UploadWrittenWayleave as NWLUploadWrittenWayleave,
    UploadImpliedWayleave as NWLUploadImpliedWayleave,
    NoticeToTerminate as NWLNoticeToTerminate,
    TerminationPeriodExpired as NWLTerminationPeriodExpired,
    CannotContinueApplication as NWLCannotContinueApplication,
} from './ApplicationDetails';
import { ApplicationDeleteConfirmationPage } from '../../pages/ApplicationDeleteConfirmationPage';
import { ApplicationDeleteSuccessPage } from '../../pages/ApplicationDeleteSuccessPage';

export const nwlObjectorDetailsRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/objector-details-introduction`,
    component: NWLObjectorDetailsIntroduction,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/objector-details`,
    component: NWLObjectorDetails,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/objector-address`,
    component: NWLObjectorAddress,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/is-objector-landowner`,
    component: NWLIsObjectorLandowner,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/landowner-details`,
    component: NWLLandownerDetails,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/landowner-address`,
    component: NWLLandownerAddress,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/is-there-representative`,
    component: NWLIsThereRepresentative,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/representative-details`,
    component: NWLRepresentativeDetails,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/representative-address`,
    component: NWLRepresentativeAddress,
    auth: true,
    layout: true,
  },
];

export const nwlLandDetailsRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/site-address`,
    component: SiteAddress,
export const nwlAssetsRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/assets`,
    component: NWLAssets,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/land-country`,
    component: CountrySelection,
    path: `${NWL_BASE_URL}/:applicationId/information-about-lines`,
    component: NWLAssets,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/land-registry`,
    component: LandRegistry,
    path: `${NWL_BASE_URL}/:applicationId/assets-review`,
    component: NWLAssetsReview,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/land-registry-information`,
    component: LandRegistryInformation,
    path: `${NWL_BASE_URL}/:applicationId/application-plan`,
    component: ProvideApplicationPlan,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/unregistered-land-details`,
    component: UnregisteredLandDetails,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/os-grid-reference`,
    component: OSGridReference,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/identifying-information`,
    component: IdentifyingInformation,
    path: `${NWL_BASE_URL}/:applicationId/plan-verification`,
    component: AssetsMatchPlan,
    auth: true,
    layout: true,
  },
];

export const nwlWhoIsApplyingRoutes = [
  {
    path: `${NWL_BASE_URL}/who-is-applying`,
    component: NWLWhoIsApplying,
    auth: true,
    layout: true,
  },
];

export const nwlApplicantInfoRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/applicant-details`,
    component: NWLNetworkOperatorDetails,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/upload-site-information`,
    component: UploadSiteInformation,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/equipment-visibility`,
    component: EquipmentVisibility,
    path: `${NWL_BASE_URL}/:applicationId/network-operator-contact-details`,
    component: NWLNetworkOperatorContactDetails,
    auth: true,
    layout: true,
  },
];

export const nwlTaskListRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/task-list`,
    component: NWLTaskList,
    auth: true,
    layout: true,
  },
];

export const nwlApplicationDetailsRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/type-of-use`,
    component: NWLTypeOfUse,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/wayleave-offer`,
    component: NWLWayleaveOffer,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/grounds-for-application`,
    component: NWLGroundsForApplication,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/wayleave-type`,
    component: NWLWayleaveType,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/wayleave-expiry-date`,
    component: NWLWayleaveExpiryDate,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/notice-to-remove`,
    component: NWLNoticeToRemove,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/notice-to-remove-clear`,
    component: NWLNoticeToRemoveClear,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/notice-to-remove-unclear`,
    component: NWLNoticeToRemoveUnclear,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/application-within-three-months`,
    component: NWLApplicationWithinThreeMonths,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/application-outside-timeframe`,
    component: NWLApplicationOutsideTimeframe,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/standard-term`,
    component: NWLStandardTerm,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/upload-written-wayleave`,
    component: NWLUploadWrittenWayleave,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/upload-implied-wayleave`,
    component: NWLUploadImpliedWayleave,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/notice-to-terminate`,
    component: NWLNoticeToTerminate,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/termination-period-expired`,
    component: NWLTerminationPeriodExpired,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/cannot-continue-application`,
    component: NWLCannotContinueApplication,
    auth: true,
    layout: true,
  },
];

export const nwlLandownerOccupantRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/landowner-occupant-details`,
    component: NWLLandownerOccupantDetails,
    auth: true,
    layout: true,
  },
];

export const nwlApplicationLandRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/application-and-land-details`,
    component: NWLApplicationLandDetails,
    auth: true,
    layout: true,
  },
];

export const nwlSupportingInfoRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/supporting-information`,
    component: NWLSupportingInfo,
    auth: true,
    layout: true,
  },
];

export const nwlNegotiationsRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/negotiations`,
    component: NWLNegotiations,
    auth: true,
    layout: true,
  },
];

export const nwlApplicationStatementRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/application-statement`,
    component: NWLApplicationStatement,
    auth: true,
    layout: true,
  },
];

export const nwlDeleteRoutes = [
  {
    path: `${NWL_BASE_URL}/:applicationId/delete-confirmation`,
    component: ApplicationDeleteConfirmationPage,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/delete-success`,
    component: ApplicationDeleteSuccessPage,
    auth: true,
    layout: true,
  },
];

export const nwlRoutes = [
  ...nwlWhoIsApplyingRoutes,
  ...nwlApplicantInfoRoutes,
  ...nwlAssetsRoutes,
  ...nwlTaskListRoutes,
  ...nwlApplicationDetailsRoutes,
  ...nwlLandownerOccupantRoutes,
  ...nwlApplicationLandRoutes,
  ...nwlSupportingInfoRoutes,
  ...nwlNegotiationsRoutes,
  ...nwlApplicationStatementRoutes,
  ...nwlObjectorDetailsRoutes,
  ...nwlDeleteRoutes,
];

