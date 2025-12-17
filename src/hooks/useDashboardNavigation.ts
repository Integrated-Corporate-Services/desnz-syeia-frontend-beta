import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for dashboard navigation actions
 * @returns {Object} Navigation functions
 */
export const useDashboardNavigation = () => {
  const navigate = useNavigate();

  const navigateToPendingRequests = () => {
    navigate('/admin/pending-requests');
  };

  const navigateToWorkbasket = () => {
    navigate('/workbasket');
  };

  const navigateToManageUsers = () => {
    navigate('/admin/manage-users');
  };

  const navigateToOrganisationSettings = () => {
    navigate('/admin/organisation-settings');
  };

  const navigateToReviewRequest = (requestId: string) => {
    navigate(`/admin/review-request/${requestId}`);
  };

  return {
    navigateToPendingRequests,
    navigateToWorkbasket,
    navigateToManageUsers,
    navigateToOrganisationSettings,
    navigateToReviewRequest
  };
};
