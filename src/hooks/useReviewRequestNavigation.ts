import { useNavigate } from 'react-router-dom';

export const useReviewRequestNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/user-management');
  };

  const navigateToAccessApproved = () => {
    navigate('/admin/access-approved');
  };

  const navigateToAccessDenied = () => {
    navigate('/admin/access-denied');
  };

  return {
    navigateToDashboard,
    navigateToAccessApproved,
    navigateToAccessDenied
  };
};
