import { useNavigate, useParams } from 'react-router-dom';
import { S37_BASE_URL } from '../../../constants/s37';
import { SaveType } from '../types';
import { useProgressStore } from '../../../store/useProgressStore';
import { areAllRequiredSectionsCompleted } from '../../../utils/taskListUtils';

export const usePostConsultationNavigation = () => {
    const navigate = useNavigate();
    const params = useParams();
    const applicationId = params.applicationId || params.id;
    const { progress } = useProgressStore();

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
        navigate(getCheckYourAnswersUrl());
    };

    const navigateToCheckYourAnswers = () => {
        navigate(getCheckYourAnswersUrl());
    };

    const navigateAfterCompletion = () => {
        const allCompleted = areAllRequiredSectionsCompleted(progress);
        
        if (allCompleted) {
            navigate(getCheckYourAnswersUrl());
        } else {
            navigate(getTaskListUrl());
        }
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