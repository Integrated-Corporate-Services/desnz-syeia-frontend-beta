import { useState } from 'react';
import { SensitiveAreaReview } from '../types/sensitiveAreaReviewTypes';
import { getSensitiveAreaReview, saveSensitiveAreaReview } from '../services/sensitiveAreaReviewService';

export function useSensitiveAreaReview(applicationId: string) {
  const [review, setReview] = useState<SensitiveAreaReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReview() {
    setLoading(true);
    setError(null);
    try {
      const data = await getSensitiveAreaReview(applicationId);
      setReview(data?.[0] || null);
    } catch (err) {
  setError(`Failed to fetch sensitive area review: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveReview(newReview: SensitiveAreaReview) {
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
  }

  return { review, loading, error, fetchReview, saveReview };
}
