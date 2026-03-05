import { useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { SaveType } from '../types';

export const usePostConsultationNavigation = () => {
    const navigate = useNavigate();
    const params = useParams();
    const applicationId = params.applicationId || params.id;

    const getTaskListUrl = () => {
        return `${S37_BASE_URL}/${applicationId}/task-list`;
    };

    const getConsulteesRecommendationsUrl = () => {
        return `${S37_BASE_URL}/${applicationId}/post-consultation-actions/consultees-recommendations`;
    };

    const navigateToConsulteesRecommendations = () => {
        navigate(getConsulteesRecommendationsUrl());
    };

    const navigateToTaskList = () => {
        navigate(getTaskListUrl());
    };

    // Navigation after LPA Reason page
    const handleNavigationAfterLpaReason = (saveType: SaveType, success: boolean) => {
        if (success && saveType === 'continue') {
            navigateToConsulteesRecommendations();
        }
    };

    const handleNavigationAfterSaveConsultees = (saveType: SaveType, success: boolean) => {
        if (success && saveType === 'continue') {
            navigateToTaskList();
        }
    };

    return {
        applicationId,
        getTaskListUrl,
        getConsulteesRecommendationsUrl,
        navigateToTaskList,
        navigateToConsulteesRecommendations,
        handleNavigationAfterLpaReason,
        handleNavigationAfterSaveConsultees,
    };
};
