import { useNavigate } from 'react-router-dom';
import { NWL_BASE_URL } from '../../../../constants/nwl';

export const useObjectorNavigation = (appId: string | undefined) => {
  const navigate = useNavigate();

  const navigateToTaskList = () => {
    navigate(`${NWL_BASE_URL}/${appId}/task-list`);
  };

  const navigateToObjectorAddress = () => {
    navigate(`${NWL_BASE_URL}/${appId}/objector-address`);
  };

  const navigateToIsObjectorLandowner = () => {
    navigate(`${NWL_BASE_URL}/${appId}/is-objector-landowner`);
  };

  const navigateToLandownerDetails = () => {
    navigate(`${NWL_BASE_URL}/${appId}/landowner-details`);
  };

  const navigateToLandownerAddress = () => {
    navigate(`${NWL_BASE_URL}/${appId}/landowner-address`);
  };

  const navigateToIsThereRepresentative = () => {
    navigate(`${NWL_BASE_URL}/${appId}/is-there-representative`);
  };

  const navigateToRepresentativeDetails = () => {
    navigate(`${NWL_BASE_URL}/${appId}/representative-details`);
  };

  const navigateToRepresentativeAddress = () => {
    navigate(`${NWL_BASE_URL}/${appId}/representative-address`);
  };

  return {
    navigateToTaskList,
    navigateToObjectorAddress,
    navigateToIsObjectorLandowner,
    navigateToLandownerDetails,
    navigateToLandownerAddress,
    navigateToIsThereRepresentative,
    navigateToRepresentativeDetails,
    navigateToRepresentativeAddress,
  };
};
