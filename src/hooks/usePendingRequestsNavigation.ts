import { useNavigate } from 'react-router-dom';

export const usePendingRequestsNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/user-management');
  };

  const navigateToApplicationDashboard = () => {
    navigate('/application-dashboard');
  };

  const navigateToReviewRequest = (requestId: string) => {
    navigate(`/admin/review-request/${requestId}`);
  };

  return {
    navigateToDashboard,
    navigateToApplicationDashboard,
    navigateToReviewRequest
  };
};
