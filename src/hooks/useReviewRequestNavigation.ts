import { useNavigate } from 'react-router-dom';

export const useReviewRequestNavigation = () => {
  const navigate = useNavigate();

  const navigateToPendingRequests = () => {
    navigate('/admin/pending-requests');
  };

  const navigateToAccessApproved = () => {
    navigate('/admin/access-approved');
  };

  const navigateToAccessDenied = () => {
    navigate('/admin/access-denied');
  };

  return {
    navigateToPendingRequests,
    navigateToAccessApproved,
    navigateToAccessDenied
  };
};
