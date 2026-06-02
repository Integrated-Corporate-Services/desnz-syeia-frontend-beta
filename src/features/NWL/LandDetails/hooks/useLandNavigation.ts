import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { buildLandDetailsRoute, LAND_DETAILS_ROUTES } from '../constants';

export const useLandNavigation = (applicationId: string) => {
  const navigate = useNavigate();

  const goToTaskList = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.TASK_LIST, applicationId));
  }, [navigate, applicationId]);

  const goToIsSiteAddressSameAsObjector = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.IS_SITE_ADDRESS_SAME_AS_OBJECTOR, applicationId));
  }, [navigate, applicationId]);

  const goToSiteAddress = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.SITE_ADDRESS, applicationId));
  }, [navigate, applicationId]);

  const goToCountrySelection = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.COUNTRY_SELECTION, applicationId));
  }, [navigate, applicationId]);

  const goToLandRegistry = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.LAND_REGISTRY, applicationId));
  }, [navigate, applicationId]);

  const goToLandRegistryInfo = useCallback(() => {
    const route = `/nwl/${applicationId}/land-registry-information`;
    navigate(route);
  }, [navigate, applicationId]);

  const goToUnregisteredLandDetails = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.UNREGISTERED_LAND, applicationId));
  }, [navigate, applicationId]);

  const goToOSGridReference = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.OS_GRID_REFERENCE, applicationId));
  }, [navigate, applicationId]);

  const goToIdentifyingInformation = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.IDENTIFYING_INFORMATION, applicationId));
  }, [navigate, applicationId]);

  const goToUploadSiteInformation = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.UPLOAD_SITE_INFORMATION, applicationId));
  }, [navigate, applicationId]);

  const goToEquipmentVisibility = useCallback(() => {
    navigate(buildLandDetailsRoute(LAND_DETAILS_ROUTES.EQUIPMENT_VISIBILITY, applicationId));
  }, [navigate, applicationId]);

  return {
    goToTaskList,
    goToIsSiteAddressSameAsObjector,
    goToSiteAddress,
    goToCountrySelection,
    goToLandRegistry,
    goToLandRegistryInfo,
    goToUnregisteredLandDetails,
    goToOSGridReference,
    goToIdentifyingInformation,
    goToUploadSiteInformation,
    goToEquipmentVisibility,
  };
};
