import { useState, useEffect } from 'react';
import { CheckYourAnswersCardsConfig } from '../types/checkYourAnswersCards';
import { getNWLCheckYourAnswersCards } from '../../NWL/ApplicationSummary/checkYourAnswersCardsConfig';

export const useNWLCheckYourAnswersCards = () => {
    const [cards, setCards] = useState<CheckYourAnswersCardsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadCards = async () => {
            try {
                setLoading(true);
                setError(null);
                const loadedCards = await getNWLCheckYourAnswersCards();
                if (isMounted) {
                    setCards(loadedCards);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err as Error);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadCards();

        return () => {
            isMounted = false;
        };
    }, []);

    return { cards, loading, error };
};
