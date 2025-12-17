import { useNavigate } from 'react-router-dom';

interface UserData {
  userName: string;
  userEmail: string;
}

export const useManageUsersNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const navigateToAddUser = () => {
    navigate('/admin/add-user');
  };

  const navigateToAccessRevoked = (userData: UserData) => {
    navigate('/admin/access-revoked', { state: userData });
  };

  return {
    navigateToDashboard,
    navigateToAddUser,
    navigateToAccessRevoked
  };
};
