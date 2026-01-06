import { useNavigate, useParams } from "react-router-dom";
import { S37_BASE_URL } from "../../../constants/s37";
import { SaveType } from "../types";

export const usePostConsultationNavigation = () => {
  const navigate = useNavigate();
  const params = useParams();
  const applicationId = params.applicationId || params.id;

  const getTaskListUrl = () => {
    return `${S37_BASE_URL}/${applicationId}/task-list`;
  };

  const navigateToTaskList = () => {
    navigate(getTaskListUrl());
  };

  const handleNavigationAfterSave = (saveType: SaveType, success: boolean) => {
    if (success && saveType === "continue") {
      navigateToTaskList();
    }
  };

  return {
    applicationId,
    getTaskListUrl,
    navigateToTaskList,
    handleNavigationAfterSave,
  };
};
