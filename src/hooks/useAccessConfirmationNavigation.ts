import { useNavigate } from 'react-router-dom';

export const useAccessConfirmationNavigation = () => {
  const navigate = useNavigate();

  const navigateToPendingRequests = () => {
    navigate('/admin/pending-requests');
  };

  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return {
    navigateToPendingRequests,
    navigateToDashboard
  };
};
