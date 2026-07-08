import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { saveConsultationOutcome, getConsultationOutcome } from '../../../services/consultationOutcomeService';
import { ConsultationOutcomeFormData, SaveType } from '../types';
import { mapApiToFormData, mapFormDataToApi } from '../utils/mappers';
import { POST_CONSULTATION_CONSTANTS } from '../constants';
import { ERROR_MESSAGES } from '../../../constants/error';
import { useProgress } from '../../../hooks/useProgress';

export const usePostConsultationData = (applicationId: string | undefined) => {
    const { fetchProgress } = useProgress();
    const [consulteesRecommendationsDetails, setConsulteesRecommendationsDetails] = useState<string>('');
    const [lpaModifications, setLpaModifications] = useState<string>('');
    const [acceptConditions, setAcceptConditions] = useState<string>('');
    const [explanation, setExplanation] = useState<string>('');
    const [consulteesRecommendations, setConsulteesRecommendations] = useState<string>('');
    const [acceptConsulteesRecommendations, setAcceptConsulteesRecommendations] = useState<string>('');
    const [consulteesExplanation, setConsulteesExplanation] = useState<string>('');
    const [version, setVersion] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [lpaModificationsError, setLpaModificationsError] = useState<string>('');
    const [acceptConditionsError, setAcceptConditionsError] = useState<string>('');
    const [explanationError, setExplanationError] = useState<string>('');
    const [consulteesRecommendationsError, setConsulteesRecommendationsError] = useState<string>('');
    const [consulteesRecommendationsDetailsError, setConsulteesRecommendationsDetailsError] = useState<string>('');
    const [acceptConsulteesRecommendationsError, setAcceptConsulteesRecommendationsError] = useState<string>('');
    const [consulteesRecommendationsReasonError, setConsulteesRecommendationsReasonError] = useState<string>('');
    const [dataLoadTimestamp, setDataLoadTimestamp] = useState<number>(0);

    // Load existing data on mount AND whenever dataLoadTimestamp changes (for forced refresh)
    useEffect(() => {
        const loadExistingData = async () => {
            if (!applicationId) {
                setLoading(false);
                return;
            }

            // CRITICAL: Clear error and set loading when reload triggers
            setLoading(true);
            setError('');
            
            try {
                const outcome = await getConsultationOutcome(applicationId);
                const formData = mapApiToFormData(outcome);

                // ALWAYS update all state fields to ensure fresh data (no conditional updates)
                setLpaModifications(formData.lpaModifications || '');
                setAcceptConditions(formData.acceptConditions || '');
                setExplanation(formData.explanation || '');
                setConsulteesRecommendations(formData.consulteesRecommendations || '');
                setAcceptConsulteesRecommendations(formData.acceptConsulteesRecommendations || '');
                setConsulteesExplanation(formData.consulteesExplanation || '');
                
                // CRITICAL: Always update version from backend, default to 1 if not present
                const loadedVersion = outcome?.version || 1;
                setVersion(loadedVersion);
            } catch {
                setError(POST_CONSULTATION_CONSTANTS.ERROR_LOAD_FAILED);
            } finally {
                setLoading(false);
            }
        };

        loadExistingData();
    }, [applicationId, dataLoadTimestamp]);

    const saveData = async (
        saveType: SaveType,
        page?: 'lpa' | 'consultees' | 'consultees-recommendations' | 'consultees-recommendations-acceptance' | 'consultees-recommendations-reason' | 'lpa-agreement' | 'lpa-conditions' | 'lpa-reason'
    ): Promise<boolean> => {
        if (!applicationId) {
            setError(POST_CONSULTATION_CONSTANTS.ERROR_MISSING_APP_ID);
            return false;
        }

        // Prevent saving while data is loading (e.g., during automatic reload after version conflict)
        if (loading) {
            return false;
        }

        // Validate explanation fields
        setError('');
        setLpaModificationsError('');
        setAcceptConditionsError('');
        setExplanationError('');
        setConsulteesRecommendationsError('');
        setConsulteesRecommendationsDetailsError('');
        setAcceptConsulteesRecommendationsError('');
        setConsulteesRecommendationsReasonError('');

        let hasErrors = false;

        // Validate LPA fields only if on LPA page or no page specified
        if (!page || page === 'lpa' || page === 'lpa-agreement' || page === 'lpa-conditions' || page === 'lpa-reason') {
            // Validate LPA agreement page
            if (page === 'lpa-agreement' && !lpaModifications) {
                setLpaModificationsError(POST_CONSULTATION_CONSTANTS.ERROR_LPA_SELECTION_REQUIRED);
                hasErrors = true;
            }

            // Validate LPA conditions page
            if (page === 'lpa-conditions' && !acceptConditions) {
                setAcceptConditionsError(POST_CONSULTATION_CONSTANTS.ERROR_ACCEPT_CONDITIONS_REQUIRED);
                hasErrors = true;
            }

            // Validate LPA explanation if conditions were not accepted
            if (page === 'lpa-reason' && !explanation.trim()) {
                setExplanationError(POST_CONSULTATION_CONSTANTS.ERROR_LPA_EXPLANATION_REQUIRED);
                hasErrors = true;
            }
        }

        // Validate consultees fields only if on consultees page or recommendations pages or no page specified
        if (!page || page === 'consultees' || page === 'consultees-recommendations' || page === 'consultees-recommendations-acceptance' || page === 'consultees-recommendations-reason') {
            // Validate recommendations question page
            if (page === 'consultees-recommendations' && !consulteesRecommendations) {
                setConsulteesRecommendationsError(POST_CONSULTATION_CONSTANTS.ERROR_CONSULTEES_RECOMMENDATIONS_SELECTION_REQUIRED);
                hasErrors = true;
            }
            // Validate consultees acceptance page
            if (page === 'consultees-recommendations-acceptance' && !acceptConsulteesRecommendations) {
                setAcceptConsulteesRecommendationsError(POST_CONSULTATION_CONSTANTS.ERROR_ACCEPT_CONSULTEES_RECOMMENDATIONS_REQUIRED);
                hasErrors = true;
            }
            // Validate consultees reason page
            if (page === 'consultees-recommendations-reason' && !consulteesExplanation.trim()) {
                setConsulteesRecommendationsReasonError(POST_CONSULTATION_CONSTANTS.ERROR_CONSULTEES_RECOMMENDATIONS_REASON_REQUIRED);
                hasErrors = true;
            }
        }

        if (hasErrors) {
            return false;
        }

        setSaving(true);

        try {
            const formData: ConsultationOutcomeFormData = {
                lpaModifications,
                acceptConditions,
                explanation,
                consulteesRecommendations,
                acceptConsulteesRecommendations,
                consulteesExplanation,
            };

            const apiData = mapFormDataToApi(formData);
            apiData.version = version;
            const result = await saveConsultationOutcome(applicationId, apiData);

            // CRITICAL: Update version immediately from backend response
            if (result?.data?.version) {
                setVersion(result.data.version);
            }

            // Refresh progress after backend update
            if (applicationId && saveType === 'continue') {
                await fetchProgress(applicationId);
            }

            if (saveType === 'later') {
                alert(POST_CONSULTATION_CONSTANTS.SAVE_SUCCESS_MESSAGE);
            }

            return true;
        } catch (err) {
            const error = err as Error & { isVersionConflict?: boolean; statusCode?: number };
            if (error.isVersionConflict || error.statusCode === 409) {
                // Version conflict detected - force reload fresh data from server
                setDataLoadTimestamp(Date.now());
                setError(error.message || ERROR_MESSAGES.VERSION_CONFLICT);
            } else {
                const axiosError = error as AxiosError<{ error?: string }>;
                const errorMessage = axiosError.response?.data?.error || POST_CONSULTATION_CONSTANTS.ERROR_SAVE_FAILED;
                setError(errorMessage);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return false;
        } finally {
            setSaving(false);
        }
    };

    const setLpaModificationsWithClearError = (value: string) => {
        setLpaModifications(value);
        setLpaModificationsError(''); // Clear error when user interacts
    };

    const setAcceptConditionsWithClearError = (value: string) => {
        setAcceptConditions(value);
        setAcceptConditionsError(''); // Clear error when user interacts
    };

    const setExplanationWithClearError = (value: string) => {
        setExplanation(value);
        setExplanationError(''); // Clear error when user interacts
    };

    const setConsulteesRecommendationsWithClearError = (value: string) => {
        setConsulteesRecommendations(value);
        setConsulteesRecommendationsError(''); // Clear error when user interacts
    };

    const setAcceptConsulteesRecommendationsWithClearError = (value: string) => {
        setAcceptConsulteesRecommendations(value);
        setAcceptConsulteesRecommendationsError(''); // Clear error when user interacts
    };

    const setConsulteesExplanationWithClearError = (value: string) => {
        setConsulteesExplanation(value);
        setConsulteesRecommendationsReasonError(''); // Clear error when user interacts
    };

    return {
        consulteesRecommendationsDetails,
        setConsulteesRecommendationsDetails,
        lpaModifications,
        setLpaModifications: setLpaModificationsWithClearError,
        acceptConditions,
        setAcceptConditions: setAcceptConditionsWithClearError,
        explanation,
        setExplanation: setExplanationWithClearError,
        consulteesRecommendations,
        setConsulteesRecommendations: setConsulteesRecommendationsWithClearError,
        acceptConsulteesRecommendations,
        setAcceptConsulteesRecommendations: setAcceptConsulteesRecommendationsWithClearError,
        consulteesExplanation,
        setConsulteesExplanation: setConsulteesExplanationWithClearError,
        loading,
        saving,
        error,
        lpaModificationsError,
        acceptConditionsError,
        explanationError,
        consulteesRecommendationsError,
        consulteesRecommendationsDetailsError,
        acceptConsulteesRecommendationsError,
        consulteesRecommendationsReasonError,
        saveData,
    };
};
