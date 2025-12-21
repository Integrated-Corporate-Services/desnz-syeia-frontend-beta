import { useNavigate } from 'react-router-dom';
import { NWL_BASE_URL } from '../constants/nwl';
import { TLP_BASE_URL } from '../constants/tlp';
import { S37_BASE_URL } from '../constants/s37';
import { APPLICATION_TYPES } from '../constants/applicationTypes';

export const useApplicationNavigation = () => {
  const navigate = useNavigate();

  const getNavigationPath = (appType: string, appId: string, route: string): string => {
    if (appType === APPLICATION_TYPES.NWL) {
      return `${NWL_BASE_URL}/${appId}/${route}`;
    } else if (appType === APPLICATION_TYPES.TLP) {
      return `${TLP_BASE_URL}/${appId}/${route}`;
    } else {
      return `${S37_BASE_URL}/${appId}/${route}`;
    }
  };

  const navigateToApplication = (appType: string, appId: string, route: string) => {
    const path = getNavigationPath(appType, appId, route);
    navigate(path);
  };

  return {
    getNavigationPath,
    navigateToApplication,
  };
};
