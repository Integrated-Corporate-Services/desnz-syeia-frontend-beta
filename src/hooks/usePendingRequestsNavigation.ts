import { useNavigate } from 'react-router-dom';

export const usePendingRequestsNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/user-management');
  };

  const navigateToWorkbasket = () => {
    navigate('/workbasket');
  };

  const navigateToReviewRequest = (requestId: string) => {
    navigate(`/admin/review-request/${requestId}`);
  };

  return {
    navigateToDashboard,
    navigateToWorkbasket,
    navigateToReviewRequest
  };
};
