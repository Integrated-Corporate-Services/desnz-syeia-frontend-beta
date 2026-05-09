import { useNavigate } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';

export const useNegotiationsNavigation = (appId: string | undefined) => {
  const navigate = useNavigate();

  const navigateToTaskList = () => {
    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
  };

  const navigateToExistingNegotiations = () => {
    navigate(`${NWL_BASE_URL}/${appId}/existing-negotiations`);
  };

  const navigateToEvidenceOfNegotiations = () => {
    navigate(`${NWL_BASE_URL}/${appId}/evidence-of-negotiations`);
  };

  const navigateToWhyNoNegotiations = () => {
    navigate(`${NWL_BASE_URL}/${appId}/why-no-negotiations`);
  };

  return {
    navigateToTaskList,
    navigateToExistingNegotiations,
    navigateToEvidenceOfNegotiations,
    navigateToWhyNoNegotiations,
  };
};
