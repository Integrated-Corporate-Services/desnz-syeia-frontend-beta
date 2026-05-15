import { useState, useCallback } from 'react';
import { SensitiveAreaReview } from '../types/sensitiveAreaReviewTypes';
import { getSensitiveAreaReview, saveSensitiveAreaReview } from '../services/sensitiveAreaReviewService';

export function useSensitiveAreaReview(applicationId: string) {
    const [review, setReview] = useState<SensitiveAreaReview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReview = useCallback(async () => {
        setLoading(true);
        setError(null);
        setReview(null); // Clear existing data first
        try {
            const data = await getSensitiveAreaReview(applicationId);
            setReview(data?.[0] || null);
        } catch (err) {
            setError(`Failed to fetch sensitive area review: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    const saveReview = useCallback(
        async (newReview: SensitiveAreaReview) => {
            setLoading(true);
            setError(null);
            try {
                const saved = await saveSensitiveAreaReview(newReview);
                setReview(saved);
            } catch (err) {
                setError(`Failed to save sensitive area review: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setLoading(false);
            }
        },
        [applicationId]
    );

    return { review, loading, error, fetchReview, saveReview };
}
