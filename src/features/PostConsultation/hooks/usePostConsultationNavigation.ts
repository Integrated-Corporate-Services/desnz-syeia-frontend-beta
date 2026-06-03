import { useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { SaveType } from '../types';
import { areAllRequiredSectionsCompleted, getNextPageUrl, TASK_NAMES } from '../../../utils/taskListUtils';

export const usePostConsultationNavigation = () => {
    const navigate = useNavigate();
    const params = useParams();
    const applicationId = params.applicationId || params.id;

    const getTaskListUrl = () => {
        return `${S37_BASE_URL}/${applicationId}/task-list`;
    };

    const getCheckYourAnswersUrl = () => {
        return `${S37_BASE_URL}/${applicationId}/check-your-answers`;
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

    const navigateToCheckYourAnswers = () => {
        const nextPageUrl = getNextPageUrl(TASK_NAMES.POST_CONSULTATION_ACTIONS, applicationId || '');
        navigate(nextPageUrl);
    };

    const navigateAfterCompletion = () => {
    
            navigate(getTaskListUrl());
      
    };

    const handleNavigationAfterLpaReason = (saveType: SaveType, success: boolean) => {
        if (success && saveType === 'continue') {
            navigateToConsulteesRecommendations();
        }
    };

    const handleNavigationAfterSaveConsultees = (saveType: SaveType, success: boolean) => {
        if (success && saveType === 'continue') {
            navigateToCheckYourAnswers();
        }
    };

    return {
        applicationId,
        getTaskListUrl,
        getCheckYourAnswersUrl,
        getConsulteesRecommendationsUrl,
        navigateToTaskList,
        navigateToConsulteesRecommendations,
        navigateToCheckYourAnswers,
        navigateAfterCompletion,
        handleNavigationAfterLpaReason,
        handleNavigationAfterSaveConsultees,
    };
};