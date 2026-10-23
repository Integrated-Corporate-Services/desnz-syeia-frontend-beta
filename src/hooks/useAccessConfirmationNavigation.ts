import { useNavigate } from "react-router-dom";

export const useAccessConfirmationNavigation = () => {
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    navigate("/admin/user-management");
  };

  const navigateToPendingRequests = () => {
    navigate("/admin/user-management?tab=pending-requests");
  };

  return {
    navigateToDashboard,
    navigateToPendingRequests,
  };
};
