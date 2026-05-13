import { useState, useEffect } from 'react';
import { CheckYourAnswersCardsConfig, getCheckYourAnswersCards } from '../utils/checkYourAnswersCardMapper';

export const useCheckYourAnswersCards = (applicationType: 'NWL' | 'S37' | 'TLP') => {
    const [cards, setCards] = useState<CheckYourAnswersCardsConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadCards = async () => {
            try {
                setLoading(true);
                const loadedCards = await getCheckYourAnswersCards(applicationType);
                setCards(loadedCards);
            } catch (err) {
                console.error(`Failed to load CheckYourAnswers cards for ${applicationType}:`, err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadCards();
    }, [applicationType]);

    return { cards, loading, error };
};
