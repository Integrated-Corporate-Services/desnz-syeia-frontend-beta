import { useNavigate } from 'react-router-dom';

export const useAccessConfirmationNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return {
    navigateToDashboard
  };
};
