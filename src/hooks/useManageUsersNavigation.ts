import { useNavigate } from 'react-router-dom';

interface UserData {
  userName: string;
  userEmail: string;
}

export const useManageUsersNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/user-management');
  };

  const navigateToAddUser = () => {
    navigate('/admin/add-user');
  };

  const navigateToAccessRevoked = (userData: UserData) => {
    navigate('/admin/access-revoked', { state: userData });
  };

  const navigateToRevokeUser = (userId: string) => {
    navigate(`/admin/manage-user/${userId}`);
  };

  const navigateToReviewRequest = (accessRequestId: string) => {
    navigate(`/admin/review-request/${accessRequestId}`);
  };

  return {
    navigateToDashboard,
    navigateToAddUser,
    navigateToAccessRevoked,
    navigateToRevokeUser,
    navigateToReviewRequest
  };
};
