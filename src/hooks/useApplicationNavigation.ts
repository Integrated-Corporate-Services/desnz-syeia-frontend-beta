import { useNavigate } from 'react-router-dom';
import { NWL_BASE_URL } from '../constants/nwl';
import { TLP_BASE_URL } from '../constants/tlp';
import { S37_BASE_URL } from '../constants/s37';
import { APPLICATION_TYPES } from '../constants/applicationTypes';
import { BASE_URL } from '../constants/routes';

export const useApplicationNavigation = () => {
  const navigate = useNavigate();
  const NORMALISED_BASE = (BASE_URL || '').toString().replace(/\/$/, '');

  const getNavigationPath = (appType: string, appId: string, route: string): string => {
    if (appType === APPLICATION_TYPES.NWL) {
      return `${NORMALISED_BASE}${NWL_BASE_URL}/${appId}/${route}`;
    } else if (appType === APPLICATION_TYPES.TLP) {
      return `${NORMALISED_BASE}${TLP_BASE_URL}/${appId}/${route}`;
    } else {
      return `${NORMALISED_BASE}${S37_BASE_URL}/${appId}/${route}`;
    }
  };

  const navigateToApplication = (appType: string, appId: string, route: string) => {
    const path = getNavigationPath(appType, appId, route);
    const navigatePath = NORMALISED_BASE && path.startsWith(NORMALISED_BASE) ? path.slice(NORMALISED_BASE.length) : path;
    const finalPath = navigatePath.startsWith('/') ? navigatePath : `/${navigatePath}`;
    navigate(finalPath);
  };

  return {
    getNavigationPath,
    navigateToApplication,
  };
};
