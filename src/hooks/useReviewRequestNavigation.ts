import { useNavigate } from 'react-router-dom';

interface UserDetails {
  userName: string;
  userEmail: string;
}

export const useReviewRequestNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate('/admin/user-management');
  };

  const navigateToAccessApproved = (userDetails: UserDetails) => {
    navigate('/admin/access-approved', {
      state: {
        userName: userDetails.userName,
        userEmail: userDetails.userEmail
      }
    });
  };

  const navigateToAccessDenied = (userDetails: UserDetails) => {
    navigate('/admin/access-denied', {
      state: {
        userName: userDetails.userName,
        userEmail: userDetails.userEmail
      }
    });
  };

  return {
    navigateToDashboard,
    navigateToAccessApproved,
    navigateToAccessDenied
  };
};
