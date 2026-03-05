import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { saveConsultationOutcome, getConsultationOutcome } from '../../../services/consultationOutcomeService';
import { ConsultationOutcomeFormData, SaveType } from '../types';
import { mapApiToFormData, mapFormDataToApi } from '../utils/mappers';
import { POST_CONSULTATION_CONSTANTS } from '../constants';

export const usePostConsultationData = (applicationId: string | undefined) => {
    const [consulteesRecommendationsDetails, setConsulteesRecommendationsDetails] = useState<string>('');
    const [lpaModifications, setLpaModifications] = useState<string>('');
    const [acceptConditions, setAcceptConditions] = useState<string>('');
    const [explanation, setExplanation] = useState<string>('');
    const [consulteesRecommendations, setConsulteesRecommendations] = useState<string>('');
    const [acceptConsulteesRecommendations, setAcceptConsulteesRecommendations] = useState<string>('');
    const [consulteesExplanation, setConsulteesExplanation] = useState<string>('');
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

    // Load existing data on mount
    useEffect(() => {
        const loadExistingData = async () => {
            if (!applicationId) {
                setLoading(false);
                return;
            }

            try {
                const outcome = await getConsultationOutcome(applicationId);
                const formData = mapApiToFormData(outcome);

                if (formData.lpaModifications) setLpaModifications(formData.lpaModifications);
                if (formData.acceptConditions) setAcceptConditions(formData.acceptConditions);
                if (formData.explanation) setExplanation(formData.explanation);
                if (formData.consulteesRecommendations) setConsulteesRecommendations(formData.consulteesRecommendations);
                if (formData.acceptConsulteesRecommendations) setAcceptConsulteesRecommendations(formData.acceptConsulteesRecommendations);
                if (formData.consulteesExplanation) setConsulteesExplanation(formData.consulteesExplanation);
            } catch (err) {
                const error = err as AxiosError<{ error?: string }>;
                console.error('Error loading consultation outcome:', error);
                setError(POST_CONSULTATION_CONSTANTS.ERROR_LOAD_FAILED);
            } finally {
                setLoading(false);
            }
        };

        loadExistingData();
    }, [applicationId]);

    const saveData = async (
        saveType: SaveType,
        page?: 'lpa' | 'consultees' | 'consultees-recommendations' | 'consultees-recommendations-acceptance' | 'consultees-recommendations-reason' | 'lpa-agreement' | 'lpa-conditions' | 'lpa-reason'
    ): Promise<boolean> => {
        if (!applicationId) {
            setError(POST_CONSULTATION_CONSTANTS.ERROR_MISSING_APP_ID);
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
            await saveConsultationOutcome(applicationId, apiData);

            if (saveType === 'later') {
                alert(POST_CONSULTATION_CONSTANTS.SAVE_SUCCESS_MESSAGE);
            }

            return true;
        } catch (err) {
            const error = err as AxiosError<{ error?: string }>;
            console.error('Error saving consultation outcome:', error);
            const errorMessage = error.response?.data?.error || POST_CONSULTATION_CONSTANTS.ERROR_SAVE_FAILED;
            setError(errorMessage);
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        consulteesRecommendationsDetails,
        setConsulteesRecommendationsDetails,
        lpaModifications,
        setLpaModifications,
        acceptConditions,
        setAcceptConditions,
        explanation,
        setExplanation,
        consulteesRecommendations,
        setConsulteesRecommendations,
        acceptConsulteesRecommendations,
        setAcceptConsulteesRecommendations,
        consulteesExplanation,
        setConsulteesExplanation,
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
