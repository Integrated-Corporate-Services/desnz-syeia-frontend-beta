import { useNavigate } from 'react-router-dom';

interface UserCreatedData {
  userName: string;
  userEmail: string;
  organisation: string;
  welcomeEmailSent: boolean;
}

export const useAddUserNavigation = () => {
  const navigate = useNavigate();

  const navigateToManageUsers = () => {
    navigate('/admin/user-management');
  };

  const navigateToDashboard = () => {
    navigate('/admin/user-management');
  };

  const navigateToUserCreated = (userData: UserCreatedData) => {
    navigate('/admin/user-created', { state: userData });
  };

  const navigateToAddUser = () => {
    navigate('/admin/add-user');
  };

  return {
    navigateToManageUsers,
    navigateToDashboard,
    navigateToUserCreated,
    navigateToAddUser
  };
};
