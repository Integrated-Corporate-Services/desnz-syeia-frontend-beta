/**
 * Hook to load the read-only NWL Application Summary data.
 *
 * Follows the NWL convention of useState/useEffect with the section
 * service (no react-query).
 */

import { useEffect, useState } from 'react';
import { fetchNWLApplicationSummary } from '../services';
import { NWLApplicationSummaryData } from '../types';
import { NWL_APPLICATION_SUMMARY_CONSTANTS as CONSTANTS } from '../constants';

interface UseNWLApplicationSummaryResult {
    data: NWLApplicationSummaryData | null;
    loading: boolean;
    error: string | null;
}

export const useNWLApplicationSummary = (applicationId: string | undefined): UseNWLApplicationSummaryResult => {
    const [data, setData] = useState<NWLApplicationSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) {
            setError(CONSTANTS.ERROR);
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await fetchNWLApplicationSummary(applicationId);
                if (isMounted) {
                    setData(result);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : CONSTANTS.ERROR);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [applicationId]);

    return { data, loading, error };
};
