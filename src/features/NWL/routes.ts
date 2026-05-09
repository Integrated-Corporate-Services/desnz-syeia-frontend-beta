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
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/land-country`,
    component: CountrySelection,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/land-registry`,
    component: LandRegistry,
    auth: true,
    layout: true,
  },
  {
    path: `${NWL_BASE_URL}/:applicationId/land-registry-information`,
    component: LandRegistryInformation,
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
    auth: true,
    layout: true,
  },
];
