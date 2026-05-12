/**
 * Check Your Answers Custom Hook
 * Fetches and manages aggregated application data
 */

import { useState, useEffect } from 'react';
import { CheckYourAnswersData } from '../types';
import { fetchCheckYourAnswersData } from '../services';

interface UseCheckYourAnswersReturn {
    data: CheckYourAnswersData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export const useCheckYourAnswers = (applicationId: string): UseCheckYourAnswersReturn => {
    const [data, setData] = useState<CheckYourAnswersData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchCheckYourAnswersData(applicationId);
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicationId) {
            fetchData();
        }
    }, [applicationId]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
};
