import { useNavigate } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';

/**
 * Custom hook for navigation within Additional Information section
 */
export const useAdditionalInformationNavigation = (appId: string | undefined) => {
  const navigate = useNavigate();

  const navigateToRelatedApplications = () => {
    if (appId) {
      navigate(`${NWL_BASE_URL}/${appId}/related-applications`);
    }
  };

  const navigateToOtherImportantInformation = () => {
    if (appId) {
      navigate(`${NWL_BASE_URL}/${appId}/other-important-information`);
    }
  };

  const navigateToTaskList = () => {
    if (appId) {
      navigate(`${NWL_BASE_URL}/${appId}/task-list`);
    }
  };

  return {
    navigateToRelatedApplications,
    navigateToOtherImportantInformation,
    navigateToTaskList,
  };
};
